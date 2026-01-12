/**
 * Slider Component
 *
 * Accessible range slider with custom styling.
 */

import { useId } from 'react';

interface SliderProps {
  id?: string;
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function Slider({
  id: propId,
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  showValue = true,
  valueFormatter = (v) => `${Math.round(v)}%`,
  className = '',
}: SliderProps) {
  const generatedId = useId();
  const id = propId || generatedId;

  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const stepValue = (max - min) / 20; // 5% increments

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        onChange(Math.max(min, value - stepValue));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        onChange(Math.min(max, value + stepValue));
        break;
      case 'Home':
        e.preventDefault();
        onChange(min);
        break;
      case 'End':
        e.preventDefault();
        onChange(max);
        break;
      case 'PageUp':
        e.preventDefault();
        onChange(Math.min(max, value + stepValue * 2));
        break;
      case 'PageDown':
        e.preventDefault();
        onChange(Math.max(min, value - stepValue * 2));
        break;
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium sr-only"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {label}
        </label>
      )}

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueFormatter(value)}
        className={`
          flex-1 h-1.5 rounded-full appearance-none cursor-pointer
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          focus-visible:ring-[var(--color-brand-primary)]
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-webkit-slider-thumb]:active:scale-95
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer
        `}
        style={{
          background: `linear-gradient(to right, var(--color-brand-primary) ${percentage}%, var(--color-border) ${percentage}%)`,
        }}
      />

      {showValue && (
        <span
          className="text-xs font-medium tabular-nums min-w-[36px] text-right"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {valueFormatter(value)}
        </span>
      )}
    </div>
  );
}

export default Slider;
