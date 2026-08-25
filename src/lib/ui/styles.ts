import type { CSSProperties } from 'react';
import { FONT } from '../scene/constants';

const S: Record<string, CSSProperties> = {
  fullFixed: { position: 'fixed', inset: 0 },

  bgImg: {
    position     : 'absolute',
    inset        : 0,
    width        : '100%',
    height       : '100%',
    objectFit    : 'cover',
    userSelect   : 'none',
    pointerEvents: 'none',
  },

  vignette: {
    position  : 'absolute',
    inset     : 0,
    background: 'radial-gradient(ellipse 90% 80% at center, transparent 40%, rgba(0,0,0,0.35) 100%)',
  },

  centred: {
    position : 'absolute',
    top      : '50%',
    left     : '50%',
    transform: 'translate(-50%,-50%)',
    display  : 'flex',
    gap      : '0.01em',
    whiteSpace: 'nowrap',
  },

  letter: {
    display      : 'inline-block',
    fontSize     : 'clamp(2.5rem, 7vw, 6rem)',
    fontWeight   : 700,
    color        : '#fff',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontFamily   : FONT,
    opacity      : 0,
    animation    : 'letterFadeIn 0.5s ease forwards',
    textShadow   : '0 2px 24px rgba(0,0,0,0.8)',
  },

  progressBlock: {
    position      : 'fixed',
    bottom        : 36,
    left          : 40,
    display       : 'flex',
    flexDirection : 'column',
    gap           : 8,
    minWidth      : 180,
  },

  barTrack: {
    width       : '100%',
    height      : 2,
    background  : 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow    : 'hidden',
  },

  barFill: {
    height      : '100%',
    background  : 'linear-gradient(90deg, rgba(255,255,255,0.4) 0%, #fff 100%)',
    borderRadius: 2,
    transition  : 'width 0.18s ease-out',
  },

  counterRow: {
    display       : 'flex',
    justifyContent: 'space-between',
    alignItems    : 'baseline',
    gap           : 12,
  },

  counterLabel: {
    color        : 'rgba(255,255,255,0.5)',
    fontSize     : '0.65rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    fontFamily   : FONT,
  },

  counterNum: {
    color             : '#fff',
    fontSize          : '1.05rem',
    fontWeight        : 700,
    fontVariantNumeric: 'tabular-nums',
    fontFamily        : FONT,
    letterSpacing     : '0.04em',
    textShadow        : '0 2px 12px rgba(0,0,0,0.8)',
  },

  scrollHint: {
    position     : 'absolute',
    bottom       : 28,
    left         : '50%',
    transform    : 'translateX(-50%)',
    display      : 'flex',
    flexDirection: 'column',
    alignItems   : 'center',
    gap          : 6,
    opacity      : 0.65,
    animation    : 'fadeInUp 1s ease 0.5s both',
    pointerEvents: 'none',
  },

  scrollHintText: {
    margin       : 0,
    color        : '#fff',
    fontSize     : '0.7rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    fontFamily   : FONT,
    fontWeight   : 700,
    textShadow   : '0 2px 8px rgba(0,0,0,0.8)',
  },

  scrollHintLine: {
    width     : 1,
    height    : 36,
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)',
    animation : 'pulse 2s ease-in-out infinite',
  },

  endScrim: {
    position     : 'fixed',
    inset        : 0,
    zIndex       : 9,
    pointerEvents: 'none',
    background   : 'radial-gradient(ellipse 60% 45% at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 75%)',
  },

  endText: {
    position     : 'fixed',
    top          : '50%',
    left         : '50%',
    fontSize     : 'clamp(3rem, 10vw, 9rem)',
    fontWeight   : 900,
    color        : '#fff',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    fontFamily   : FONT,
    textShadow   : '0 0 60px rgba(255,255,255,0.4), 0 0 120px rgba(255,255,255,0.15)',
    zIndex       : 10,
    userSelect   : 'none',
    whiteSpace   : 'nowrap',
    pointerEvents: 'none',
  },
};

export default S;
