import { IMAGE_SRCS, LAYER_Z } from '../../lib/constants';
import CameraRig               from './CameraRig';
import LayerMesh               from './LayerMesh';
import TunnelTitle             from './TunnelTitle';

interface TunnelSceneProps {
  velocityRef       : React.MutableRefObject<number>;
  scrollProgressRef : React.MutableRefObject<number>;
}

export default function TunnelScene({ velocityRef, scrollProgressRef }: TunnelSceneProps) {
  return (
    <>
      <CameraRig scrollProgressRef={scrollProgressRef} />
      {IMAGE_SRCS.map((src, i) => (
        <LayerMesh
          key={i}
          textureSrc={src}
          layerIndex={i}
          layerZ={LAYER_Z[i]}
          velocityRef={velocityRef}
        />
      ))}
      <TunnelTitle scrollProgressRef={scrollProgressRef} />
    </>
  );
}
