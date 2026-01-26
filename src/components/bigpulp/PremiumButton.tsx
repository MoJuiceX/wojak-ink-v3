/**
 * PremiumButton Component
 *
 * Reusable premium-styled button with gradient, glow, and micro-interactions.
 * Used across BigPulp for a polished, premium feel.
 */

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export type PremiumButtonVariant = 'default' | 'active' | 'ghost' | 'accent';
export type PremiumButtonSize = 'sm' | 'md' | 'lg';

interface PremiumButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: PremiumButtonVariant;
  size?: PremiumButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isActive?: boolean;
  fullWidth?: boolean;
}

// Size configurations
const SIZES: Record<PremiumButtonSize, { padding: string; fontSize: string; iconSize: number; gap: string }> = {
  sm: { padding: '6px 12px', fontSize: '12px', iconSize: 14, gap: '6px' },
  md: { padding: '10px 16px', fontSize: '14px', iconSize: 16, gap: '8px' },
  lg: { padding: '14px 20px', fontSize: '16px', iconSize: 18, gap: '10px' },
};

// Variant styles
const getVariantStyles = (variant: PremiumButtonVariant, isActive: boolean) => {
  if (isActive || variant === 'active') {
    return {
      background: 'linear-gradient(135deg, rgba(255,149,0,0.25) 0%, rgba(255,149,0,0.15) 100%)',
      border: '1px solid rgba(255,149,0,0.5)',
      color: 'var(--color-brand-primary)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px rgba(255,149,0,0.15)',
    };
  }

  switch (variant) {
    case 'accent':
      return {
        background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, rgba(255,149,0,0.8) 100%)',
        border: '1px solid rgba(255,149,0,0.6)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(255,149,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
      };
    case 'ghost':
      return {
        background: 'transparent',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-secondary)',
        boxShadow: 'none',
      };
    default:
      return {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'var(--color-text-secondary)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.2)',
      };
  }
};

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      isActive = false,
      fullWidth = false,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const sizeConfig = SIZES[size];
    const variantStyles = getVariantStyles(variant, isActive);

    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={disabled}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: sizeConfig.gap,
          padding: sizeConfig.padding,
          fontSize: sizeConfig.fontSize,
          fontWeight: 600,
          borderRadius: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : 'auto',
          transition: 'all 0.2s ease',
          ...variantStyles,
          ...style,
        }}
        whileHover={
          disabled
            ? undefined
            : {
                scale: 1.02,
                boxShadow:
                  isActive || variant === 'active'
                    ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 0 30px rgba(255,149,0,0.25)'
                    : variant === 'accent'
                      ? '0 6px 20px rgba(255,149,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.3)',
              }
        }
        whileTap={disabled ? undefined : { scale: 0.98 }}
        {...props}
      >
        {Icon && iconPosition === 'left' && <Icon size={sizeConfig.iconSize} />}
        {children}
        {Icon && iconPosition === 'right' && <Icon size={sizeConfig.iconSize} />}
      </motion.button>
    );
  }
);

PremiumButton.displayName = 'PremiumButton';

/**
 * PremiumToggleGroup - A group of toggle buttons with premium styling
 */
interface ToggleOption<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
}

interface PremiumToggleGroupProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: PremiumButtonSize;
  fullWidth?: boolean;
}

export function PremiumToggleGroup<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
}: PremiumToggleGroupProps<T>) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {options.map((option) => (
        <PremiumButton
          key={option.id}
          variant="default"
          size={size}
          icon={option.icon}
          isActive={value === option.id}
          onClick={() => onChange(option.id)}
          style={{ flex: fullWidth ? 1 : undefined }}
        >
          {option.label}
        </PremiumButton>
      ))}
    </div>
  );
}

/**
 * PremiumChip - Small tag/chip style button for filters
 */
interface PremiumChipProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
}

export function PremiumChip({
  children,
  isActive = false,
  onClick,
  onHover,
  onHoverEnd,
}: PremiumChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 14px',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...(isActive
          ? {
              background: 'linear-gradient(135deg, rgba(255,149,0,0.3) 0%, rgba(255,149,0,0.15) 100%)',
              border: '1px solid rgba(255,149,0,0.5)',
              color: 'var(--color-brand-primary)',
              boxShadow: '0 0 16px rgba(255,149,0,0.2)',
            }
          : {
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--color-text-secondary)',
              boxShadow: 'none',
            }),
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: isActive
          ? '0 0 24px rgba(255,149,0,0.3)'
          : '0 4px 12px rgba(0,0,0,0.2)',
      }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

export default PremiumButton;
