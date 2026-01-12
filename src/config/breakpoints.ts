/**
 * Breakpoint System Configuration
 *
 * Mobile-first breakpoints aligned with Tailwind CSS defaults.
 * Use min-width exclusively for progressive enhancement.
 */

/**
 * BREAKPOINT PHILOSOPHY:
 *
 * These match Tailwind's defaults for consistency.
 * Use min-width (mobile-first) exclusively.
 * Avoid max-width queries - they indicate desktop-first thinking.
 */
export const BREAKPOINTS = {
  // Base: 0-639px (Mobile - no prefix in Tailwind)
  sm: 640, // sm: - Small tablets, large phones landscape
  md: 768, // md: - Tablets portrait
  lg: 1024, // lg: - Tablets landscape, small laptops
  xl: 1280, // xl: - Laptops, desktops
  '2xl': 1536, // 2xl: - Large desktops, monitors
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS | 'base';

/**
 * Media query strings for use with matchMedia
 */
export const MEDIA_QUERIES = {
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
} as const;

/**
 * Device type detection
 */
export const POINTER_QUERIES = {
  touch: '(pointer: coarse)',
  mouse: '(pointer: fine)',
  any: '(any-pointer: fine)',
} as const;

/**
 * Orientation queries
 */
export const ORIENTATION_QUERIES = {
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  mobileLandscape: '(max-height: 500px) and (orientation: landscape)',
} as const;

/**
 * Breakpoint usage reference:
 *
 * | Breakpoint | Width    | Tailwind | Device Examples           | Layout              |
 * |------------|----------|----------|---------------------------|---------------------|
 * | Base       | 0-639px  | (none)   | iPhone SE, most phones    | Single column       |
 * | sm         | 640px+   | `sm:`    | iPhone Plus landscape     | 2 columns possible  |
 * | md         | 768px+   | `md:`    | iPad portrait             | Sidebar appears     |
 * | lg         | 1024px+  | `lg:`    | iPad landscape, laptops   | Full sidebar        |
 * | xl         | 1280px+  | `xl:`    | Laptops, desktops         | Expanded layouts    |
 * | 2xl        | 1536px+  | `2xl:`   | Large monitors            | Max-width constraints |
 */

/**
 * Desktop-specific breakpoints for gallery layout
 */
export type DesktopBreakpoint = 'desktop' | 'desktopLarge' | 'desktopXL' | 'desktopUltra';

export interface DesktopBreakpointConfig {
  minWidth: number;
  columns: number;
  cardMaxWidth: number;
  panelWidth: number;
  thumbnailStripWidth: number;
  contentMaxWidth: number;
}

export const DESKTOP_BREAKPOINTS: Record<DesktopBreakpoint, DesktopBreakpointConfig> = {
  desktop: {
    minWidth: 1024,
    columns: 4,
    cardMaxWidth: 200,
    panelWidth: 400,
    thumbnailStripWidth: 80,
    contentMaxWidth: 1200,
  },
  desktopLarge: {
    minWidth: 1280,
    columns: 5,
    cardMaxWidth: 220,
    panelWidth: 450,
    thumbnailStripWidth: 100,
    contentMaxWidth: 1400,
  },
  desktopXL: {
    minWidth: 1536,
    columns: 6,
    cardMaxWidth: 240,
    panelWidth: 500,
    thumbnailStripWidth: 120,
    contentMaxWidth: 1600,
  },
  desktopUltra: {
    minWidth: 1920,
    columns: 7,
    cardMaxWidth: 260,
    panelWidth: 550,
    thumbnailStripWidth: 140,
    contentMaxWidth: 1800,
  },
};

/**
 * Get the current desktop breakpoint based on viewport width
 */
export function getDesktopBreakpoint(width: number): DesktopBreakpoint | null {
  if (width >= DESKTOP_BREAKPOINTS.desktopUltra.minWidth) {
    return 'desktopUltra';
  }
  if (width >= DESKTOP_BREAKPOINTS.desktopXL.minWidth) {
    return 'desktopXL';
  }
  if (width >= DESKTOP_BREAKPOINTS.desktopLarge.minWidth) {
    return 'desktopLarge';
  }
  if (width >= DESKTOP_BREAKPOINTS.desktop.minWidth) {
    return 'desktop';
  }
  return null;
}
