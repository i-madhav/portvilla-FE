import { useFrame, useThree } from '@react-three/fiber';
import * as THREE              from 'three';
import { CAM_START, CAM_END } from '../../lib/constants';

interface CameraRigProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

export default function CameraRig({ scrollProgressRef }: CameraRigProps) {
  const { camera } = useThree();

  useFrame(() => {
    const eased = THREE.MathUtils.smoothstep(scrollProgressRef.current, 0, 1);
    const z = THREE.MathUtils.lerp(CAM_START, CAM_END, eased);
    camera.position.set(0, 0, z);
    camera.lookAt(0, 0, 0);
  });

  return null;
}
