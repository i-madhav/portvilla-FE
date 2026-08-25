import { useRef }              from 'react';
import { useFrame }            from '@react-three/fiber';
import * as THREE               from 'three';
import type { OrbHandle }      from '../../hooks/useOrbState';
import { ORB_CENTER_Z, ORB_END_Y, ORB_START_Y, type OrbEntranceState } from '../../lib/scene/constants';
import { ORB2D_VERT, ORB2D_FRAG } from '../../lib/scene/orb2dShaders';

interface OrbCore2DProps {
  visible        : boolean;
  orbHandle      : OrbHandle;
  vanishing      : boolean;
  orbEntranceRef : React.MutableRefObject<OrbEntranceState>;
}

/* World-space diameter of the disc at scale = 1 (plane is 2 × 2 local) */
const BASE_SCALE    = 2.8;
/* Eased entranceT at which the disc breaks through in front of img4 */
const LAYER_BREAK_T = 0.9;

/* Whoop timing */
const SWELL_DURATION = 0.13;  /* seconds to swell up */
const SWELL_PEAK     = 1.18;  /* overshoot factor */

const CENTER_POS = new THREE.Vector3(0, ORB_END_Y, ORB_CENTER_Z);

function makeUniforms() {
  return {
    uTime     : { value: 0 },
    uAmplitude: { value: 0 },
  };
}

export default function OrbCore2D({ visible, orbHandle, vanishing, orbEntranceRef }: OrbCore2DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef  = useRef<THREE.Mesh>(null);
  const matRef   = useRef<THREE.ShaderMaterial>(null);

  const currentScaleRef  = useRef(0);
  const timeRef          = useRef(0);
  const currentPosRef    = useRef(new THREE.Vector3(0, ORB_START_Y, ORB_CENTER_Z));

  /* Whoop state */
  const vanishingRef     = useRef(false);
  const vanishStartRef   = useRef(0);        /* absolute time when vanish began */
  const vanishBaseScale  = useRef(0);        /* scale captured at vanish start   */

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    const posLerpAlpha = 1 - Math.pow(0.001, delta * 1.4);

    const entranceT = orbEntranceRef.current.t;

    /* ── Detect vanish trigger (rising edge) ──────────────────────────────── */
    if (vanishing && !vanishingRef.current) {
      vanishingRef.current  = true;
      vanishStartRef.current  = t;
      vanishBaseScale.current = currentScaleRef.current;
    }
    if (!vanishing && vanishingRef.current) {
      vanishingRef.current = false;
    }

    /* ── Scale ──────────────────────────────────────────────────────────── */
    let targetScale: number;

    if (vanishingRef.current) {
      const elapsed = t - vanishStartRef.current;
      if (elapsed < SWELL_DURATION) {
        /* Swell phase: ease to peak */
        const p = elapsed / SWELL_DURATION;
        const easedP = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p; /* easeInOut */
        targetScale = vanishBaseScale.current * (1 + (SWELL_PEAK - 1) * easedP);
      } else {
        /* Collapse phase: slam to 0 */
        targetScale = 0;
      }
      const collapseAlpha = elapsed < SWELL_DURATION
        ? 1 - Math.pow(0.001, delta * 14)   /* snap to swell quickly */
        : 1 - Math.pow(0.001, delta * 22);  /* aggressive collapse   */
      currentScaleRef.current += (targetScale - currentScaleRef.current) * collapseAlpha;
    } else {
      targetScale = visible ? orbHandle.targetScaleRef.current : 0;
      const lerpAlpha = 1 - Math.pow(0.001, delta * 2.0);
      currentScaleRef.current += (targetScale - currentScaleRef.current) * lerpAlpha;
    }

    /* ── Mock audio amplitude while speaking ────────────────────────────── */
    const isSpeaking = orbHandle.stateRef.current === 'speaking';
    if (isSpeaking && orbHandle.amplitudeRef.current < 0.02) {
      orbHandle.amplitudeRef.current = Math.max(
        0,
        Math.sin(t * 9.5)  * 0.38 +
        Math.sin(t * 14.8) * 0.22 +
        Math.sin(t * 5.1)  * 0.18 +
        0.22,
      );
    } else if (!isSpeaking) {
      orbHandle.amplitudeRef.current *= 0.90;
    }

    const s = BASE_SCALE * currentScaleRef.current;

    /* ── Position: stay in place when vanishing, else center or off-screen ─ */
    if (!vanishingRef.current) {
      const offScreen = new THREE.Vector3(0, ORB_START_Y, ORB_CENTER_Z);
      const targetPos = visible ? CENTER_POS.clone() : offScreen;
      if (visible) targetPos.y = orbEntranceRef.current.y;
      currentPosRef.current.lerp(targetPos, posLerpAlpha);
      if (visible) currentPosRef.current.y = orbEntranceRef.current.y;
    }
    /* When vanishing: position is frozen — no lerp, stays exactly where it was */

    /* ── Apply to group ─────────────────────────────────────────────────── */
    if (groupRef.current) {
      groupRef.current.scale.setScalar(s);
      groupRef.current.position.copy(currentPosRef.current);
    }

    /* ── Shader uniforms ────────────────────────────────────────────────── */
    if (matRef.current) {
      matRef.current.uniforms.uTime.value      = t;
      matRef.current.uniforms.uAmplitude.value = orbHandle.amplitudeRef.current;
    }

    /* ── RenderOrder: rises from behind img4 (RO 3), breaks through at 90% */
    const behindLayer = !vanishingRef.current && entranceT < LAYER_BREAK_T;
    if (meshRef.current) meshRef.current.renderOrder = behindLayer ? 2.8 : 8;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} renderOrder={2.8}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={ORB2D_VERT}
          fragmentShader={ORB2D_FRAG}
          transparent
          depthWrite={false}
          depthTest={false}
          side={THREE.FrontSide}
          uniforms={makeUniforms()}
        />
      </mesh>
    </group>
  );
}
