import { useMemo } from 'react';
import { useViewportWidth } from '@/hooks/useViewportWidth';

export function useBoardSize(max = 700, min = 260, padding = 48, largeFraction = 0.6, desktopBreakpoint = 1024) {
  const viewportWidth = useViewportWidth(max);
  return useMemo(() => {
    const base =
      viewportWidth >= desktopBreakpoint ? viewportWidth * largeFraction : Math.max(0, viewportWidth - padding);
    return Math.max(min, Math.min(max, base));
  }, [viewportWidth, max, min, padding, largeFraction, desktopBreakpoint]);
}
