import { useRef, useState }                    from 'react';
import { useFrame }                             from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette }      from '@react-three/postprocessing';
import * as THREE                               from 'three';

interface TunnelEffectsProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

export default function TunnelEffects({ scrollProgressRef }: TunnelEffectsProps) {
  const effectStrengthRef = useRef(0);
  const [effectStrength, setEffectStrength] = useState(0);

  useFrame(() => {
    const ramp = THREE.MathUtils.clamp((scrollProgressRef.current - 0.08) / 0.24, 0, 1);
    const next = THREE.MathUtils.smoothstep(ramp, 0, 1);
    const shouldCommit =
      Math.abs(next - effectStrengthRef.current) > 0.025 ||
      (next === 0 && effectStrengthRef.current !== 0) ||
      (next === 1 && effectStrengthRef.current !== 1);

    if (shouldCommit) {
      effectStrengthRef.current = next;
      setEffectStrength(next);
    }
  });

  return (
    <EffectComposer enabled={effectStrength > 0.001}>
      <Bloom
        intensity={0.4 * effectStrength}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.85}
        mipmapBlur
      />
      <Vignette
        eskil={false}
        offset={0.25}
        darkness={0.72 * effectStrength}
      />
    </EffectComposer>
  );
}
