import S from '../lib/styles';

interface EndRevealProps {
  visible: boolean;
}

export default function EndReveal({ visible }: EndRevealProps) {
  return (
    <>
      <div style={{
        ...S.endScrim,
        opacity   : visible ? 1 : 0,
        transition: 'opacity 1s ease',
      }} />
      <div style={{
        ...S.endText,
        opacity  : visible ? 1 : 0,
        transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.78})`,
        transition: 'opacity 0.9s ease, transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {'Portvilla'.split('').map((ch, i) => (
          <span key={i} style={{
            display  : 'inline-block',
            animation: visible ? `letterFadeIn 0.55s ease ${i * 0.07}s both` : 'none',
          }}>
            {ch}
          </span>
        ))}
      </div>
    </>
  );
}
