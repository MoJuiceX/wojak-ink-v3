import React from 'react';

interface ShockwaveProps {
  position?: { x: number; y: number };
  data?: {
    color?: string;
    size?: number;
  };
  duration: number;
}

export const Shockwave: React.FC<ShockwaveProps> = ({
  position = { x: 50, y: 50 },
  data = {},
  duration
}) => {
  const { color = 'rgba(255, 140, 50, 0.6)', size = 200 } = data;

  return (
    <div
      className="effect-shockwave"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        '--shockwave-color': color,
        '--shockwave-size': `${size}px`,
        '--shockwave-duration': `${duration}ms`
      } as React.CSSProperties}
    />
  );
};
