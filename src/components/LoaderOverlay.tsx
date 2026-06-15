import img1Src from '../assets/scene1_1-D7eS8Ahv.webp';
import S        from '../lib/styles';

interface LoaderOverlayProps {
  progress : number;
  fading   : boolean;
}

export default function LoaderOverlay({ progress, fading }: LoaderOverlayProps) {
  return (
    <div style={{ ...S.fullFixed, zIndex: 100, opacity: fading ? 0 : 1, transition: 'opacity 0.8s ease', overflow: 'hidden' }}>
      <img src={img1Src} alt="" draggable={false} style={S.bgImg} />
      <div style={S.vignette} />

      <div style={S.centred}>
        {'Portvilla'.split('').map((ch, i) => (
          <span key={i} style={{ ...S.letter, animationDelay: `${i * 0.07}s` }}>{ch}</span>
        ))}
      </div>

      <div style={S.progressBlock}>
        <div style={S.barTrack}>
          <div style={{ ...S.barFill, width: `${progress}%` }} />
        </div>
        <div style={S.counterRow}>
          <span style={S.counterLabel}>Loading</span>
          <span style={S.counterNum}>{String(progress).padStart(3, ' ')}%</span>
        </div>
      </div>
    </div>
  );
}
