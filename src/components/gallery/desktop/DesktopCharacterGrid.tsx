/**
 * DesktopCharacterGrid Component
 *
 * Responsive grid layout for desktop character cards.
 * - 4 columns at 1024-1439px
 * - 5 columns at 1440px+
 * - Larger gaps and padding at bigger breakpoints
 */

import { motion } from 'framer-motion';
import type { CharacterTypeConfig, CharacterType } from '@/types/nft';
import { DesktopCharacterCard } from './DesktopCharacterCard';
import { useDesktopBreakpoint } from '@/hooks/useDesktopBreakpoint';

interface DesktopCharacterGridProps {
  characters: CharacterTypeConfig[];
  onSelectCharacter: (characterId: CharacterType) => void;
  selectedCharacter?: CharacterType | null;
  isLoading?: boolean;
  onCharacterHover?: (character: CharacterType) => void; // For preloading NFTs
}

function DesktopCharacterCardSkeleton() {
  return (
    <div
      className="w-full overflow-hidden animate-pulse"
      style={{
        aspectRatio: '1 / 1',
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
      }}
    />
  );
}

export function DesktopCharacterGrid({
  characters,
  onSelectCharacter,
  isLoading = false,
  onCharacterHover,
}: DesktopCharacterGridProps) {
  const { columns, gridGap } = useDesktopBreakpoint();

  // Stagger animation for cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  if (isLoading) {
    return (
      <div
        style={{
          padding: gridGap,
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: gridGap,
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <DesktopCharacterCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      style={{
        padding: gridGap,
      }}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: gridGap,
          alignItems: 'start',
        }}
      >
        {characters.map((character, index) => (
          <motion.div key={character.id} variants={itemVariants} style={{ width: '100%' }}>
            <DesktopCharacterCard
              character={character}
              onSelect={() => onSelectCharacter(character.id)}
              priority={index < 8}
              onHover={onCharacterHover ? () => onCharacterHover(character.id) : undefined}
            />
          </motion.div>
        ))}
        {/* Info box */}
        <motion.div
          variants={itemVariants}
          style={{ width: '100%' }}
        >
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
            style={{
              aspectRatio: '1 / 1',
              background: 'var(--color-glass-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
            }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Explore the Collection
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Pick a character to explore all their variations. Sort by ID, rank, or price to find what you were always dreaming of.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default DesktopCharacterGrid;
