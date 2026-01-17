import React from 'react';

interface FloatingEmojiProps {
  position?: { x: number; y: number };
  data?: {
    emoji?: string;
    size?: number;
  };
  duration: number;
}

export const FloatingEmoji: React.FC<FloatingEmojiProps> = ({
  position = { x: 50, y: 50 },
  data = {},
  duration
}) => {
  const { emoji = '🔥', size = 2 } = data;

  return (
    <div
      className="effect-floating-emoji"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        '--emoji-size': `${size}rem`,
        '--emoji-duration': `${duration}ms`
      } as React.CSSProperties}
    >
      {emoji}
    </div>
  );
};
