import { useRef }              from 'react';
import { useFrame, useThree }  from '@react-three/fiber';
import * as THREE               from 'three';
import type { OrbHandle }      from '../../hooks/useOrbState';
import { ORB_CENTER_Z, ORB_END_Y, ORB_START_Y, type OrbEntranceState } from '../../lib/constants';
import { ORB2D_VERT, ORB2D_FRAG } from '../../lib/orb2dShaders';

interface OrbCore2DProps {
  visible        : boolean;
  orbHandle      : OrbHandle;
  docked         : boolean;
  orbEntranceRef : React.MutableRefObject<OrbEntranceState>;
}

/* World-space diameter of the disc at scale = 1 (plane is 2 × 2 local) */
const BASE_SCALE    = 2.8;
/* Corner padding from viewport edge when docked */
const DOCK_PADDING  = 0.92;
/* Shrink factor when docked */
const DOCK_SCALE    = 0.52;
/* Eased entranceT at which the disc breaks through in front of img4 */
const LAYER_BREAK_T = 0.9;

const CENTER_POS = new THREE.Vector3(0, ORB_END_Y, ORB_CENTER_Z);

function makeUniforms() {
  return {
    uTime     : { value: 0 },
    uAmplitude: { value: 0 },
  };
}

export default function OrbCore2D({ visible, orbHandle, docked, orbEntranceRef }: OrbCore2DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef  = useRef<THREE.Mesh>(null);
  const matRef   = useRef<THREE.ShaderMaterial>(null);

  const currentScaleRef = useRef(0);
  const timeRef         = useRef(0);
  const currentPosRef   = useRef(new THREE.Vector3(0, ORB_START_Y, ORB_CENTER_Z));

  const { viewport } = useThree();

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    const lerpAlpha    = 1 - Math.pow(0.001, delta * 3.5);
    const posLerpAlpha = 1 - Math.pow(0.001, delta * 2.8);

    const entranceT = orbEntranceRef.current.t;

    /* ── Scale ──────────────────────────────────────────────────────────── */
    const baseTarget  = visible ? orbHandle.targetScaleRef.current : 0;
    const targetScale = docked ? baseTarget * DOCK_SCALE : baseTarget;
    currentScaleRef.current += (targetScale - currentScaleRef.current) * lerpAlpha;

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

    /* ── Position: center or docked bottom-right ────────────────────────── */
    const halfW      = viewport.width  / 2;
    const halfH      = viewport.height / 2;
    const dockedPos  = new THREE.Vector3(halfW - DOCK_PADDING, -halfH + DOCK_PADDING, ORB_CENTER_Z);
    const offScreen  = new THREE.Vector3(0, ORB_START_Y, ORB_CENTER_Z);
    const targetPos  = docked
      ? dockedPos
      : visible
        ? CENTER_POS.clone()
        : offScreen;

    if (!docked && visible) targetPos.y = orbEntranceRef.current.y;
    currentPosRef.current.lerp(targetPos, posLerpAlpha);
    if (!docked && visible) currentPosRef.current.y = orbEntranceRef.current.y;

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
    const behindLayer = !docked && entranceT < LAYER_BREAK_T;
    if (meshRef.current) meshRef.current.renderOrder = behindLayer ? 2.8 : 8;
  });

  return (
    <group ref={groupRef}>
      {/*
       * Single flat quad — the fragment shader paints the entire design.
       * transparent + depthWrite=false + depthTest=false: renderOrder owns
       * the draw order, same contract as the tunnel layer meshes.
       */}
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
