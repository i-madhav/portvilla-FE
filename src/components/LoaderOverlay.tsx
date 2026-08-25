import { useEffect, useState } from 'react';
import { IMAGE_SRCS, FONT }   from '../lib/scene/constants';
import S                       from '../lib/ui/styles';

interface LoaderOverlayProps {
  progress : number;
  fading   : boolean;
}

const C = {
  sage   : '#9CB080',
  forest : '#618764',
  deep   : '#2B5748',
};

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  left    : `${(i * 37 + 7) % 100}%`,
  size    : `${2 + (i % 3)}px`,
  delay   : `${((i * 0.37) % 4).toFixed(2)}s`,
  duration: `${5 + (i % 6)}s`,
  opacity : 0.18 + (i % 4) * 0.08,
  sage    : i % 3 === 0,
}));

const Corner = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const isTop  = pos.startsWith('t');
  const isLeft = pos.endsWith('l');
  return (
    <div
      className={`absolute w-8 h-8 ${isTop ? 'top-7' : 'bottom-7'} ${isLeft ? 'left-7' : 'right-7'}`}
      style={{ opacity: 0, animation: 'letterFadeIn 0.6s ease 0.3s forwards' }}
    >
      <div className={`absolute w-8 h-px bg-[rgba(156,176,128,0.45)] ${isTop ? 'top-0' : 'bottom-0'} ${isLeft ? 'left-0' : 'right-0'}`} />
      <div className={`absolute w-px h-8 bg-[rgba(156,176,128,0.45)] ${isTop ? 'top-0' : 'bottom-0'} ${isLeft ? 'left-0' : 'right-0'}`} />
    </div>
  );
};

export default function LoaderOverlay({ progress, fading }: LoaderOverlayProps) {
  const [shown, setShown] = useState(0);
  const ceiling = fading ? progress : Math.min(progress, 99);

  useEffect(() => {
    if (shown >= ceiling) return;
    const t = setTimeout(() => setShown(p => Math.min(p + 1, ceiling)), 45);
    return () => clearTimeout(t);
  }, [shown, ceiling]);

  const displayProgress = shown;

  return (
    <div
      className="overflow-hidden z-[100]"
      style={{ ...S.fullFixed, opacity: fading ? 0 : 1, transition: 'opacity 1s ease' }}
    >
      {/* Background image */}
      <img src={IMAGE_SRCS[0]} alt="" draggable={false} style={S.bgImg} />

      {/* Vignette + dark layer */}
      <div style={S.vignette} />
      <div className="absolute inset-0 bg-black/[0.42]" />

      {/* ── Floating light motes ───────────────────────────────────── */}
      {PARTICLES.map((p, i) => (
        <div key={i} className="absolute -bottom-2 rounded-full pointer-events-none" style={{
          left      : p.left,
          width     : p.size,
          height    : p.size,
          background: p.sage ? C.sage : 'rgba(255,255,255,0.5)',
          opacity   : p.opacity,
          animation : `floatUp ${p.duration} ${p.delay} ease-in infinite`,
          filter    : p.sage ? 'blur(0.8px)' : 'none',
        }} />
      ))}

      {/* ── Soft radial bloom behind title ────────────────────────── */}
      <div className="absolute w-[680px] h-[240px] pointer-events-none" style={{
        top       : '50%',
        left      : '50%',
        transform : 'translate(-50%, -54%)',
        background: 'radial-gradient(ellipse at center, rgba(43,87,72,0.45) 0%, rgba(39,51,56,0.2) 55%, transparent 78%)',
        animation : 'pulse 4s ease-in-out infinite',
      }} />

      {/* ── Title + tagline ────────────────────────────────────────── */}
      <div style={{ ...S.centred, flexDirection: 'column', gap: '1.1rem' }}>

        {/* Letter stagger */}
        <div className="relative flex gap-[0.01em]">
          {'PORTVILLA'.split('').map((ch, i) => (
            <span key={i} style={{ ...S.letter, animationDelay: `${i * 0.07}s` }}>{ch}</span>
          ))}

          {/* Shimmer sweep — crosses after all letters are in */}
          <div className="absolute inset-0 pointer-events-none" style={{
            opacity          : 0,
            background       : 'linear-gradient(105deg, transparent 25%, rgba(156,176,128,0.35) 50%, transparent 75%)',
            backgroundSize   : '200% 100%',
            animation        : 'shimmerSweep 1.4s ease 1.1s forwards',
            animationFillMode: 'both',
          }} />
        </div>

        {/* Tagline */}
        <div
          className="flex items-center gap-3.5"
          style={{ opacity: 0, animation: 'letterFadeIn 0.7s ease 1.2s forwards' }}
        >
          <div className="w-11 h-px" style={{ background: `linear-gradient(to right, transparent, ${C.forest})` }} />
          <span
            className="text-[0.62rem] tracking-[0.3em] uppercase font-semibold whitespace-nowrap"
            style={{ color: 'rgba(156,176,128,0.65)', fontFamily: FONT }}
          >Representation · Reimagined</span>
          <div className="w-11 h-px" style={{ background: `linear-gradient(to left, transparent, ${C.forest})` }} />
        </div>
      </div>

      {/* ── Progress bar — inside corner-bracket frame ────────────── */}
      <div
        className="fixed bottom-7 left-14 right-14 flex flex-col items-center gap-2.5"
        style={{ opacity: 0, animation: 'letterFadeIn 0.6s ease 0.5s forwards' }}
      >
        {/* Bar flanked by hairlines — stretches edge-to-edge within brackets */}
        <div className="flex items-center gap-3.5 w-full">
          <div className="flex-1 h-px bg-[rgba(156,176,128,0.15)]" />
          <div className="w-[180px] h-0.5 bg-[rgba(156,176,128,0.12)] rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm transition-[width] duration-[180ms] ease-out"
              style={{
                width     : `${displayProgress}%`,
                background: `linear-gradient(90deg, ${C.deep} 0%, ${C.forest} 60%, ${C.sage} 100%)`,
                boxShadow : '0 0 8px rgba(97,135,100,0.7), 0 0 20px rgba(43,87,72,0.4)',
              }}
            />
          </div>
          <div className="flex-1 h-px bg-[rgba(156,176,128,0.15)]" />
        </div>

        {/* Counter */}
        <div className="flex items-baseline gap-3.5">
          <span
            className="text-[0.58rem] tracking-[0.24em] uppercase"
            style={{ color: 'rgba(156,176,128,0.45)', fontFamily: FONT }}
          >Loading</span>
          <span
            className="text-base font-bold tabular-nums tracking-[0.05em]"
            style={{
              color     : C.sage,
              fontFamily: FONT,
              textShadow: '0 0 12px rgba(156,176,128,0.55)',
            }}
          >{String(displayProgress).padStart(3, '0')}%</span>
        </div>
      </div>

      {/* ── Film-frame corner brackets ─────────────────────────────── */}
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />
    </div>
  );
}
