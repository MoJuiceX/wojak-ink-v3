import React from 'react';

interface ComboTextProps {
  position?: { x: number; y: number };
  data?: {
    text: string;
    level?: number; // 1-10, affects color and size
    subtext?: string;
  };
  duration: number;
}

const COMBO_COLORS = [
  '#FFFFFF',    // Level 1
  '#FFD93D',    // Level 2
  '#FF8C42',    // Level 3
  '#FF6B35',    // Level 4
  '#FF4757',    // Level 5
  '#E91E63',    // Level 6
  '#9B59B6',    // Level 7
  '#3498DB',    // Level 8
  '#00D4FF',    // Level 9
  '#FFD700',    // Level 10 (GOLD)
];

export const ComboText: React.FC<ComboTextProps> = ({
  position = { x: 50, y: 50 },
  data = { text: 'COMBO!' },
  duration
}) => {
  const { text, level = 1, subtext } = data;
  const color = COMBO_COLORS[Math.min(level - 1, COMBO_COLORS.length - 1)];
  const scale = 1 + (level * 0.1);

  return (
    <div
      className="effect-combo-text"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        '--combo-color': color,
        '--combo-scale': scale,
        '--combo-duration': `${duration}ms`
      } as React.CSSProperties}
    >
      <span className="combo-main">{text}</span>
      {subtext && <span className="combo-sub">{subtext}</span>}
    </div>
  );
};
