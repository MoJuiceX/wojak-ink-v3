import React from 'react';

interface ScreenShakeProps {
  data?: {
    intensity?: number; // 1-10
  };
  duration: number;
}

export const ScreenShake: React.FC<ScreenShakeProps> = ({
  data = {},
  duration
}) => {
  const { intensity = 3 } = data;

  return (
    <div
      className="effect-screen-shake"
      style={{
        '--shake-intensity': intensity,
        '--shake-duration': `${duration}ms`
      } as React.CSSProperties}
    />
  );
};
