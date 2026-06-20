import { IMAGE_SRCS, LAYER_Y, LAYER_Z } from '../../lib/constants';
import CameraRig               from './CameraRig';
import LayerMesh               from './LayerMesh';

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
          layerY={LAYER_Y[i]}
          velocityRef={velocityRef}
        />
      ))}
    </>
  );
}
