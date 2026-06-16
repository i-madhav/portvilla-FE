import S from '../lib/styles';

interface EndRevealProps {
  phase: 'hidden' | 'entering' | 'visible' | 'exiting';
}

export default function EndReveal({ phase }: EndRevealProps) {
  /* Warm amber / gold palette — matches the cave scene's stone and light */
  const color = '#d18f4d';
  const glowColor = 'rgba(209, 143, 77, 0.35)';

  if (phase === 'hidden') return null;

  const isEntering = phase === 'entering';
  const isExiting  = phase === 'exiting';

  return (
    <>
      <div style={{
        ...S.endScrim,
        opacity   : isEntering || phase === 'visible' ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }} />
      <div style={{
        ...S.endText,
        color,
        textShadow: `0 0 60px ${glowColor}, 0 0 120px ${glowColor}`,
        opacity  : isExiting ? 0 : 1,
        transform: isExiting
          ? 'translate(-50%, -50%) translateY(-60px) scale(0.92)'
          : 'translate(-50%, -50%) scale(1)',
        filter   : isExiting ? 'blur(6px)' : 'blur(0)',
        transition: isExiting
          ? 'opacity 0.6s ease, transform 0.7s cubic-bezier(0.55, 0, 1, 0.45), filter 0.6s ease'
          : 'none',
      }}>
        {'Portvilla'.split('').map((ch, i) => (
          <span key={i} style={{
            display     : 'inline-block',
            opacity     : 0,
            animation   : isEntering
              ? `letterSlideUp 0.5s ease ${i * 0.07}s both`
              : 'none',
          }}>
            {ch}
          </span>
        ))}
      </div>
    </>
  );
}
