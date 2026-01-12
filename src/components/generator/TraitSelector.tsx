/**
 * Trait Selector Component
 *
 * Grid of trait cards for the active layer.
 * Renders MouthLayerSelector for mouth-related layers.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Ban } from 'lucide-react';
import { useGenerator } from '@/contexts/GeneratorContext';
import { traitGridVariants } from '@/config/generatorAnimations';
import { MouthLayerSelector } from './MouthLayerSelector';
import type { LayerImage } from '@/services/generatorService';

interface TraitSelectorProps {
  className?: string;
}

function TraitCardSkeleton() {
  return (
    <div
      className="aspect-square rounded-xl overflow-hidden animate-pulse"
      style={{
        background: 'var(--color-border)',
        border: '1px solid var(--color-border)',
      }}
    />
  );
}

interface NoneCardProps {
  isSelected: boolean;
  onClick: () => void;
}

function NoneCard({ isSelected, onClick }: NoneCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      className="aspect-square relative rounded-xl overflow-hidden transition-all"
      style={{
        background: 'var(--color-glass-bg)',
        border: isSelected
          ? '2px solid var(--color-brand-primary)'
          : '1px solid var(--color-border)',
      }}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      onClick={onClick}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Ban
          size={40}
          style={{ color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-muted)' }}
        />
      </div>
      {isSelected && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-brand-primary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
          </div>
        </div>
      )}
    </motion.button>
  );
}

interface ImageCardProps {
  image: LayerImage;
  isSelected: boolean;
  isDisabled: boolean;
  disabledReason?: string | null;
  onClick: () => void;
}

function ImageCard({ image, isSelected, isDisabled, disabledReason, onClick }: ImageCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      className="aspect-square relative rounded-xl overflow-hidden transition-all"
      style={{
        background: 'var(--color-glass-bg)',
        border: isSelected
          ? '2px solid var(--color-brand-primary)'
          : '1px solid var(--color-border)',
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
      whileHover={prefersReducedMotion || isDisabled ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion || isDisabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={isDisabled}
      title={isDisabled && disabledReason ? disabledReason : undefined}
    >
      <img
        src={image.path}
        alt={image.displayName}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {isSelected && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-brand-primary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
          </div>
        </div>
      )}
    </motion.button>
  );
}

// Default layer paths for preview composites
const DEFAULT_BASE_PATH = '/assets/wojak-layers/BASE/BASE_Base-Wojak_classic.png';
const DEFAULT_CLOTHES_PATH = '/assets/wojak-layers/CLOTHES/CLOTHES_Tee_blue.png';
const DEFAULT_MOUTH_PATH = '/assets/wojak-layers/MOUTH/MOUTH_numb.png';

// Clothes paths for each base variant preview
const BASE_CLOTHES_MAP: Record<string, string> = {
  classic: '/assets/wojak-layers/CLOTHES/CLOTHES_Tank-Top_orange.png',
  rekt: '/assets/wojak-layers/CLOTHES/CLOTHES_Tank-Top_red.png',
  rugged: '/assets/wojak-layers/CLOTHES/CLOTHES_Tee_blue.png',
  bleeding: '/assets/wojak-layers/CLOTHES/CLOTHES_Tee_orange.png',
  terminator: '/assets/wojak-layers/CLOTHES/CLOTHES_Tee_red.png',
};

function getClothesForBase(basePath: string): string {
  const lowerPath = basePath.toLowerCase();
  for (const [key, clothesPath] of Object.entries(BASE_CLOTHES_MAP)) {
    if (lowerPath.includes(key)) {
      return clothesPath;
    }
  }
  return DEFAULT_CLOTHES_PATH;
}

interface BaseImageCardProps {
  image: LayerImage;
  isSelected: boolean;
  isDisabled: boolean;
  disabledReason?: string | null;
  onClick: () => void;
}

function BaseImageCard({ image, isSelected, isDisabled, disabledReason, onClick }: BaseImageCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      className="aspect-square relative rounded-xl overflow-hidden transition-all"
      style={{
        background: 'var(--color-glass-bg)',
        border: isSelected
          ? '2px solid var(--color-brand-primary)'
          : '1px solid var(--color-border)',
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
      whileHover={prefersReducedMotion || isDisabled ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion || isDisabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={isDisabled}
      title={isDisabled && disabledReason ? disabledReason : undefined}
    >
      {/* Base layer */}
      <img
        src={image.path}
        alt={image.displayName}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {/* Clothes layer (varies by base) */}
      <img
        src={getClothesForBase(image.path)}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {/* Mouth layer (Numb) */}
      <img
        src={DEFAULT_MOUTH_PATH}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {isSelected && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-brand-primary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
          </div>
        </div>
      )}
    </motion.button>
  );
}

interface ClothesImageCardProps {
  image: LayerImage;
  isSelected: boolean;
  isDisabled: boolean;
  disabledReason?: string | null;
  onClick: () => void;
}

