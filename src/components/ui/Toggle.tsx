/**
 * Toggle Component
 *
 * Accessible toggle switch with proper ARIA attributes.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { toggleThumbVariants } from '@/config/settingsAnimations';

interface ToggleProps {
  id: string;
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeConfig = {
  small: {
    trackWidth: 44,          // px
    trackHeight: 24,         // px - matches thumb + 4px padding
    thumbSize: 20,           // px
    thumbOffset: 2,          // (24 - 20) / 2 = 2px vertical centering
  },
  medium: {
    trackWidth: 50,          // px
    trackHeight: 28,         // px - matches thumb + 4px padding
    thumbSize: 24,           // px
    thumbOffset: 2,          // (28 - 24) / 2 = 2px vertical centering
  },
  large: {
    trackWidth: 56,          // px
    trackHeight: 32,         // px - matches thumb + 4px padding
    thumbSize: 28,           // px
    thumbOffset: 2,          // (32 - 28) / 2 = 2px vertical centering
  },
};

export function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  size = 'medium',
  className = '',
}: ToggleProps) {
  const prefersReducedMotion = useReducedMotion();
  const descriptionId = description ? `${id}-description` : undefined;

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={id}
              className="text-sm font-medium cursor-pointer"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              id={descriptionId}
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {description}
            </p>
          )}
        </div>
      )}

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-describedby={descriptionId}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          rounded-full relative transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          focus-visible:ring-[var(--color-brand-primary)]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{
          width: config.trackWidth,
          height: config.trackHeight,
          background: checked
            ? 'var(--color-brand-primary)'
            : 'var(--color-bg-tertiary)',
          border: checked ? 'none' : '1px solid var(--color-border)',
        }}
      >
        <motion.span
          className="absolute bg-white rounded-full shadow-sm"
          variants={prefersReducedMotion ? undefined : toggleThumbVariants}
          animate={checked ? 'on' : 'off'}
          custom={config.trackWidth - config.thumbSize - config.thumbOffset * 2}
          transition={
            prefersReducedMotion
              ? { duration: 0.05 }
              : { type: 'spring', stiffness: 500, damping: 30 }
          }
          style={{
            width: config.thumbSize,
            height: config.thumbSize,
            top: config.thumbOffset,
            left: config.thumbOffset,
            x: checked ? config.trackWidth - config.thumbSize - config.thumbOffset * 2 : 0,
          }}
          aria-hidden="true"
        />
      </button>

      <span
        className="text-xs font-medium min-w-[24px]"
        style={{ color: 'var(--color-text-muted)' }}
        aria-hidden="true"
      >
        {checked ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}

export default Toggle;
