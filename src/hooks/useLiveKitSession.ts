import { useEffect, useRef } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  type Participant,
  type RemoteParticipant,
  type RemoteTrackPublication,
} from 'livekit-client';
import { createGuestSession } from '../lib/sessionApi';
import type { OrbHandle } from './useOrbState';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL ?? 'wss://portvilla-crjwmpba.livekit.cloud';

export type UiCommandType = 'SHOW_WAITLIST';

export interface UiCommand {
  type: UiCommandType;
}

export interface LiveKitSessionOptions {
  onUiCommand?: (cmd: UiCommand) => void;
}

/**
 * Creates a guest session on mount, then connects to the LiveKit room the
 * first time the orb becomes visible. The connection is permanent for the
 * page lifetime — orbVisible toggling (GSAP scroll) never tears it down.
 */
export function useLiveKitSession(
  orbVisible: boolean,
  orbHandle: OrbHandle,
  options: LiveKitSessionOptions = {},
) {
  /* Keep callback ref fresh so the room handler always calls latest version */
  const onUiCommandRef = useRef(options.onUiCommand);
  onUiCommandRef.current = options.onUiCommand;

  /* Stable refs — never trigger re-renders */
  const tokenRef       = useRef<string | null>(null);
  const roomNameRef    = useRef<string | null>(null);
  const hasConnected   = useRef(false);   /* one-way latch: never reset */
  const analyserRef    = useRef<AnalyserNode | null>(null);
  const rafRef         = useRef<number>(0);
  const dataArrayRef   = useRef<Uint8Array | null>(null);
  const audioElRef     = useRef<HTMLAudioElement | null>(null);
  const roomRef        = useRef<Room | null>(null);

  /* ── Step 1: fetch guest session immediately on mount ─────────────────── */
  useEffect(() => {
    let cancelled = false;

    createGuestSession()
      .then(session => {
        if (cancelled) return;
        tokenRef.current    = session.participantToken;
        roomNameRef.current = session.roomName;
      })
      .catch(err => {
        if (!cancelled) console.error('[LiveKit] session creation failed', err);
      });

    /* Teardown: disconnect room if component unmounts entirely */
    return () => {
      cancelled = true;
      roomRef.current?.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Step 2: watch for orb becoming visible, connect exactly once ─────── */
  useEffect(() => {
    if (!orbVisible)        return;   /* orb not visible yet          */
    if (hasConnected.current) return; /* already connected — do nothing */
    if (!tokenRef.current)  return;   /* token not ready yet          */

    hasConnected.current = true;      /* latch: never attempt again   */

    const room = new Room();
    roomRef.current = room;

    /* ── Amplitude tracking for orb visual ─────────────────────────────── */
    const startAmplitudeTracking = (track: MediaStreamTrack) => {
      const ctx      = new AudioContext();
      const source   = ctx.createMediaStreamSource(new MediaStream([track]));
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current  = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const rms = dataArrayRef.current.reduce((s, v) => s + v * v, 0) / dataArrayRef.current.length;
        orbHandle.amplitudeRef.current = Math.sqrt(rms) / 128;
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const stopAmplitudeTracking = () => {
      cancelAnimationFrame(rafRef.current);
      analyserRef.current  = null;
      dataArrayRef.current = null;
      orbHandle.amplitudeRef.current = 0;
    };

    /* ── Room event handlers ────────────────────────────────────────────── */
    room.on(RoomEvent.TrackSubscribed, (
      track,
      _pub: RemoteTrackPublication,
      participant: RemoteParticipant,
    ) => {
      console.log('[LiveKit] track subscribed:', track.kind, 'from', participant.identity);
      if (track.kind !== Track.Kind.Audio) return;
      if (participant.isLocal)             return;

      /* Explicitly attach to a DOM <audio> element to guarantee playback */
      const el = track.attach();
      el.autoplay = true;
      el.muted    = false;
      document.body.appendChild(el);
      audioElRef.current = el;
      console.log('[LiveKit] audio element attached, muted:', el.muted);

      startAmplitudeTracking(track.mediaStreamTrack);
    });

    room.on(RoomEvent.TrackUnsubscribed, (
      track,
      _pub: RemoteTrackPublication,
      participant: RemoteParticipant,
    ) => {
      console.log('[LiveKit] TrackUnsubscribed — kind:', track.kind, '| from:', participant.identity);
      if (track.kind !== Track.Kind.Audio) return;
      if (participant.isLocal)             return;

      track.detach();
      audioElRef.current?.remove();
      audioElRef.current = null;
      stopAmplitudeTracking();
      orbHandle.setIdle();
    });

    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log('[LiveKit] ParticipantConnected — identity:', participant.identity, '| isAgent:', participant.isAgent);
      if (!participant.isLocal) orbHandle.setListening();
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log('[LiveKit] ParticipantDisconnected — identity:', participant.identity);
    });

    /* Per-utterance speaking detection via active speakers list */
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
      const ids = speakers.map(s => s.identity);
      const agentSpeaking = speakers.some(s => !s.isLocal);
      console.log('[LiveKit] ActiveSpeakersChanged — speakers:', ids, '| agentSpeaking:', agentSpeaking);
      if (agentSpeaking) {
        orbHandle.setSpeaking();
      } else if (room.remoteParticipants.size > 0) {
        orbHandle.setListening();
      }
    });

    room.on(RoomEvent.Connected, () => {
      const participants = [...room.remoteParticipants.values()].map(p => p.identity);
      console.log('[LiveKit] Connected — room:', room.name, '| existing participants:', participants);
    });

    room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
      console.log('[LiveKit] AudioPlaybackStatusChanged — canPlaybackAudio:', room.canPlaybackAudio);
    });

    room.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
      const who = participant?.identity ?? 'unknown';
      for (const seg of segments) {
        console.log(`[LiveKit] TranscriptionReceived — ${who}: "${seg.text}" | final: ${seg.final}`);
      }
    });

    room.on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
      try {
        const text = new TextDecoder().decode(payload);
        console.log('[LiveKit] DataReceived — from:', participant?.identity ?? 'server', '| topic:', topic ?? '(none)', '| kind:', kind, '| body:', text);

        if (topic === 'ui-command') {
          console.log('[LiveKit] ui-command matched → dispatching to handler');
          const cmd = JSON.parse(text) as UiCommand;
          onUiCommandRef.current?.(cmd);
        }
      } catch (err) {
        console.warn('[LiveKit] DataReceived — could not decode payload as UTF-8 (binary?)', err);
      }
    });

    room.on(RoomEvent.Disconnected, () => {
      stopAmplitudeTracking();
      audioElRef.current?.remove();
      audioElRef.current = null;
      orbHandle.setDormant();
    });

    room
      .connect(LIVEKIT_URL, tokenRef.current)
      .then(async () => {
        console.log('[LiveKit] connected to room', roomNameRef.current, '| state:', room.state);
        await room.startAudio();
        console.log('[LiveKit] canPlaybackAudio:', room.canPlaybackAudio);
        await room.localParticipant.setMicrophoneEnabled(true);
        console.log('[LiveKit] microphone enabled');
      })
      .catch(err => {
        console.error('[LiveKit] connect failed', err);
        hasConnected.current = false; /* allow retry on next orbVisible tick */
      });

  }, [orbVisible, orbHandle]); /* eslint-disable-line react-hooks/exhaustive-deps */
}
