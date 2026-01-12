/**
 * useScrollReveal Hook
 *
 * Reveals elements as they scroll into view with optional delay.
 * Respects reduced motion preferences.
 */

import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { usePrefersReducedMotion } from './useMediaQuery';
import { SPRING } from '@/config/animation/springs';
import { DURATION, toSeconds } from '@/config/animation/durations';

interface ScrollRevealOptions {
  once?: boolean;
  delay?: number;
  margin?: string;
  amount?: 'some' | 'all' | number;
}

interface ScrollRevealReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  isInView: boolean;
  variants: {
    hidden: object;
    visible: object;
  };
}

export function useScrollReveal(
  options: ScrollRevealOptions = {}
): ScrollRevealReturn {
  const { once = true, delay = 0, amount } = options;
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  const isInView = useInView(ref, {
    once,
    amount,
  });

  const variants = prefersReduced
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: toSeconds(DURATION.normal), delay },
        },
      }
    : {
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            opacity: { duration: toSeconds(DURATION.moderate), delay },
            y: {
              ...SPRING.balanced,
              delay,
            },
          },
        },
      };

  return { ref, isInView, variants };
}

export default useScrollReveal;
