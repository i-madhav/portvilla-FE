import { useEffect, useRef, useState } from 'react';

export function useMouseParallax(active: boolean) {
  const target  = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const rafRef  = useRef<number>(0);

  useEffect(() => {
    if (!active) { setOffset({ x: 0, y: 0 }); return; }

    const loop = () => {
      current.current.x += (target.current.x - current.current.x) * 0.05;
      current.current.y += (target.current.y - current.current.y) * 0.05;
      setOffset({ x: current.current.x, y: current.current.y });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(rafRef.current); };
  }, [active]);

  return offset;
}