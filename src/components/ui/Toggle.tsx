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
    track: 'w-10 h-6',
    thumb: 'w-4 h-4',
    thumbTranslate: 16,
    thumbOffset: 4, // (24 - 16) / 2 = 4px for centering
  },
  medium: {
    track: 'w-12 h-7',
    thumb: 'w-5 h-5',
    thumbTranslate: 20,
    thumbOffset: 4, // (28 - 20) / 2 = 4px for centering
  },
  large: {
    track: 'w-14 h-8',
    thumb: 'w-6 h-6',
    thumbTranslate: 24,
    thumbOffset: 4, // (32 - 24) / 2 = 4px for centering
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
          ${config.track} rounded-full relative transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          focus-visible:ring-[var(--color-brand-primary)]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{
          background: checked
            ? 'var(--color-brand-primary)'
            : 'var(--color-bg-tertiary)',
          border: checked ? 'none' : '1px solid var(--color-border)',
        }}
      >
        <motion.span
          className={`
            ${config.thumb} absolute bg-white rounded-full shadow-sm
          `}
          variants={prefersReducedMotion ? undefined : toggleThumbVariants}
          animate={checked ? 'on' : 'off'}
          custom={config.thumbTranslate}
          transition={
            prefersReducedMotion
              ? { duration: 0.05 }
              : { type: 'spring', stiffness: 500, damping: 30 }
          }
          style={{
            top: config.thumbOffset,
            left: config.thumbOffset,
            x: checked ? config.thumbTranslate : 0,
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
