import { useEffect, useState } from 'react';

export function useImagePreloader(srcs: string[]) {
  const [progress, setProgress] = useState(0);
  const [done,     setDone    ] = useState(false);

  useEffect(() => {
    let loaded = 0;
    const total = srcs.length;
    if (!total) { setProgress(100); setDone(true); return; }

    srcs.forEach(src => {
      const img = new Image();
      img.onload = img.onerror = () => {
        setProgress(Math.round((++loaded / total) * 100));
        if (loaded === total) setDone(true);
      };
      img.src = src;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { progress, done };
}
