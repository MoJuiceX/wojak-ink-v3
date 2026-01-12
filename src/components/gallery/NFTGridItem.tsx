/**
 * NFT Grid Item Component
 *
 * Individual NFT thumbnail in the gallery grid with:
 * - Staggered cascade reveal animation
 * - Hover preloading for full-size image
 * - Optimized rendering with GPU acceleration
 * - Loading state handling
 */

import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useHoverPreload } from '@/hooks/useImagePreloader';
import { nftGridItemVariants } from '@/config/galleryAnimations';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import type { NFT } from '@/types/nft';

interface NFTGridItemProps {
  nft: NFT;
  index: number;
  onClick: (nftId: string) => void;
  eagerLoad?: boolean;
}

export const NFTGridItem = memo(function NFTGridItem({
  nft,
  index,
  onClick,
  eagerLoad = false,
}: NFTGridItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Preload full image on hover (for when user opens explorer)
  const { onMouseEnter, onMouseLeave } = useHoverPreload(nft.imageUrl);

  const handleClick = useCallback(() => {
    onClick(nft.id);
  }, [onClick, nft.id]);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <motion.button
      className="group relative aspect-square rounded-lg overflow-hidden hover:scale-110 hover:z-10 transition-transform duration-150 ease-out"
      style={{
        border: '1px solid var(--color-border)',
      }}
      variants={prefersReducedMotion ? undefined : nftGridItemVariants}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-preload-index={index}
    >
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ background: 'var(--color-glass-bg)' }}
        />
      )}

      {/* Error state */}
      {imageError && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'var(--color-glass-bg)' }}
        >
          <span
            className="text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Error
          </span>
        </div>
      )}

      {/* Image */}
      {!imageError && (
        <img
          src={nft.thumbnailUrl}
          alt={nft.name}
          className="w-full h-full object-cover"
          style={{ opacity: imageLoaded ? 1 : 0 }}
          loading={eagerLoad ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Name overlay - appears on hover */}
      <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-75">
        {/* Blur background layer */}
        <div
          className="absolute inset-0 -m-1"
          style={{
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            borderRadius: 8,
            background:
              'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.15) 0%, transparent 70%)',
            mask: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            WebkitMask:
              'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          }}
        />
        {/* Text layer */}
        <span
          className="relative text-xs font-medium truncate"
          style={{
            color: 'white',
            textShadow:
              '0 1px 4px rgba(0, 0, 0, 0.7), 0 0 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          {nft.name}
        </span>
      </div>
    </motion.button>
  );
});

export default NFTGridItem;
