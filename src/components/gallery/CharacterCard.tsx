/**
 * CharacterCard Component
 *
 * Individual character type card with image, name, and count.
 * Features hover effects and special styling for rare character types.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CharacterTypeConfig } from '@/types/nft';
import { GALLERY_ANIMATIONS } from '@/config/galleryAnimations';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useHaptic } from '@/hooks/useHaptic';

interface CharacterCardProps {
  character: CharacterTypeConfig;
  isSelected: boolean;
  onSelect: () => void;
  priority?: boolean;
  onHover?: () => void; // For preloading NFTs on hover
}

export function CharacterCard({
  character,
  isSelected,
  onSelect,
  priority = false,
  onHover,
}: CharacterCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const haptic = useHaptic();

  const animations = prefersReducedMotion
    ? GALLERY_ANIMATIONS.reducedMotion.card
    : GALLERY_ANIMATIONS.card;

  // Get accent color or default
  const accentColor = character.accentColor || 'var(--color-brand-primary)';

  // Handle tap with haptic feedback
  const handleTap = () => {
    haptic.tap();
    onSelect();
  };

  return (
    <motion.button
      className="w-full block text-left rounded-xl overflow-hidden transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 aspect-square"
      style={{
        background: 'var(--color-glass-bg)',
        border: isSelected
          ? `2px solid ${accentColor}`
          : '1px solid var(--color-border)',
        boxShadow: isSelected ? `0 0 20px ${accentColor}40` : 'none',
        padding: 0,
        margin: 0,
      }}
      onClick={handleTap}
      onMouseEnter={onHover}
      whileHover={animations.hover}
      whileTap={animations.tap}
      role="button"
      tabIndex={0}
      aria-label={`View ${character.name} NFTs, ${character.count} available`}
      aria-pressed={isSelected}
    >
      {/* Image container - square aspect ratio */}
      <div className="relative w-full h-full overflow-hidden rounded-xl">
        {/* Blur placeholder / loading state */}
        {!imageLoaded && !imageError && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: 'var(--color-glass-bg)',
            }}
          />
        )}

        {/* Character preview image */}
        {!imageError ? (
          <img
            src={character.previewImage}
            alt={character.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        ) : (
          // Fallback placeholder
          <div
            className="absolute inset-0 flex items-center justify-center text-6xl"
            style={{ background: 'var(--color-glass-bg)' }}
          >
            🎭
          </div>
        )}

        {/* Name overlay - bottom left */}
        <div className="absolute bottom-1.5 left-1.5">
          {/* Blur background layer */}
          <div
            className="absolute inset-0 -m-2"
            style={{
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              borderRadius: 10,
              background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.15) 0%, transparent 70%)',
              mask: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
              WebkitMask: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            }}
          />
          {/* Text layer */}
          <span
            className="relative text-sm font-medium truncate"
            style={{
              color: 'white',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.7), 0 0 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            {character.name}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default CharacterCard;
