import { Suspense }         from 'react';
import { Canvas }           from '@react-three/fiber';
import { CAM_START }        from '../lib/constants';
import S                    from '../lib/styles';
import type { OrbHandle }   from '../hooks/useOrbState';
import TunnelScene          from './tunnel/TunnelScene';
import TunnelEffects        from './tunnel/TunnelEffects';
import OrbCore              from './orb/OrbCore';

interface TunnelOverlayProps {
  opacity           : number;
  isActive          : boolean;
  velocityRef       : React.MutableRefObject<number>;
  scrollProgressRef : React.MutableRefObject<number>;
  orbVisible        : boolean;
  orbHandle         : OrbHandle;
  orbDocked         : boolean;
}

export default function TunnelOverlay({
  opacity,
  isActive,
  velocityRef,
  scrollProgressRef,
  orbVisible,
  orbHandle,
  orbDocked,
}: TunnelOverlayProps) {
  return (
    <div style={{ ...S.fullFixed, zIndex: 3, opacity, pointerEvents: isActive ? 'auto' : 'none' }}>
      {/*
       * No opacity transition: at scroll progress 0 the tunnel frame is
       * pixel-identical to the 2-D scenery, so the swap must be instant.
       * A cross-fade would ghost the moving 3-D scene over the frozen 2-D one.
       */}
      <Canvas
        flat
        camera={{ position: [0, 0, CAM_START], fov: 60, near: 0.1, far: 300 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <TunnelScene velocityRef={velocityRef} scrollProgressRef={scrollProgressRef} />
          <OrbCore visible={orbVisible} orbHandle={orbHandle} docked={orbDocked} scrollProgressRef={scrollProgressRef} />
        </Suspense>
        <TunnelEffects scrollProgressRef={scrollProgressRef} />
      </Canvas>
    </div>
  );
}
