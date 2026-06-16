import { useRef, useState } from 'react';
import { Text }             from '@react-three/drei';
import { useFrame }         from '@react-three/fiber';
import * as THREE           from 'three';
import { FONT }             from '../../lib/constants';

interface TunnelTitleProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

/**
 * 3-D "Portvilla" title that emerges from the ground as the camera
 * approaches the mid-depth tunnel layers (Z ≈ 3–7).
 *
 * Behaviour by scroll progress:
 *   0.00–0.40  hidden below ground (Y = -1.2)
 *   0.40–0.65  rises from ground to centre (Y = -1.2 → 0.0)
 *   0.65–0.88  holds at centre, full opacity
 *   0.88–0.95  sinks back down (Y = 0.0 → -0.8), fades out
 *   0.95–1.00  hidden again
 */
export default function TunnelTitle({ scrollProgressRef }: TunnelTitleProps) {
  const groupRef = useRef<THREE.Group>(null);

  /* React state so drei <Text> re-renders with new props every frame */
  const [yPos,      setYPos     ] = useState(-1.2);
  const [opacity,   setOpacity  ] = useState(0);
  const [scale,     setScale    ] = useState(1);

  /* Smoothed tracked values */
  const smoothYRef  = useRef(-1.2);
  const smoothORef  = useRef(0);

  const TITLE_Z = 5.0;
  const color = '#d18f4d';

  useFrame(() => {
    const p    = scrollProgressRef.current;
    const lpha = 1 - Math.pow(0.001, 0.016 * 3.5);

    let targetY: number;
    let targetO: number;

    if (p < 0.30) {
      targetY = -1.4;
      targetO = 0;
    } else if (p < 0.58) {
      const t = (p - 0.30) / 0.28;
      const e = t * t * (3 - 2 * t);
      targetY = THREE.MathUtils.lerp(-1.4, 0.0, e);
      targetO = e;
    } else if (p < 0.85) {
      targetY = 0.0;
      targetO = 1;
    } else if (p < 0.94) {
      const t = (p - 0.85) / 0.09;
      const e = t * t;
      targetY = THREE.MathUtils.lerp(0.0, -1.0, e);
      targetO = THREE.MathUtils.lerp(1, 0, e);
    } else {
      targetY = -1.0;
      targetO = 0;
    }

    smoothYRef.current += (targetY - smoothYRef.current) * lpha;
    smoothORef.current += (targetO - smoothORef.current) * lpha;

    /* Commit to React state only when changed meaningfully */
    const yNext = smoothYRef.current;
    const oNext = smoothORef.current;

    if (groupRef.current) {
      groupRef.current.position.y = yNext;
    }

    /* Throttle React state commits to ~every-other-frame */
    if (Math.abs(yNext - yPos) > 0.005) setYPos(yNext);
    if (Math.abs(oNext - opacity) > 0.01) setOpacity(oNext);
  });

  if (opacity < 0.005) return null;

  return (
    <group ref={groupRef} position={[0, -1.4, TITLE_Z]}>
      <Text
        font={FONT}
        fontSize={0.38}
        fontWeight={900}
        color={color}
        letterSpacing={0.15}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        characters="Portvilla"
        outlineWidth={0.006}
        outlineColor="rgba(0,0,0,0.5)"
        opacity={opacity}
        transparent
        depthTest={false}
        renderOrder={10}
        scale={[scale, scale, scale]}
      >
        Portvilla
      </Text>
    </group>
  );
}
