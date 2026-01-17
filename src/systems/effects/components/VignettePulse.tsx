import React from 'react';

interface VignettePulseProps {
  data?: {
    color?: string;
    intensity?: number;
  };
  duration: number;
}

export const VignettePulse: React.FC<VignettePulseProps> = ({
  data = {},
  duration
}) => {
  const { color = 'rgba(255, 140, 50, 0.5)', intensity = 150 } = data;

  return (
    <div
      className="effect-vignette-pulse"
      style={{
        '--vignette-color': color,
        '--vignette-intensity': `${intensity}px`,
        '--vignette-duration': `${duration}ms`
      } as React.CSSProperties}
    />
  );
};
