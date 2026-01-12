/**
 * useDesktopBreakpoint Hook
 *
 * Returns current desktop breakpoint and config based on viewport width.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  DESKTOP_BREAKPOINTS,
  getDesktopBreakpoint,
  type DesktopBreakpoint,
} from '@/config/breakpoints';

interface DesktopBreakpointState {
  breakpoint: DesktopBreakpoint | null;
  isDesktop: boolean;
  isDesktopLarge: boolean;
  isDesktopXL: boolean;
  isDesktopUltra: boolean;
  columns: number;
  cardMaxWidth: number;
  panelWidth: number;
  thumbnailStripWidth: number;
  contentMaxWidth: number;
  gridGap: number;
  gridPadding: number;
}

const DEFAULT_STATE: DesktopBreakpointState = {
  breakpoint: null,
  isDesktop: false,
  isDesktopLarge: false,
  isDesktopXL: false,
  isDesktopUltra: false,
  columns: 2,
  cardMaxWidth: 200,
  panelWidth: 0,
  thumbnailStripWidth: 0,
  contentMaxWidth: 800,
  gridGap: 16,
  gridPadding: 16,
};

function getBreakpointState(width: number): DesktopBreakpointState {
  const breakpoint = getDesktopBreakpoint(width);

  if (!breakpoint) {
    return DEFAULT_STATE;
  }

  const config = DESKTOP_BREAKPOINTS[breakpoint];
  const isXLOrLarger = breakpoint === 'desktopXL' || breakpoint === 'desktopUltra';

  return {
    breakpoint,
    isDesktop: true,
    isDesktopLarge: breakpoint !== 'desktop',
    isDesktopXL: isXLOrLarger,
    isDesktopUltra: breakpoint === 'desktopUltra',
    columns: config.columns,
    cardMaxWidth: config.cardMaxWidth,
    panelWidth: config.panelWidth,
    thumbnailStripWidth: config.thumbnailStripWidth,
    contentMaxWidth: config.contentMaxWidth,
    gridGap: isXLOrLarger ? 32 : 24,
    gridPadding: isXLOrLarger ? 32 : 24,
  };
}

export function useDesktopBreakpoint(): DesktopBreakpointState {
  const [width, setWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 0;
  });

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const state = useMemo(() => getBreakpointState(width), [width]);

  return state;
}

/**
 * Simple hook to check if viewport is desktop (>=1024px)
 */
export function useIsDesktop(): boolean {
  const { isDesktop } = useDesktopBreakpoint();
  return isDesktop;
}

export default useDesktopBreakpoint;
