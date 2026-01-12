/**
 * GlowContainer Component
 *
 * Wrapper that applies theme-appropriate glow effects.
 * Respects reduced motion preferences automatically.
 */

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

type GlowIntensity = 'subtle' | 'primary' | 'intense';

interface GlowContainerProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  /** Glow intensity level */
  intensity?: GlowIntensity;
  /** Whether to animate the glow */
  animated?: boolean;
  /** Whether to show border glow */
  borderGlow?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Children elements */
  children: React.ReactNode;
}

const intensityClasses: Record<GlowIntensity, string> = {
  subtle: 'glow-box-subtle',
  primary: 'glow-box',
  intense: 'glow-box-intense',
};

/**
 * GlowContainer wraps content with theme-aware glow effects.
 *
 * @example
 * ```tsx
 * <GlowContainer intensity="primary" animated>
 *   <Card>Glowing content</Card>
 * </GlowContainer>
 * ```
 */
export const GlowContainer = forwardRef<HTMLDivElement, GlowContainerProps>(
  function GlowContainer(
    {
      intensity = 'primary',
      animated = false,
      borderGlow = false,
      className = '',
      children,
      ...props
    },
    ref
  ) {
    const glowClass = intensityClasses[intensity];
    const animatedClass = animated ? 'glow-border-animated' : '';
    const borderGlowClass = borderGlow ? 'glow-border' : '';

    return (
      <motion.div
        ref={ref}
        className={`
          ${glowClass}
          ${animatedClass}
          ${borderGlowClass}
          ${className}
        `.trim()}
        // Respect reduced motion - don't animate if user prefers reduced motion
        initial={animated ? { opacity: 0.9 } : false}
        animate={animated ? { opacity: 1 } : undefined}
        transition={
          animated
            ? {
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 2,
                ease: 'easeInOut',
              }
            : undefined
        }
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

export default GlowContainer;
