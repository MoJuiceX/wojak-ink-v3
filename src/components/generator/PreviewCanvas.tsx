/**
 * Preview Canvas Component
 *
 * Displays the composited Wojak avatar with loading states.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useGenerator } from '@/contexts/GeneratorContext';
import {
  previewCanvasVariants,
  skeletonPulseVariants,
} from '@/config/generatorAnimations';

interface PreviewCanvasProps {
  size?: number;
  showPlaceholder?: boolean;
  className?: string;
}

export function PreviewCanvas({
  size,
  showPlaceholder = true,
  className = '',
}: PreviewCanvasProps) {
  const { previewImage, isRendering, selectedLayers } = useGenerator();
  const prefersReducedMotion = useReducedMotion();

  const basePath = selectedLayers.Base;
  const hasSelection = !!basePath && basePath !== '' && basePath !== 'None';

  // If size is provided, use fixed dimensions; otherwise rely on className for sizing
  const sizeStyles = size
    ? { width: size, height: size }
    : {};

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        ...sizeStyles,
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Checkerboard pattern for transparency */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, var(--color-border) 25%, transparent 25%),
            linear-gradient(-45deg, var(--color-border) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, var(--color-border) 75%),
            linear-gradient(-45deg, transparent 75%, var(--color-border) 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          opacity: 0.3,
        }}
      />

      {/* Preview image */}
      {previewImage && (
        <motion.img
          src={previewImage}
          alt="Wojak preview"
          className="absolute inset-0 w-full h-full object-contain"
          variants={prefersReducedMotion ? undefined : previewCanvasVariants}
          initial="initial"
          animate="animate"
        />
      )}

      {/* Placeholder when no selection */}
      {!hasSelection && showPlaceholder && !isRendering && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <div
            className="text-6xl mb-4 opacity-50"
            style={{ filter: 'grayscale(1)' }}
          >
            😐
          </div>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Select a base to start
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            or click Randomize for a surprise
          </p>
        </div>
      )}

      {/* Loading state */}
      {isRendering && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'var(--color-glass-bg)' }}
          variants={prefersReducedMotion ? undefined : skeletonPulseVariants}
          initial="initial"
          animate="animate"
        >
          <Loader2
            className="animate-spin"
            size={32}
            style={{ color: 'var(--color-brand-primary)' }}
          />
        </motion.div>
      )}

    </div>
  );
}

export default PreviewCanvas;
