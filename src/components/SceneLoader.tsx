import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE                       from 'three';
import gsap                             from 'gsap';
import { ScrollTrigger }                from 'gsap/ScrollTrigger';
import {
  IMAGE_SRCS,
  ORB_END_Y,
  ORB_ENTRANCE_EASE,
  ORB_ENTRANCE_START,
  ORB_START_Y,
  orbEntranceLinearT,
  type OrbEntranceState,
} from '../lib/scene/constants';
import { jumpToPageTop }                from '../lib/ui/utils';
import { useImagePreloader }            from '../hooks/useImagePreloader';
import { useMouseParallax }             from '../hooks/useMouseParallax';
import { useOrbState }                  from '../hooks/useOrbState';
import { useLiveKitSession }            from '../hooks/useLiveKitSession';
import type { UiCommand }               from '../hooks/useLiveKitSession';
import LoaderOverlay                    from './LoaderOverlay';
import SceneryOverlay                   from './SceneryOverlay';
import TunnelOverlay                    from './TunnelOverlay';
import WaitlistPanel                    from './WaitlistPanel';

gsap.registerPlugin(ScrollTrigger);

type Phase = 'loading' | 'scenery' | 'tunnel';

/*
 * Scroll spacer heights by phase:
 *   loading  → 100vh  (no scroll needed)
 *   scenery  → 150vh  (just enough for one scroll tick to trigger tunnel)
 *   tunnel   → 700vh  (GSAP scrubs the full layered depth journey)
 */
const SPACER_HEIGHT: Record<Phase, string> = {
  loading: '100vh',
  scenery: '150vh',
  tunnel : '500vh',
};

export default function SceneLoader() {
  const { progress, done } = useImagePreloader(IMAGE_SRCS);

  useEffect(() => {
    document.documentElement.classList.add('pv-camera-landing');
    document.body.classList.add('pv-camera-landing');

    return () => {
      document.documentElement.classList.remove('pv-camera-landing');
      document.body.classList.remove('pv-camera-landing');
    };
  }, []);

  const [phase,            setPhase           ] = useState<Phase>('loading');
  const [loaderFading,     setLoaderFading    ] = useState(false);
  const [sceneryOpacity,   setSceneryOpacity  ] = useState(0);
  const [tunnelOpacity,    setTunnelOpacity   ] = useState(0);
  const [orbVisible,       setOrbVisible      ] = useState(false);
  const [orbVanishing,     setOrbVanishing    ] = useState(false);
  const [waitlistVisible,  setWaitlistVisible ] = useState(false);

  const velocityRef       = useRef<number>(0);
  const scrollProgressRef = useRef<number>(0);
  const prevProgress      = useRef<number>(0);
  const scrollSpacerRef   = useRef<HTMLDivElement>(null);

  const orbEntranceRef = useRef<OrbEntranceState>({ t: 0, y: ORB_START_Y });

  const parallaxOffset = useMouseParallax(phase === 'scenery');

  /*
   * orbHandle exposes stable refs + setter functions.
   * Call orbHandle.setListening() / .setSpeaking() / .setIdle() from
   * LiveKit agent callbacks once that integration lands.
   */
  const orbHandle = useOrbState();

  const handleUiCommand = useCallback((cmd: UiCommand) => {
    if (cmd.type === 'SHOW_WAITLIST') {
      setOrbVanishing(true);
      setTimeout(() => setWaitlistVisible(true), 350);
    }
  }, []);

  useLiveKitSession(orbVisible, orbHandle, { onUiCommand: handleUiCommand });

  /* Phase 1 → 2: assets loaded, fade out loader, reveal scenery */
  useEffect(() => {
    if (!done) return;
    const t1 = setTimeout(() => setLoaderFading(true), 4500);
    const t2 = setTimeout(() => {
      setPhase('scenery');
      requestAnimationFrame(() => setSceneryOpacity(1));
    }, 5800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [done]);

  /* Phase 2 → 3: first scroll pixel triggers the tunnel */
  useEffect(() => {
    if (phase !== 'scenery') return;
    const onScroll = () => {
      if (window.scrollY < 1) return;
      scrollProgressRef.current = 0;
      prevProgress.current = 0;
      velocityRef.current = 0;
      orbEntranceRef.current = { t: 0, y: ORB_START_Y };
      setOrbVisible(false);
      jumpToPageTop();
      setPhase('tunnel');
      requestAnimationFrame(() => {
        setTunnelOpacity(1);
        setTimeout(() => setSceneryOpacity(0), 400);
      });
      window.removeEventListener('scroll', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [phase]);

  /* Phase 3: GSAP ScrollTrigger scrubs camera depth */
  useEffect(() => {
    if (phase !== 'tunnel' || !scrollSpacerRef.current) return;

    let decayRaf: number;
    const decay = () => { velocityRef.current *= 0.82; decayRaf = requestAnimationFrame(decay); };
    decayRaf = requestAnimationFrame(decay);

    ScrollTrigger.refresh();

    const st = ScrollTrigger.create({
      trigger: scrollSpacerRef.current,
      start  : 'top top',
      end    : 'bottom bottom',
      scrub  : 20,
      onUpdate(self) {
        const next = self.progress;
        const dp   = next - prevProgress.current;
        velocityRef.current       = THREE.MathUtils.clamp(dp * 18, -1, 1);
        prevProgress.current      = next;
        scrollProgressRef.current = next;

        if (next < ORB_ENTRANCE_START) {
          orbEntranceRef.current = { t: 0, y: ORB_START_Y };
        } else {
          const rawT   = orbEntranceLinearT(next);
          const easeFn = gsap.parseEase(ORB_ENTRANCE_EASE);
          const easedT = easeFn(rawT);
          orbEntranceRef.current.t = easedT;
          orbEntranceRef.current.y = THREE.MathUtils.lerp(ORB_START_Y, ORB_END_Y, easedT);
        }

        const shouldShowOrb = next >= ORB_ENTRANCE_START;
        setOrbVisible(shouldShowOrb);

        /* Transition orb to idle when it first appears */
        if (shouldShowOrb && orbHandle.stateRef.current === 'dormant') {
          orbHandle.setIdle();
        }
      },
    });

    return () => { st.kill(); cancelAnimationFrame(decayRaf); };
  }, [phase, orbHandle]);

  const isTunnel = phase === 'tunnel';

  return (
    <>
      {/* Fixed visual overlay — all phases render here */}
      <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 0 }}>
        {phase === 'loading' && (
          <LoaderOverlay progress={progress} fading={loaderFading} />
        )}

        <SceneryOverlay
          opacity={sceneryOpacity}
          offset={parallaxOffset}
          showScrollHint={!isTunnel}
        />

        <TunnelOverlay
          opacity={tunnelOpacity}
          isActive={isTunnel}
          velocityRef={velocityRef}
          scrollProgressRef={scrollProgressRef}
          orbVisible={orbVisible}
          orbHandle={orbHandle}
          orbVanishing={orbVanishing}
          orbEntranceRef={orbEntranceRef}
        />
      </div>

      <WaitlistPanel visible={waitlistVisible} onDismiss={() => { setWaitlistVisible(false); setOrbVanishing(false); }} />

      {/* Scroll spacer — in document flow, creates page scrollbar for GSAP */}
      <div
        ref={scrollSpacerRef}
        style={{ height: SPACER_HEIGHT[phase], pointerEvents: 'none' }}
      />
    </>
  );
}
