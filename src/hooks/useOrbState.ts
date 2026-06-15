import { useCallback, useRef } from 'react';

export type OrbStateType = 'idle' | 'listening' | 'speaking' | 'dormant';

/* Values set per-state (read by OrbCore via useFrame) */
const STATE_CONFIG: Record<OrbStateType, { scale: number; glow: number }> = {
  idle     : { scale: 1.00, glow: 0.52 },
  listening: { scale: 1.15, glow: 0.82 },
  speaking : { scale: 1.08, glow: 0.90 },
  dormant  : { scale: 0.62, glow: 0.20 },
};

export interface OrbHandle {
  /** Current logical state — read by OrbCore to drive mock audio */
  stateRef       : React.MutableRefObject<OrbStateType>;
  /** Smooth target scale multiplier (OrbCore lerps toward this) */
  targetScaleRef : React.MutableRefObject<number>;
  /** Smooth target glow intensity (OrbCore lerps toward this) */
  targetGlowRef  : React.MutableRefObject<number>;
  /**
   * Audio amplitude 0–1.
   * Set externally from a LiveKit audio analyser; OrbCore drives a mock
   * waveform while state === 'speaking' when this stays at 0.
   */
  amplitudeRef   : React.MutableRefObject<number>;

  /* State setters — safe to call from any React or LiveKit callback */
  setIdle      : () => void;
  setListening : () => void;
  setSpeaking  : () => void;
  setDormant   : () => void;
}

export function useOrbState(): OrbHandle {
  const stateRef       = useRef<OrbStateType>('idle');
  const targetScaleRef = useRef(STATE_CONFIG.idle.scale);
  const targetGlowRef  = useRef(STATE_CONFIG.idle.glow);
  const amplitudeRef   = useRef(0);

  const applyState = useCallback((next: OrbStateType) => {
    stateRef.current       = next;
    targetScaleRef.current = STATE_CONFIG[next].scale;
    targetGlowRef.current  = STATE_CONFIG[next].glow;
    if (next !== 'speaking') amplitudeRef.current = 0;
  }, []);

  const setIdle      = useCallback(() => applyState('idle'),      [applyState]);
  const setListening = useCallback(() => applyState('listening'), [applyState]);
  const setSpeaking  = useCallback(() => applyState('speaking'),  [applyState]);
  const setDormant   = useCallback(() => applyState('dormant'),   [applyState]);

  return { stateRef, targetScaleRef, targetGlowRef, amplitudeRef, setIdle, setListening, setSpeaking, setDormant };
}