function ClothesImageCard({ image, isSelected, isDisabled, disabledReason, onClick }: ClothesImageCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      className="aspect-square relative rounded-xl overflow-hidden transition-all"
      style={{
        background: 'var(--color-glass-bg)',
        border: isSelected
          ? '2px solid var(--color-brand-primary)'
          : '1px solid var(--color-border)',
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
      whileHover={prefersReducedMotion || isDisabled ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion || isDisabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={isDisabled}
      title={isDisabled && disabledReason ? disabledReason : undefined}
    >
      {/* Base layer (Classic) */}
      <img
        src={DEFAULT_BASE_PATH}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {/* Clothes layer (variable) */}
      <img
        src={image.path}
        alt={image.displayName}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {/* Mouth layer (Numb) */}
      <img
        src={DEFAULT_MOUTH_PATH}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {isSelected && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-brand-primary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
          </div>
        </div>
      )}
    </motion.button>
  );
}

export function TraitSelector({ className = '' }: TraitSelectorProps) {
  const {
    activeLayer,
    selectedLayers,
    getLayerImages,
    selectLayer,
    clearLayer,
    isLayerDisabled,
    isOptionDisabled,
    getOptionDisabledReason,
    isInitialized,
  } = useGenerator();
  const prefersReducedMotion = useReducedMotion();

  const [images, setImages] = useState<LayerImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if this is a mouth layer (must be before any conditional returns but after hooks)
  const isMouthLayer = activeLayer === 'MouthBase' || activeLayer === 'MouthItem' || activeLayer === 'FacialHair';

  const selectedPath = selectedLayers[activeLayer];
  const isBlocked = isLayerDisabled(activeLayer);

  // Load images when layer changes (only for non-mouth layers)
  useEffect(() => {
    if (!isInitialized || isMouthLayer) return;

    setIsLoading(true);
    getLayerImages(activeLayer)
      .then((imgs) => {
        setImages(imgs);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load layer images:', err);
        setImages([]);
        setIsLoading(false);
      });
  }, [activeLayer, isInitialized, getLayerImages, isMouthLayer]);

  // Use MouthLayerSelector for mouth-related layers (combines MouthBase + MouthItem)
  if (isMouthLayer) {
    return <MouthLayerSelector className={className} />;
  }

  // Loading skeleton
  if (isLoading || !isInitialized) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <TraitCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Layers that cannot be deselected (only switched to another option)
  const nonDeselectableLayers = ['Base', 'Clothes', 'MouthBase'];
  const canDeselect = !nonDeselectableLayers.includes(activeLayer);

  const handleImageClick = (image: LayerImage) => {
    if (isBlocked || isOptionDisabled(activeLayer, image.displayName)) return;

    // For non-deselectable layers, clicking same item does nothing
    if (selectedPath === image.path) {
      if (!canDeselect) {
        return; // Can't deselect - do nothing
      }
      clearLayer(activeLayer);
    } else {
      selectLayer(activeLayer, image.path);
    }
  };

  const handleClearSelection = () => {
    clearLayer(activeLayer);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Blocked overlay */}
      {isBlocked && (
        <div
          className="p-4 rounded-xl text-center"
          style={{
            background: 'var(--color-glass-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-muted)' }}>
            This layer is blocked by another trait selection
          </p>
        </div>
      )}

      {/* Trait grid */}
      {!isBlocked && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLayer}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
            variants={prefersReducedMotion ? undefined : traitGridVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* None option for layers that can be deselected */}
            {canDeselect && (
              <NoneCard
                isSelected={!selectedPath || selectedPath === '' || selectedPath === 'None'}
                onClick={handleClearSelection}
              />
            )}
            {images.map((image) => {
              const disabled = isOptionDisabled(activeLayer, image.displayName);
              const reason = disabled ? getOptionDisabledReason(activeLayer, image.displayName) : null;

              if (activeLayer === 'Base') {
                return (
                  <BaseImageCard
                    key={image.path}
                    image={image}
                    isSelected={selectedPath === image.path}
                    isDisabled={disabled}
                    disabledReason={reason}
                    onClick={() => handleImageClick(image)}
                  />
                );
              }
              if (activeLayer === 'Clothes') {
                return (
                  <ClothesImageCard
                    key={image.path}
                    image={image}
                    isSelected={selectedPath === image.path}
                    isDisabled={disabled}
                    disabledReason={reason}
                    onClick={() => handleImageClick(image)}
                  />
                );
              }
              return (
                <ImageCard
                  key={image.path}
                  image={image}
                  isSelected={selectedPath === image.path}
                  isDisabled={disabled}
                  disabledReason={reason}
                  onClick={() => handleImageClick(image)}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Empty state */}
      {!isBlocked && images.length === 0 && (
        <div
          className="p-8 rounded-xl text-center"
          style={{
            background: 'var(--color-glass-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-muted)' }}>
            No traits available for this layer
          </p>
        </div>
      )}
    </div>
  );
}

export default TraitSelector;
