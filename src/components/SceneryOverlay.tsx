import { IMAGE_SRCS, DEPTHS } from '../lib/constants';
import S                      from '../lib/styles';

interface SceneryOverlayProps {
  opacity        : number;
  offset         : { x: number; y: number };
  showScrollHint : boolean;
}

export default function SceneryOverlay({ opacity, offset, showScrollHint }: SceneryOverlayProps) {
  return (
    <div style={{ ...S.fullFixed, zIndex: 2, opacity, overflow: 'hidden', transition: 'opacity 0.15s ease-out' }}>
      {IMAGE_SRCS.map((src, i) => {
        const px = offset.x * DEPTHS[i] * window.innerWidth;
        const py = offset.y * DEPTHS[i] * window.innerHeight;
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
