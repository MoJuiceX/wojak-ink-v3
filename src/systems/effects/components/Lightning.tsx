import React from 'react';

interface LightningProps {
  data?: {
    color?: string;
  };
  duration: number;
}

export const Lightning: React.FC<LightningProps> = ({
  data = {},
  duration
}) => {
  const { color = 'rgba(255, 255, 255, 0.9)' } = data;

  return (
    <div
      className="effect-lightning"
      style={{
        '--lightning-color': color,
        '--lightning-duration': `${duration}ms`
      } as React.CSSProperties}
    />
  );
};
