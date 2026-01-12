/**
 * Games Grid Component
 *
 * Responsive grid of game cards.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { Gamepad2, Keyboard } from 'lucide-react';
import type { MiniGame } from '@/types/media';
import { GameCard } from './GameCard';
import { gameGridVariants } from '@/config/mediaAnimations';

interface GamesGridProps {
  games: MiniGame[];
  onGameSelect: (game: MiniGame) => void;
  isLoading?: boolean;
}

function GameCardSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="aspect-video"
        style={{ background: 'var(--color-border)' }}
      />
      <div className="p-3 space-y-2">
        <div
          className="h-4 rounded"
          style={{ background: 'var(--color-border)', width: '70%' }}
        />
        <div
          className="h-3 rounded"
          style={{ background: 'var(--color-border)', width: '50%' }}
        />
      </div>
    </div>
  );
}

export function GamesGrid({ games, onGameSelect, isLoading = false }: GamesGridProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2
            size={24}
            style={{ color: 'var(--color-brand-primary)' }}
          />
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Mini Games
          </h2>
        </div>

        {/* Accessibility legend button */}
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors"
          style={{
            background: 'var(--color-glass-bg)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}
          title="Keyboard accessible games"
        >
          <Keyboard size={14} />
          <span className="hidden sm:inline">Accessibility</span>
        </button>
      </div>

      {/* Games grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          variants={prefersReducedMotion ? undefined : gameGridVariants}
          initial="initial"
          animate="animate"
        >
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => onGameSelect(game)}
            />
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {!isLoading && games.length === 0 && (
        <div
          className="p-8 rounded-xl text-center"
          style={{
            background: 'var(--color-glass-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Gamepad2
            size={48}
            className="mx-auto mb-4 opacity-30"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <p style={{ color: 'var(--color-text-muted)' }}>
            No games available yet
          </p>
        </div>
      )}
    </div>
  );
}

export default GamesGrid;
