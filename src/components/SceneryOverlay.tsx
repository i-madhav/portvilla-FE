import { DEPTHS, IMAGE_SRCS, LAYER_Y, LAYER_Z, layerYToSceneryTranslatePx } from '../lib/constants';
import S                      from '../lib/styles';

interface SceneryOverlayProps {
  opacity        : number;
  offset         : { x: number; y: number };
  showScrollHint : boolean;
}

export default function SceneryOverlay({ opacity, offset, showScrollHint }: SceneryOverlayProps) {
  return (
    <div style={{ ...S.fullFixed, zIndex: 2, opacity, overflow: 'hidden' }}>
      {IMAGE_SRCS.map((src, i) => {
        const px = offset.x * DEPTHS[i] * window.innerWidth;
        const py =
          layerYToSceneryTranslatePx(LAYER_Y[i], LAYER_Z[i], window.innerHeight) +
          offset.y * DEPTHS[i] * window.innerHeight;
        return (
          <img
            key={i}
            src={src}
            alt=""
            draggable={false}
            style={{
              position     : 'absolute',
              top          : '0%',
              left         : '0%',
              width        : '100%',
              height       : '100%',
              objectFit    : 'cover',
              userSelect   : 'none',
              pointerEvents: 'none',
              transform    : `translate(${px}px, ${py}px)`,
              willChange   : 'transform',
            }}
          />
        );
      })}

      {showScrollHint && (
        <div style={S.scrollHint}>
          <p style={S.scrollHintText}>Scroll to enter</p>
          <div style={S.scrollHintLine} />
        </div>
      )}
    </div>
  );
}
