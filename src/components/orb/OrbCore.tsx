import { useRef }         from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE          from 'three';
import type { OrbHandle } from '../../hooks/useOrbState';
import {
  ORB_MAIN_VERT,  ORB_MAIN_FRAG,
  ORB_INNER_VERT, ORB_INNER_FRAG,
  ORB_HALO_VERT,  ORB_HALO_FRAG,
} from '../../lib/orbShaders';

interface OrbCoreProps {
  visible   : boolean;
  orbHandle : OrbHandle;
  docked    : boolean;
}

/** World-space radius of the main sphere at scale = 1 */
const BASE_SCALE = 0.22;

/** Floating bob amplitude (world units) */
const FLOAT_AMP  = 0.016;
const FLOAT_FREQ = 0.75;   /* rad/s */

function makeUniforms() {
  return {
    uTime     : { value: 0 },
    uAmplitude: { value: 0 },
    uGlow     : { value: 0.5 },
  };
}

const CENTER_POS  = new THREE.Vector3(0, -0.08, 0.5);
/* Padding from edge in world units — calculated dynamically in useFrame */
const DOCK_PADDING = 0.92;
/* Scale multiplier when docked (orb shrinks to feel like a companion widget) */
const DOCK_SCALE   = 0.52;

export default function OrbCore({ visible, orbHandle, docked }: OrbCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mainMesh = useRef<THREE.Mesh>(null);

  const innerMat = useRef<THREE.ShaderMaterial>(null);
  const mainMat  = useRef<THREE.ShaderMaterial>(null);
  const haloMat  = useRef<THREE.ShaderMaterial>(null);

  /* Smoothed animated values — all refs, no React state needed */
  const currentScaleRef = useRef(0);
  const currentGlowRef  = useRef(0.52);
  const timeRef         = useRef(0);

  /* Position lerp tracking */
  const currentPosRef = useRef(CENTER_POS.clone());

  const { viewport } = useThree();

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    /* Frame-rate-independent exponential lerp factor */
    const lerpAlpha     = 1 - Math.pow(0.001, delta * 3.5);
    const posLerpAlpha  = 1 - Math.pow(0.001, delta * 2.8);  /* slightly slower for elegance */

    /* ── Scale: entrance / exit & state transitions ─────────────────────── */
    const baseTarget  = visible ? orbHandle.targetScaleRef.current : 0;
    const targetScale = docked ? baseTarget * DOCK_SCALE : baseTarget;
    currentScaleRef.current += (targetScale - currentScaleRef.current) * lerpAlpha;

    /* ── Glow: dim slightly when docked ────────────────────────────────── */
    const targetGlow = docked
      ? orbHandle.targetGlowRef.current * 0.72
      : orbHandle.targetGlowRef.current;
    currentGlowRef.current += (targetGlow - currentGlowRef.current) * (lerpAlpha * 0.55);

    /* ── Mock audio amplitude while speaking ────────────────────────────── */
    const isSpeaking = orbHandle.stateRef.current === 'speaking';
    if (isSpeaking && orbHandle.amplitudeRef.current < 0.02) {
      /* Layered sine = convincing voice-like envelope */
      orbHandle.amplitudeRef.current = Math.max(
        0,
        Math.sin(t * 9.5) * 0.38 +
        Math.sin(t * 14.8) * 0.22 +
        Math.sin(t * 5.1) * 0.18 +
        0.22,
      );
    } else if (!isSpeaking) {
      orbHandle.amplitudeRef.current *= 0.90;   /* decay to 0 */
    }

    const amp  = orbHandle.amplitudeRef.current;
    const glow = currentGlowRef.current;
    const s    = BASE_SCALE * currentScaleRef.current;

    /* ── Position: lerp to bottom-right when docked, center otherwise ───── */
    const halfW = viewport.width  / 2;
    const halfH = viewport.height / 2;
    const dockedPos = new THREE.Vector3(
      halfW  - DOCK_PADDING,
      -halfH + DOCK_PADDING,
      0.5,
    );
    const targetPos = docked ? dockedPos : CENTER_POS;
    currentPosRef.current.lerp(targetPos, posLerpAlpha);

    /* ── Apply to group ─────────────────────────────────────────────────── */
    if (groupRef.current) {
      groupRef.current.scale.setScalar(s);
      groupRef.current.position.x = currentPosRef.current.x;
      groupRef.current.position.z = currentPosRef.current.z;
      /* Float bob only on y, added on top of lerped y */
      const floatY = docked ? 0 : Math.sin(t * FLOAT_FREQ) * FLOAT_AMP / Math.max(s, 0.001);
      groupRef.current.position.y = currentPosRef.current.y + floatY;
    }

    /* ── Slow rotation on main mesh for noise-pattern movement ─────────── */
    if (mainMesh.current) {
      mainMesh.current.rotation.y += delta * 0.07;
      mainMesh.current.rotation.x  = Math.sin(t * 0.28) * 0.04;
    }

    /* ── Shader uniforms ────────────────────────────────────────────────── */
    for (const mat of [innerMat.current, mainMat.current, haloMat.current]) {
      if (!mat) continue;
      mat.uniforms.uTime.value      = t;
      mat.uniforms.uAmplitude.value = amp;
      mat.uniforms.uGlow.value      = glow;
    }
  });

  /*
   * Render-order hierarchy (all tunnel layers are 0–6):
   *   halo  = 7  → soft corona, only visible outside the opaque body
   *   main  = 8  → OPAQUE polished glass marble (the object you see)
   *   inner = 9  → additive heart-glow, blooms through the glass when speaking
   *
   * All materials: depthTest=false, depthWrite=false so we never clip into
   * tunnel geometry or each other; ordering is driven purely by renderOrder.
   */
  return (
    <group ref={groupRef}>
      {/* Outer atmospheric corona — ripples with traveling waves */}
      <mesh renderOrder={7}>
        <sphereGeometry args={[1.38, 64, 64]} />
        <shaderMaterial
          ref={haloMat}
          vertexShader={ORB_HALO_VERT}
          fragmentShader={ORB_HALO_FRAG}
          transparent
          depthWrite={false}
          depthTest={false}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
          uniforms={makeUniforms()}
        />
      </mesh>

      {/* Opaque polished glass marble — marbled teal interior + glossy specular */}
      <mesh ref={mainMesh} renderOrder={8}>
        {/* IcosahedronGeometry: uniform vertex distribution = cleaner noise */}
        <icosahedronGeometry args={[1, 6]} />
        <shaderMaterial
          ref={mainMat}
          vertexShader={ORB_MAIN_VERT}
          fragmentShader={ORB_MAIN_FRAG}
          transparent
          depthWrite={false}
          depthTest={false}
          side={THREE.FrontSide}
          uniforms={makeUniforms()}
        />
      </mesh>

      {/* Inner luminous heart — small, blooms through the glass (additive) */}
      <mesh renderOrder={9}>
        <sphereGeometry args={[0.48, 32, 32]} />
        <shaderMaterial
          ref={innerMat}
          vertexShader={ORB_INNER_VERT}
          fragmentShader={ORB_INNER_FRAG}
          transparent
          depthWrite={false}
          depthTest={false}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
          uniforms={makeUniforms()}
        />
      </mesh>
    </group>
  );
}
