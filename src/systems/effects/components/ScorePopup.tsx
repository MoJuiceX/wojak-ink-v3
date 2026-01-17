import React from 'react';

interface ScorePopupProps {
  position?: { x: number; y: number };
  data?: {
    score: number;
    prefix?: string;
    color?: string;
    label?: string;
  };
  duration: number;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({
  position = { x: 50, y: 50 },
  data = { score: 0 },
  duration
}) => {
  const { score, prefix = '+', color = '#FFD700', label } = data;

  return (
    <div
      className="effect-score-popup"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        '--popup-color': color,
        '--popup-duration': `${duration}ms`
      } as React.CSSProperties}
    >
      <span className="score-value">{prefix}{score.toLocaleString()}</span>
      {label && <span className="score-label">{label}</span>}
    </div>
  );
};
