/**
 * CharacterGrid Component
 *
 * Grid display of all character types.
 * Responsive: 2 columns mobile, 3 tablet, 4-5 desktop.
 */

import { motion } from 'framer-motion';
import type { CharacterTypeConfig, CharacterType } from '@/types/nft';
import { gridStaggerVariants, gridItemVariants } from '@/config/galleryAnimations';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { CharacterCard } from './CharacterCard';

interface CharacterGridProps {
  characters: CharacterTypeConfig[];
  onSelectCharacter: (character: CharacterType) => void;
  selectedCharacter?: CharacterType | null;
  isLoading?: boolean;
  onCharacterHover?: (character: CharacterType) => void; // For preloading NFTs
}

function CharacterCardSkeleton() {
  return (
    <div
      className="w-full rounded-xl overflow-hidden animate-pulse aspect-square"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    />
  );
}

export function CharacterGrid({
  characters,
  onSelectCharacter,
  selectedCharacter,
  isLoading = false,
  onCharacterHover,
}: CharacterGridProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[3vw] gap-y-[3vw] sm:gap-3 md:gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <CharacterCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[3vw] gap-y-[3vw] sm:gap-3 md:gap-4"
      variants={prefersReducedMotion ? undefined : gridStaggerVariants}
      initial="hidden"
      animate="visible"
    >
      {characters.map((character, index) => (
        <motion.div
          key={character.id}
          variants={prefersReducedMotion ? undefined : gridItemVariants}
        >
          <CharacterCard
            character={character}
            isSelected={selectedCharacter === character.id}
            onSelect={() => onSelectCharacter(character.id)}
            priority={index < 6} // Eager load first 6 (above fold)
            onHover={onCharacterHover ? () => onCharacterHover(character.id) : undefined}
          />
        </motion.div>
      ))}
      {/* Info box */}
      <motion.div
        variants={prefersReducedMotion ? undefined : gridItemVariants}
      >
        <div
          className="w-full h-full flex flex-col items-center justify-center p-4 text-center rounded-xl"
          style={{
            aspectRatio: '1 / 1',
            background: 'var(--color-glass-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h3
            className="text-sm font-semibold mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Explore the Collection
          </h3>
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Pick a character to explore all their variations. Sort by ID, rank, or price to find what you were always dreaming of.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default CharacterGrid;
