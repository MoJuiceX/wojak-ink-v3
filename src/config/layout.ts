/**
 * Layout Design Tokens
 *
 * Centralized layout constants for consistent spacing and dimensions
 * across the wojak.ink application.
 */

export const LAYOUT = {
  // Breakpoints (mobile-first)
  breakpoints: {
    sm: 640,    // Small phones
    md: 768,    // Tablets / Large phones (navigation breakpoint)
    lg: 1024,   // Desktop
    xl: 1280,   // Large desktop
    '2xl': 1536 // Ultra-wide
  },

  // Mobile bottom navigation
  mobileNav: {
    height: 60,           // px - base height (reduced for compact look)
    heightWithLabel: 60,  // px - includes icon + label
    iconSize: 24,         // px
    labelSize: 10,        // px (font-size)
    gapIconLabel: 4,      // px
    paddingX: 8,          // px - horizontal padding per tab
    safeAreaBottom: 'env(safe-area-inset-bottom, 0px)', // iPhone home indicator
  },

  // Desktop sidebar
  sidebar: {
    widthCollapsed: 72,   // px - icon only
    widthExpanded: 240,   // px - with labels
    iconSize: 24,         // px
    itemHeight: 48,       // px
    itemGap: 4,           // px
    paddingY: 16,         // px
    paddingX: 12,         // px
    transitionDuration: 200, // ms
  },

  // Header
  header: {
    height: 64,           // px
    heightMobile: 56,     // px
    logoWidth: 120,       // px
    paddingX: 16,         // px mobile
    paddingXDesktop: 24,  // px desktop (matches gallery grid gap)
  },

  // Content area
  content: {
    paddingMobile: 12,    // px - matches grid gap for equal spacing
    paddingDesktop: 32,   // px
    maxWidth: 1400,       // px
    gapY: 24,             // px between sections
  },

  // Z-index layers
  zIndex: {
    content: 1,
    header: 50,
    sidebar: 40,
    mobileNav: 50,
    modal: 100,
    toast: 110,
    tooltip: 120,
  }
} as const;

export type LayoutBreakpoint = keyof typeof LAYOUT.breakpoints;

/**
 * Media query helpers
 */
export const mediaQueries = {
  sm: `(min-width: ${LAYOUT.breakpoints.sm}px)`,
  md: `(min-width: ${LAYOUT.breakpoints.md}px)`,
  lg: `(min-width: ${LAYOUT.breakpoints.lg}px)`,
  xl: `(min-width: ${LAYOUT.breakpoints.xl}px)`,
  '2xl': `(min-width: ${LAYOUT.breakpoints['2xl']}px)`,
  mobile: `(max-width: ${LAYOUT.breakpoints.md - 1}px)`,
  desktop: `(min-width: ${LAYOUT.breakpoints.md}px)`,
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const;
