/**
 * Volume Slider Component
 *
 * Audio control with toggle and volume slider.
 */

import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Slider } from '@/components/ui/Slider';

interface VolumeSliderProps {
  id: string;
  label: string;
  description?: string;
  volume: number;
  enabled: boolean;
  onVolumeChange: (volume: number) => void;
  onToggle: (enabled: boolean) => void;
}

function getVolumeIcon(volume: number, enabled: boolean) {
  if (!enabled || volume === 0) {
    return <VolumeX size={18} />;
  }
  if (volume < 0.5) {
    return <Volume1 size={18} />;
  }
  return <Volume2 size={18} />;
}

export function VolumeSlider({
  id,
  label,
  description,
  volume,
  enabled,
  onVolumeChange,
  onToggle,
}: VolumeSliderProps) {
  const volumePercent = Math.round(volume * 100);

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header with toggle */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span style={{ color: enabled ? 'var(--color-brand-primary)' : 'var(--color-text-muted)' }}>
            {getVolumeIcon(volume, enabled)}
          </span>
          <div>
            <label
              htmlFor={`${id}-slider`}
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {label}
            </label>
            {description && (
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Simple toggle matching Gyroscope Parallax style */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={`Toggle ${label}`}
          onClick={() => onToggle(!enabled)}
          className="w-12 h-7 rounded-full relative cursor-pointer transition-colors"
          style={{
            background: enabled ? 'var(--color-brand-primary)' : 'var(--color-border)',
          }}
        >
          <div
            className="absolute top-1 w-5 h-5 rounded-full transition-all duration-200"
            style={{
              background: enabled ? '#fff' : 'var(--color-text-muted)',
              left: enabled ? 'calc(100% - 1.25rem - 0.25rem)' : '0.25rem',
            }}
          />
        </button>
      </div>

      {/* Volume slider */}
      <div className={`${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <Slider
          id={`${id}-slider`}
          label={`${label} volume`}
          value={volumePercent}
          min={0}
          max={100}
          step={5}
          onChange={(v) => onVolumeChange(v / 100)}
          disabled={!enabled}
          valueFormatter={(v) => `${Math.round(v)}%`}
        />
      </div>
    </div>
  );
}

export default VolumeSlider;
