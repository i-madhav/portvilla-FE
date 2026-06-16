import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE                       from 'three';
import gsap                             from 'gsap';
import { ScrollTrigger }                from 'gsap/ScrollTrigger';
import { IMAGE_SRCS }                        from '../lib/constants';
import { jumpToPageTop }                from '../lib/utils';
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
  tunnel : '700vh',
};

export default function SceneLoader() {
  const { progress, done } = useImagePreloader(IMAGE_SRCS);

  const [phase,            setPhase           ] = useState<Phase>('loading');
  const [loaderFading,     setLoaderFading    ] = useState(false);
  const [sceneryOpacity,   setSceneryOpacity  ] = useState(0);
  const [tunnelOpacity,    setTunnelOpacity   ] = useState(0);
  const [orbVisible,       setOrbVisible      ] = useState(false);
  const [waitlistVisible,  setWaitlistVisible ] = useState(false);

  const velocityRef       = useRef<number>(0);
  const scrollProgressRef = useRef<number>(0);
  const prevProgress      = useRef<number>(0);
  const scrollSpacerRef   = useRef<HTMLDivElement>(null);

  const parallaxOffset = useMouseParallax(phase === 'scenery');

  /*
   * orbHandle exposes stable refs + setter functions.
   * Call orbHandle.setListening() / .setSpeaking() / .setIdle() from
   * LiveKit agent callbacks once that integration lands.
   */
  const orbHandle = useOrbState();

  const handleUiCommand = useCallback((cmd: UiCommand) => {
    if (cmd.type === 'SHOW_WAITLIST') {
      setWaitlistVisible(true);
    }
  }, []);

  useLiveKitSession(orbVisible, orbHandle, { onUiCommand: handleUiCommand });

  /* Phase 1 → 2: assets loaded, fade out loader, reveal scenery */
  useEffect(() => {
    if (!done) return;
    const t1 = setTimeout(() => setLoaderFading(true), 500);
    const t2 = setTimeout(() => {
      setPhase('scenery');
      requestAnimationFrame(() => setSceneryOpacity(1));
    }, 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [done]);

  /* Phase 2 → 3: first scroll pixel triggers the tunnel */
  useEffect(() => {
    if (phase !== 'scenery') return;
    let lock = false;
    const onScroll = () => {
      if (lock || window.scrollY < 1) return;
      lock = true;
      window.removeEventListener('scroll', onScroll);
      scrollProgressRef.current = 0;
      prevProgress.current = 0;
      velocityRef.current = 0;
      setOrbVisible(false);
      jumpToPageTop();
      /* Immediately show the tunnel canvas. Its first frame paints
       * pixel-identical to the 2-D scenery at scroll progress 0, so
       * there is no visual jump. */
      setPhase('tunnel');
      setTunnelOpacity(1);
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

    /* Fade scenery opacity over the first 15 % of scroll progress so the
     * 3-D tunnel has time to render before the 2-D scenery fully disappears. */
    const SCENERY_FADE_END = 0.15;

    const st = ScrollTrigger.create({
      trigger: scrollSpacerRef.current,
      start  : 'top top',
      end    : 'bottom bottom',
      scrub  : 0.9,
      onUpdate(self) {
        const next = self.progress;
        const dp   = next - prevProgress.current;
        velocityRef.current       = THREE.MathUtils.clamp(dp * 18, -1, 1);
        prevProgress.current      = next;
        scrollProgressRef.current = next;

        /* Fade out scenery gracefully over first SCENERY_FADE_END */
        if (next < SCENERY_FADE_END) {
          const t = next / SCENERY_FADE_END;
          setSceneryOpacity(THREE.MathUtils.lerp(1, 0, t * t));
        } else {
          setSceneryOpacity(0);
        }

        const shouldShowOrb = next >= 0.82;
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
          orbDocked={waitlistVisible}
        />
      </div>

      <WaitlistPanel visible={waitlistVisible} />

      {/* Scroll spacer — in document flow, creates page scrollbar for GSAP */}
      <div
        ref={scrollSpacerRef}
        style={{ height: SPACER_HEIGHT[phase], pointerEvents: 'none' }}
      />
    </>
  );
}
