/**
 * GlassCard Component
 *
 * Pre-styled glass morphism card with theme-aware styling.
 * Supports multiple variants and interactive states.
 */

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

type GlassCardVariant = 'default' | 'hover' | 'strong' | 'interactive';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  /** Card style variant */
  variant?: GlassCardVariant;
  /** Show glow border effect */
  glowBorder?: boolean;
  /** Animate the glow border */
  animatedGlow?: boolean;
  /** Enable hover lift effect */
  hoverLift?: boolean;
  /** Enable hover glow effect */
  hoverGlow?: boolean;
  /** Padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Children elements */
  children: React.ReactNode;
}

const variantClasses: Record<GlassCardVariant, string> = {
  default: 'glass-card',
  hover: 'glass-card-hover',
  strong: 'glass-card-strong',
  interactive: 'glass-card cursor-pointer',
};

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

/**
 * GlassCard provides a consistent glass morphism container.
 *
 * @example
 * ```tsx
 * <GlassCard variant="default" padding="md" hoverLift>
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </GlassCard>
 * ```
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    {
      variant = 'default',
      glowBorder = false,
      animatedGlow = false,
      hoverLift = false,
      hoverGlow = false,
      padding = 'md',
      className = '',
      children,
      ...props
    },
    ref
  ) {
    const baseClass = variantClasses[variant];
    const padClass = paddingClasses[padding];
    const glowBorderClass = glowBorder ? 'glow-border' : '';
    const animatedGlowClass = animatedGlow ? 'glow-border-animated' : '';
    const hoverLiftClass = hoverLift ? 'hover-lift' : '';
    const hoverGlowClass = hoverGlow ? 'hover-glow' : '';

    return (
      <motion.div
        ref={ref}
        className={`
          ${baseClass}
          ${padClass}
          ${glowBorderClass}
          ${animatedGlowClass}
          ${hoverLiftClass}
          ${hoverGlowClass}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        whileHover={variant === 'interactive' ? { scale: 1.01 } : undefined}
        whileTap={variant === 'interactive' ? { scale: 0.99 } : undefined}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

export default GlassCard;
