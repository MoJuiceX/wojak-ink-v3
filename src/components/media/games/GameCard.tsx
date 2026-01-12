/**
 * Game Card Component
 *
 * Individual game card with accessibility features display.
 */

import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { MiniGame } from '@/types/media';
import { ACCESSIBILITY_ICONS, DIFFICULTY_COLORS } from '@/config/games';
import { gameCardVariants } from '@/config/mediaAnimations';

interface GameCardProps {
  game: MiniGame;
  onClick: () => void;
}

export const GameCard = memo(function GameCard({ game, onClick }: GameCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const accessibilityIcons = Object.entries(game.accessibilityFeatures)
    .filter(([, enabled]) => enabled)
    .map(([key]) => ACCESSIBILITY_ICONS[key as keyof typeof ACCESSIBILITY_ICONS])
    .slice(0, 4);

  return (
    <motion.button
      className="relative flex flex-col items-center p-4 rounded-xl text-center transition-colors"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
      variants={prefersReducedMotion ? undefined : gameCardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      onHoverStart={(e) => {
        const target = e.target as HTMLElement;
        target.style.borderColor = game.accentColor;
        target.style.boxShadow = `0 0 20px ${game.accentColor}40`;
      }}
      onHoverEnd={(e) => {
        const target = e.target as HTMLElement;
        target.style.borderColor = 'var(--color-border)';
        target.style.boxShadow = 'none';
      }}
    >
      {/* Emoji icon */}
      <div className="text-5xl mb-3">{game.emoji}</div>

      {/* Name */}
      <h3
        className="text-base font-semibold mb-1"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {game.name}
      </h3>

      {/* Difficulty & Time */}
      {game.difficulty && (
        <div
          className="flex items-center gap-2 text-xs mb-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{
              background: `${DIFFICULTY_COLORS[game.difficulty]}20`,
              color: DIFFICULTY_COLORS[game.difficulty],
            }}
          >
            {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
          </span>
          {game.estimatedPlayTime && (
            <span>{game.estimatedPlayTime}</span>
          )}
        </div>
      )}

      {/* Accessibility icons */}
      <div className="flex gap-1 mt-1">
        {accessibilityIcons.map((iconInfo, index) => (
          <span
            key={index}
            title={iconInfo.label}
            className="text-sm opacity-60"
          >
            {iconInfo.icon}
          </span>
        ))}
      </div>

      {/* Status badge */}
      {game.status === 'coming-soon' && (
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium"
          style={{
            background: 'var(--color-brand-primary)',
            color: 'white',
          }}
        >
          Coming Soon
        </div>
      )}

      {game.status === 'maintenance' && (
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium"
          style={{
            background: 'var(--color-warning)',
            color: 'black',
          }}
        >
          Maintenance
        </div>
      )}
    </motion.button>
  );
});

export default GameCard;
