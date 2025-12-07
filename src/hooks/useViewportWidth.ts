import { useEffect, useState } from 'react';

export function useViewportWidth(defaultWidth = 1024) {
  const [width, setWidth] = useState(defaultWidth);

  useEffect(() => {
    const update = () => {
      const next = typeof window !== 'undefined' ? window.innerWidth : defaultWidth;
      setWidth(next);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [defaultWidth]);

  return width;
}
