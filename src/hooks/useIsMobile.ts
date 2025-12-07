import { useMemo } from 'react';
import { useViewportWidth } from '@/hooks/useViewportWidth';

export function useIsMobile(breakpoint = 900) {
  const width = useViewportWidth();
  return useMemo(() => width <= breakpoint, [width, breakpoint]);
}
