import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree }         from '@react-three/fiber';
import { useTexture }                  from '@react-three/drei';
import * as THREE                      from 'three';
import { VERT, FRAG }                  from '../../lib/shaders';
import { CAM_START, PLANE_SCALE }      from '../../lib/constants';

interface LayerMeshProps {
  textureSrc  : string;
  layerIndex  : number;
  layerZ      : number;
  layerY      : number;
  velocityRef : React.MutableRefObject<number>;
}

export default function LayerMesh({ textureSrc, layerIndex , layerY, layerZ, velocityRef }: LayerMeshProps) {
  const texture  = useTexture(textureSrc);
  const matRef   = useRef<THREE.ShaderMaterial>(null);
  const meshRef  = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const initSize = useRef<{ w: number; h: number } | null>(null);
  if (!initSize.current) {
    const startDistanceRatio = (CAM_START - layerZ) / CAM_START;
    initSize.current = {
      w: viewport.width  * PLANE_SCALE * startDistanceRatio,
      h: viewport.height * PLANE_SCALE * startDistanceRatio,
    };
  }
  const { w: planeW, h: planeH } = initSize.current;
  const planeAspect = planeW / planeH;

  const texAspect = useMemo(() => {
    const img = texture.image as HTMLImageElement | null;
    const w   = img?.naturalWidth  ?? img?.width  ?? 0;
    const h   = img?.naturalHeight ?? img?.height ?? 0;
    return w && h ? w / h : 16 / 9;
  }, [texture]);

  useEffect(() => {
    texture.minFilter  = THREE.LinearFilter;
    texture.magFilter  = THREE.LinearFilter;
    texture.wrapS      = THREE.ClampToEdgeWrapping;
    texture.wrapT      = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  useFrame(() => {
    if (!matRef.current) return;
    matRef.current.uniforms.uScrollVelocity.value = velocityRef.current;
  });

  return (
    <mesh ref={meshRef} position={[0, layerY, layerZ]} renderOrder={layerIndex}>
      <planeGeometry args={[planeW, planeH]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        depthTest={false}
        side={THREE.FrontSide}
        uniforms={{
          uTexture       : { value: texture     },
          uScrollVelocity: { value: 0           },
          uPlaneAspect   : { value: planeAspect },
          uTexAspect     : { value: texAspect   },
        }}
      />
    </mesh>
  );
}
