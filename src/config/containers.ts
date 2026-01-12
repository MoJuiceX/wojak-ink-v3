/**
 * Container Query Configuration
 *
 * Container queries allow components to respond to their container size
 * rather than the viewport, enabling truly reusable components.
 */

/**
 * Container breakpoints for container queries
 */
export const CONTAINER_BREAKPOINTS = {
  xs: 200, // Very compact (sidebar icons)
  sm: 300, // Compact (narrow sidebar)
  md: 400, // Medium (cards)
  lg: 600, // Large (main content)
  xl: 800, // Extra large (wide containers)
} as const;

export type ContainerBreakpoint = keyof typeof CONTAINER_BREAKPOINTS;

/**
 * Container query CSS strings
 */
export const CONTAINER_QUERIES = {
  xs: `(min-width: ${CONTAINER_BREAKPOINTS.xs}px)`,
  sm: `(min-width: ${CONTAINER_BREAKPOINTS.sm}px)`,
  md: `(min-width: ${CONTAINER_BREAKPOINTS.md}px)`,
  lg: `(min-width: ${CONTAINER_BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${CONTAINER_BREAKPOINTS.xl}px)`,
} as const;

/**
 * Container configuration for common use cases
 */
export const CONTAINER_CONFIGS = {
  card: {
    name: 'card',
    type: 'inline-size' as const,
    breakpoints: {
      compact: CONTAINER_BREAKPOINTS.sm,
      expanded: CONTAINER_BREAKPOINTS.md,
    },
  },
  sidebar: {
    name: 'sidebar',
    type: 'inline-size' as const,
    breakpoints: {
      collapsed: CONTAINER_BREAKPOINTS.xs,
      expanded: CONTAINER_BREAKPOINTS.sm,
    },
  },
  grid: {
    name: 'grid',
    type: 'inline-size' as const,
    breakpoints: {
      compact: CONTAINER_BREAKPOINTS.md,
      expanded: CONTAINER_BREAKPOINTS.lg,
    },
  },
} as const;
