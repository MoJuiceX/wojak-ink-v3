/**
 * useScrollReveal Hook
 *
 * Detects when an element enters the viewport for scroll-triggered animations.
 * Uses Framer Motion's useInView hook internally.
 */

import { useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

interface UseScrollRevealOptions {
  /** Only trigger once (default: true) */
  once?: boolean;
  /** Margin around the viewport (default: '-100px') */
  margin?: string;
  /** Intersection threshold (0-1) */
  threshold?: number;
}

interface UseScrollRevealReturn<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  isInView: boolean;
  shouldAnimate: boolean;
}

/**
 * Hook for scroll-triggered reveal animations
 *
 * @example
 * ```tsx
 * const { ref, isInView, shouldAnimate } = useScrollReveal<HTMLDivElement>();
 *
 * <motion.div
 *   ref={ref}
 *   initial={{ opacity: 0, y: 30 }}
 *   animate={isInView ? { opacity: 1, y: 0 } : {}}
 *   transition={{ duration: shouldAnimate ? 0.5 : 0 }}
 * >
 *   Content
 * </motion.div>
 * ```
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): UseScrollRevealReturn<T> {
  const { once = true, margin = '-100px', threshold } = options;

  const ref = useRef<T>(null);
  const prefersReducedMotion = useReducedMotion();

  const isInView = useInView(ref, {
    once,
    // @ts-expect-error - margin type is stricter than what we're passing
    margin,
    amount: threshold,
  });

  return {
    ref,
    isInView,
    shouldAnimate: !prefersReducedMotion,
  };
}

/**
 * Preset animation variants for scroll reveal
 */
export const scrollRevealVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' as const },
    },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' as const },
    },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  },
  slideRight: {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  },
};

/**
 * Stagger container variants for animating lists
 */
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Stagger item variants
 */
export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export default useScrollReveal;
