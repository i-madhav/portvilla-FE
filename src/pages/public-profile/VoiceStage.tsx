import { useEffect, useRef } from 'react';
import { COLORS, RADIUS, SHADOW } from '@shared-components/theme';
import { Button } from '@shared-components/ui';
import { SlideStage } from './slides/SlideStage';
import type { AgentActivity, PortfolioVoice } from './usePortfolioVoice';

/**
 * The conversation surface: a presence indicator and whatever the agent has put
 * on screen.
 *
 * Deliberately **not** the landing page's `OrbCore` — that is a three.js mesh
 * wired into the scroll-driven camera rig (entrance easing, world-space Y,
 * layer break-through). Lifting it here would mean carrying a `<Canvas>`, a
 * camera, and an entrance animation this page has no scroll journey for. A
 * portfolio is a document, so its agent gets a document-sized presence.
 *
 * `ORB_TO_PIP` / `ORB_FULLSCREEN` map onto the two positions below, which is
 * the entire layout state machine.
 */
/**
 * The dock reads as a surface of its own because it floats over the page.
 * Without an opaque backing, the controls sit directly on top of whatever the
 * visitor happens to be scrolled to and both become unreadable.
 */
const dockStyle: React.CSSProperties = {
  background: COLORS.surfaceRaised,
  border: `1px solid ${COLORS.borderSubtle}`,
  borderRadius: RADIUS.xl,
  boxShadow: SHADOW.lg,
  padding: '0.9rem 1.1rem',
};

export function VoiceStage({ voice, agentName }: { voice: PortfolioVoice; agentName: string }) {
  const { status, micBlocked, activity, layout, slide, start, stop } = voice;

  if (status === 'idle' || status === 'error') {
    return (
      <div
        style={{
          ...dockStyle,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.6rem',
        }}
      >
        <Button onClick={start}>Talk to {agentName}</Button>
        <p style={{ color: COLORS.textMuted, fontSize: '0.75rem', margin: 0, textAlign: 'center' }}>
          {status === 'error'
            ? "Couldn't start the conversation. Try again in a moment."
            : 'Uses your microphone · ask anything about this work'}
        </p>
      </div>
    );
  }

  const pip = layout === 'pip';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {slide && (
        <div
          style={{
            background: COLORS.surfaceRaised,
            border: `1px solid ${COLORS.borderSubtle}`,
            borderRadius: RADIUS.xl,
            boxShadow: SHADOW.lg,
            padding: '1.5rem',
          }}
        >
          {/*
            Keyed by slide id so React remounts on every change instead of
            diffing one template's DOM into another's — the payloads share no
            shape, and a stale node from the previous slide would be worse than
            a repaint.
          */}
          <SlideStage key={slide.slideId} slide={slide} />
        </div>
      )}

      <div
        style={{
          ...dockStyle,
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          justifyContent: pip ? 'space-between' : 'center',
          flexDirection: pip ? 'row' : 'column',
          transition: 'justify-content 250ms',
        }}
      >
        <PresenceIndicator
          activity={activity}
          amplitudeRef={voice.amplitudeRef}
          size={pip ? '2.5rem' : '5rem'}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              color: micBlocked ? COLORS.textPrimary : COLORS.textMuted,
              fontSize: '0.8rem',
              fontWeight: micBlocked ? 600 : 400,
            }}
          >
            {micBlocked
              ? "Microphone blocked — they can't hear you"
              : status === 'connecting'
                ? 'Connecting…'
                : ACTIVITY_LABEL[activity](agentName)}
          </span>
          <button
            type="button"
            onClick={stop}
            className="pv-focusable"
            style={{
              background: 'transparent',
              border: `1px solid ${COLORS.border}`,
              borderRadius: RADIUS.pill,
              color: COLORS.textSecondary,
              fontSize: '0.75rem',
              padding: '0.3rem 0.75rem',
              cursor: 'pointer',
            }}
          >
            End
          </button>
        </div>
      </div>
    </div>
  );
}

const ACTIVITY_LABEL: Record<AgentActivity, (name: string) => string> = {
  waiting: (name) => `${name} is joining…`,
  listening: () => 'Listening',
  speaking: (name) => `${name} is speaking`,
};

/**
 * A disc that breathes with the agent's voice.
 *
 * Amplitude is written straight to a CSS custom property from an animation
 * frame — routing 60 updates a second through React state would re-render the
 * whole page, slide and all, for a scale change.
 */
function PresenceIndicator({
  activity,
  amplitudeRef,
  size,
}: {
  activity: AgentActivity;
  amplitudeRef: React.MutableRefObject<number>;
  size: string;
}) {
  const discRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const el = discRef.current;
      if (el) el.style.setProperty('--pv-amp', String(1 + amplitudeRef.current * 0.35));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [amplitudeRef]);

  return (
    <div
      ref={discRef}
      role="img"
      aria-label={activity === 'speaking' ? 'Agent speaking' : 'Agent listening'}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, ${COLORS.accent}, ${COLORS.accentHover})`,
        boxShadow: activity === 'speaking' ? `0 0 2rem ${COLORS.accentSubtle}` : 'none',
        transform: 'scale(var(--pv-amp, 1))',
        transition: 'width 250ms, height 250ms, box-shadow 250ms',
        opacity: activity === 'waiting' ? 0.45 : 1,
      }}
    />
  );
}
