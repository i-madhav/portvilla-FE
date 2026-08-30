import { Suspense }         from 'react';
import { Canvas }           from '@react-three/fiber';
import { CAM_FOV, CAM_START, type OrbEntranceState } from '../lib/scene/constants';
import S                    from '../lib/ui/styles';
import type { OrbHandle }   from '../hooks/useOrbState';
import TunnelScene          from './tunnel/TunnelScene';
import TunnelEffects        from './tunnel/TunnelEffects';
import OrbCore2D            from './orb/OrbCore2D';
// OrbCore (3-D glass sphere) is preserved at ./orb/OrbCore.tsx for future use

interface TunnelOverlayProps {
  opacity           : number;
  isActive          : boolean;
  velocityRef       : React.MutableRefObject<number>;
  scrollProgressRef : React.MutableRefObject<number>;
  orbVisible        : boolean;
  orbHandle         : OrbHandle;
  orbVanishing      : boolean;
  orbEntranceRef    : React.MutableRefObject<OrbEntranceState>;
}

export default function TunnelOverlay({
  opacity,
  isActive,
  velocityRef,
  scrollProgressRef,
  orbVisible,
  orbHandle,
  orbVanishing,
  orbEntranceRef,
}: TunnelOverlayProps) {
  return (
    <div style={{ ...S.fullFixed, zIndex: 3, opacity, overflow: 'hidden', pointerEvents: isActive ? 'auto' : 'none' }}>
      {/*
       * No opacity transition: at scroll progress 0 the tunnel frame is
       * pixel-identical to the 2-D scenery, so the swap must be instant.
       * A cross-fade would ghost the moving 3-D scene over the frozen 2-D one.
       */}
      <Canvas
        flat
        camera={{ position: [0, 0, CAM_START], fov: CAM_FOV, near: 0.1, far: 300 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <TunnelScene velocityRef={velocityRef} scrollProgressRef={scrollProgressRef} />
          <OrbCore2D
            visible={orbVisible}
            orbHandle={orbHandle}
            vanishing={orbVanishing}
            orbEntranceRef={orbEntranceRef}
          />
        </Suspense>
        <TunnelEffects scrollProgressRef={scrollProgressRef} />
      </Canvas>
    </div>
  );
}
