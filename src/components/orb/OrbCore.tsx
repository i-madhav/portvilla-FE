import { useRef }         from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE          from 'three';
import type { OrbHandle } from '../../hooks/useOrbState';
import { ORB_CENTER_Z, ORB_END_Y, ORB_START_Y, type OrbEntranceState } from '../../lib/scene/constants';
import {
  ORB_MAIN_VERT,  ORB_MAIN_FRAG,
  ORB_INNER_VERT, ORB_INNER_FRAG,
  ORB_HALO_VERT,  ORB_HALO_FRAG,
} from '../../lib/scene/orbShaders';

interface OrbCoreProps {
  visible         : boolean;
  orbHandle       : OrbHandle;
  docked          : boolean;
  orbEntranceRef  : React.MutableRefObject<OrbEntranceState>;
}

/** World-space radius of the main sphere at scale = 1 */
const BASE_SCALE = 1;

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

const CENTER_POS = new THREE.Vector3(0, ORB_END_Y, ORB_CENTER_Z);
/* Padding from edge in world units — calculated dynamically in useFrame */
const DOCK_PADDING = 0.92;
/* Scale multiplier when docked (orb shrinks to feel like a companion widget) */
const DOCK_SCALE   = 0.52;

/** Eased entranceT threshold at which the orb breaks through in front of img4 */
const ORB_LAYER_BREAK_T = 0.9;

export default function OrbCore({ visible, orbHandle, docked, orbEntranceRef }: OrbCoreProps) {
  const groupRef    = useRef<THREE.Group>(null);
  const mainMesh    = useRef<THREE.Mesh>(null);
  const haloMesh    = useRef<THREE.Mesh>(null);
  const innerMesh   = useRef<THREE.Mesh>(null);

  const innerMat = useRef<THREE.ShaderMaterial>(null);
  const mainMat  = useRef<THREE.ShaderMaterial>(null);
  const haloMat  = useRef<THREE.ShaderMaterial>(null);

  /* Smoothed animated values — all refs, no React state needed */
  const currentScaleRef = useRef(0);
  const currentGlowRef  = useRef(0.52);
  const timeRef         = useRef(0);

  /* Position lerp tracking — start below frame to match entrance ref */
  const currentPosRef = useRef(new THREE.Vector3(0, ORB_START_Y, ORB_CENTER_Z));

  const { viewport } = useThree();

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    /* Frame-rate-independent exponential lerp factor */
    const lerpAlpha     = 1 - Math.pow(0.001, delta * 3.5);
    const posLerpAlpha  = 1 - Math.pow(0.001, delta * 2.8);  /* slightly slower for elegance */

    const entranceT = orbEntranceRef.current.t;

    /* ── Scale: full size immediately when visible; position handles the entrance */
    const baseTarget = visible ? orbHandle.targetScaleRef.current : 0;
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
      ORB_CENTER_Z,
    );
    const offScreen = new THREE.Vector3(0, ORB_START_Y, ORB_CENTER_Z);
    const targetPos = docked
      ? dockedPos
      : visible
        ? CENTER_POS.clone()
        : offScreen;
    if (!docked && visible) {
      targetPos.y = orbEntranceRef.current.y;
    }
    currentPosRef.current.lerp(targetPos, posLerpAlpha);
    if (!docked && visible) {
      currentPosRef.current.y = orbEntranceRef.current.y;
    }

    /* ── Apply to group ─────────────────────────────────────────────────── */
    if (groupRef.current) {
      groupRef.current.scale.setScalar(s);
      groupRef.current.position.x = currentPosRef.current.x;
      groupRef.current.position.z = currentPosRef.current.z;
      const floatY =
        docked || entranceT < 1
          ? 0
          : Math.sin(t * FLOAT_FREQ) * FLOAT_AMP / Math.max(s, 0.001);
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

    /* ── RenderOrder: orb rises from behind img4 (layer 3, RO=3), then
     *    breaks through to the front once 90% of the entrance is complete.
     *    During entrance: 2.7/2.8/2.9 → behind layers 3-6 (img4–img7)
     *    After break:     7  / 8  / 9  → in front of all tunnel layers    */
    const behindLayer = !docked && entranceT < ORB_LAYER_BREAK_T;
    if (haloMesh.current)  haloMesh.current.renderOrder  = behindLayer ? 2.7 : 7;
    if (mainMesh.current)  mainMesh.current.renderOrder  = behindLayer ? 2.8 : 8;
    if (innerMesh.current) innerMesh.current.renderOrder = behindLayer ? 2.9 : 9;
  });

  /*
   * Render-order hierarchy (all tunnel layers are 0–6):
   *   During entrance (entranceT < 0.9): orb uses 2.7/2.8/2.9 so it rises
   *   from behind img4 (layer index 3, renderOrder 3) and all foreground layers.
   *   After break-through: halo=7, main=8, inner=9 — in front of everything.
   *
   * All materials: depthTest=false, depthWrite=false so ordering is purely
   * by renderOrder; no depth-buffer clipping with tunnel geometry.
   */
  return (
    <group ref={groupRef}>
      {/* Outer atmospheric corona — ripples with traveling waves */}
      <mesh ref={haloMesh} renderOrder={2.7}>
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
      <mesh ref={mainMesh} renderOrder={2.8}>
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
      <mesh ref={innerMesh} renderOrder={2.9}>
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
