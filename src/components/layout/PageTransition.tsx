/**
 * PageTransition Component
 *
 * Wraps page content with enter/exit animations.
 * Respects prefers-reduced-motion.
 */

import { motion } from 'framer-motion';
import { pageTransition, reducedMotion } from '@/config/animations';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const animations = prefersReducedMotion
    ? reducedMotion.page
    : pageTransition;

  return (
    <motion.div
      className={`flex-1 flex flex-col ${className}`}
      initial={animations.enter.initial}
      animate={animations.enter.animate}
      exit={animations.exit.animate}
      transition={animations.enter.transition}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
