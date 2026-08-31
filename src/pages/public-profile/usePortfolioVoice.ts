import { useCallback, useEffect, useRef, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import type { Participant, RemoteParticipant, RemoteTrackPublication } from 'livekit-client';
import { createUserSession } from '@app/lib/api';
import { UI_COMMAND_TOPIC, parseUiCommand } from '@app/lib/livekit/uiCommands';
import type { IncomingSlide } from '@typings/slides';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL ?? 'wss://portvilla-crjwmpba.livekit.cloud';

export type VoiceStatus = 'idle' | 'connecting' | 'live' | 'error';

/** What the visitor should understand the agent to be doing right now. */
export type AgentActivity = 'waiting' | 'listening' | 'speaking';

/** Where the agent's presence sits, driven by ORB_TO_PIP / ORB_FULLSCREEN. */
export type StageLayout = 'centre' | 'pip';

export interface PortfolioVoice {
  status: VoiceStatus;
  /**
   * The room is up but the microphone is not — the visitor denied it, ignored
   * the prompt, or has no input device. They can still hear the agent, so the
   * session stays live and the surface says what is wrong.
   */
  micBlocked: boolean;
  activity: AgentActivity;
  layout: StageLayout;
  /** The slide currently on screen, or null when the agent has cleared it. */
  slide: IncomingSlide | null;
  /** 0–1, updated per animation frame. A ref so the indicator never re-renders the page. */
  amplitudeRef: React.MutableRefObject<number>;
  start: () => void;
  stop: () => void;
}

/**
 * The visitor's side of a portfolio conversation.
 *
 * Connects **on an explicit click**, never on load: it turns on a microphone
 * and starts billing a voice session, neither of which should happen because
 * someone opened a link. That is the one real difference from the landing
 * page's session, which latches on when the orb scrolls into view.
 */
export function usePortfolioVoice(username: string | undefined): PortfolioVoice {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [activity, setActivity] = useState<AgentActivity>('waiting');
  const [layout, setLayout] = useState<StageLayout>('centre');
  const [slide, setSlide] = useState<IncomingSlide | null>(null);
  const [micBlocked, setMicBlocked] = useState(false);

  const amplitudeRef = useRef(0);
  const roomRef = useRef<Room | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);

  const stopAmplitude = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    void audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
    amplitudeRef.current = 0;
  }, []);

  const stop = useCallback(() => {
    stopAmplitude();
    audioElRef.current?.remove();
    audioElRef.current = null;
    void roomRef.current?.disconnect();
    roomRef.current = null;
    setStatus('idle');
    setActivity('waiting');
    setLayout('centre');
    setSlide(null);
    setMicBlocked(false);
  }, [stopAmplitude]);

  /* A conversation must not outlive the page that owns it. */
  useEffect(() => stop, [stop]);

  const start = useCallback(() => {
    if (!username || roomRef.current) return;
    setStatus('connecting');
    setMicBlocked(false);

    const room = new Room();
    roomRef.current = room;

    const trackAmplitude = (track: MediaStreamTrack) => {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(new MediaStream([track])).connect(analyser);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      const bins = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(bins);
        const rms = bins.reduce((sum, v) => sum + v * v, 0) / bins.length;
        amplitudeRef.current = Math.min(1, Math.sqrt(rms) / 128);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    room.on(RoomEvent.TrackSubscribed, (track, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (track.kind !== Track.Kind.Audio || participant.isLocal) return;
      const el = track.attach();
      el.autoplay = true;
      document.body.appendChild(el);
      audioElRef.current = el;
      trackAmplitude(track.mediaStreamTrack);
    });

    room.on(RoomEvent.TrackUnsubscribed, (track, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (track.kind !== Track.Kind.Audio || participant.isLocal) return;
      track.detach();
      audioElRef.current?.remove();
      audioElRef.current = null;
      stopAmplitude();
      setActivity('waiting');
    });

    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      if (!participant.isLocal) setActivity('listening');
    });

    room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
      const agentSpeaking = speakers.some((s) => !s.isLocal);
      if (agentSpeaking) setActivity('speaking');
      else if (room.remoteParticipants.size > 0) setActivity('listening');
    });

    room.on(RoomEvent.DataReceived, (payload, _participant, _kind, topic) => {
      if (topic !== UI_COMMAND_TOPIC) return;

      const cmd = parseUiCommand(new TextDecoder().decode(payload));
      if (!cmd) return;

      switch (cmd.type) {
        case 'SHOW_SLIDE':
          // Showing implies the stage is in use, whether or not ORB_TO_PIP
          // arrived first — the two commands are separate packets and only
          // their order is guaranteed, not their delivery.
          setSlide(cmd.payload);
          setLayout('pip');
          break;
        case 'CLEAR_CONTENT':
          setSlide(null);
          break;
        case 'ORB_TO_PIP':
          setLayout('pip');
          break;
        case 'ORB_FULLSCREEN':
          setLayout('centre');
          break;
        case 'SHOW_WAITLIST':
          break; // Intro agent only; never sent here.
      }
    });

    room.on(RoomEvent.Disconnected, () => {
      stopAmplitude();
      audioElRef.current?.remove();
      audioElRef.current = null;
      roomRef.current = null;
      setStatus('idle');
      setActivity('waiting');
    });

    createUserSession(username)
      .then(async (session) => {
        await room.connect(LIVEKIT_URL, session.participantToken);
        await room.startAudio();
        setStatus('live');

        // Deliberately after `live`, and deliberately not awaited into the
        // failure path below: a microphone prompt the visitor never answers
        // never settles, and awaiting it left the surface reading "Connecting…"
        // indefinitely while the agent was already in the room.
        room.localParticipant.setMicrophoneEnabled(true).catch((err) => {
          console.warn('[portfolio-voice] microphone unavailable', err);
          setMicBlocked(true);
        });
      })
      .catch((err) => {
        console.error('[portfolio-voice] could not start session', err);
        roomRef.current = null;
        void room.disconnect();
        setStatus('error');
      });
  }, [username, stopAmplitude]);

  return { status, micBlocked, activity, layout, slide, amplitudeRef, start, stop };
}
