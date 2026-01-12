/**
 * DesktopCharacterCard Component
 *
 * Enhanced character card for desktop with premium hover effects:
 * - Lift animation with overshoot easing
 * - Image scale on hover
 * - Orange glow border
 * - Name overlay with gradient fade
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CharacterTypeConfig } from '@/types/nft';
import { DESKTOP_LAYOUT } from '@/config/desktopLayout';
import { DESKTOP_ANIMATIONS } from '@/config/desktopAnimations';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface DesktopCharacterCardProps {
  character: CharacterTypeConfig;
  onSelect: () => void;
  priority?: boolean;
  onHover?: () => void; // For preloading NFTs
}

export function DesktopCharacterCard({
  character,
  onSelect,
  priority = false,
  onHover,
}: DesktopCharacterCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const { cardHover } = DESKTOP_ANIMATIONS;
  const { card, cardHover: hoverConfig } = DESKTOP_LAYOUT;

  // Animation variants
  const cardVariants = prefersReducedMotion
    ? undefined
    : {
        rest: {
          y: 0,
          boxShadow: hoverConfig.shadow.default,
        },
        hover: {
          y: hoverConfig.liftY,
          boxShadow: hoverConfig.shadow.hover,
          transition: cardHover.lift.transition,
        },
        tap: {
          y: hoverConfig.liftYPressed,
          scale: hoverConfig.pressedScale,
          transition: { duration: 0.1 },
        },
      };

  const imageVariants = prefersReducedMotion
    ? undefined
    : {
        rest: { scale: 1 },
        hover: {
          scale: hoverConfig.imageScale,
          transition: cardHover.imageScale.transition,
        },
      };

  return (
    <motion.button
      className="w-full text-left overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
      style={{
        background: 'var(--color-glass-bg)',
        border: isHovered
          ? `1px solid ${hoverConfig.borderColor}`
          : '1px solid var(--color-border)',
        borderRadius: card.borderRadius,
        // Focus ring styles
        outlineColor: 'var(--color-brand-primary)',
        outlineOffset: 4,
      }}
      variants={cardVariants}
      initial="rest"
      animate={isHovered ? 'hover' : 'rest'}
      whileTap="tap"
      onHoverStart={() => {
        setIsHovered(true);
        onHover?.();
      }}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Image container - square aspect ratio */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: '1 / 1',
          borderRadius: card.borderRadius,
        }}
      >
        <motion.img
          src={character.previewImage}
          alt={character.name}
          className="w-full h-full object-cover"
          variants={imageVariants}
          loading={priority ? 'eager' : 'lazy'}
          draggable={false}
        />

        {/* Name overlay - bottom left */}
        <div className="absolute bottom-2 left-2">
          {/* Blur background layer */}
          <div
            className="absolute inset-0 -m-2"
            style={{
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              borderRadius: 12,
              background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.15) 0%, transparent 70%)',
              mask: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
              WebkitMask: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            }}
          />
          {/* Text layer */}
          <span
            className="relative text-base font-semibold truncate"
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

export default DesktopCharacterCard;
