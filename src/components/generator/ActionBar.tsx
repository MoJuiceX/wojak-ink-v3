/**
 * Action Bar Component
 *
 * Control buttons for randomize, undo/redo, save, export.
 */

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Undo2,
  Redo2,
  Heart,
  Download,
  Copy,
} from 'lucide-react';
import { useGenerator } from '@/contexts/GeneratorContext';
import { useLayout } from '@/hooks/useLayout';
import {
  actionButtonVariants,
  historyButtonVariants,
  heartVariants,
} from '@/config/generatorAnimations';

// Dice roll animation variants
const diceRollVariants = {
  idle: { scale: 1, rotate: 0 },
  rolling: {
    scale: [1, 1.4, 1.3, 1.5, 1.2, 1],
    rotate: [0, -20, 25, -15, 20, -10, 0],
    transition: {
      duration: 0.6,
      ease: 'easeInOut' as const,
    },
  },
};

interface ActionBarProps {
  className?: string;
}

export function ActionBar({ className = '' }: ActionBarProps) {
  const {
    randomize,
    undo,
    redo,
    canUndo,
    canRedo,
    toggleFavorites,
    toggleExport,
    selectedLayers,
    favorites,
    saveFavorite,
    previewImage,
  } = useGenerator();
  const prefersReducedMotion = useReducedMotion();
  const { isDesktop } = useLayout();
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSoonTooltip, setShowSoonTooltip] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const basePath = selectedLayers.Base;
  const hasSelection = !!basePath && basePath !== '' && basePath !== 'None';

  const handleRandomize = () => {
    setIsRandomizing(true);
    randomize();
    setTimeout(() => setIsRandomizing(false), 500);
  };

  // Generate the next project name
  const getNextProjectName = () => {
    const projectNumbers = favorites
      .map((f) => {
        const match = f.name.match(/^Wojak\s*(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const nextNumber = projectNumbers.length > 0 ? Math.max(...projectNumbers) + 1 : 1;
    return `Wojak ${nextNumber}`;
  };

  const handleSaveAndOpenFavorites = async () => {
    if (!hasSelection || isSaving) return;

    setIsSaving(true);
    try {
      // Auto-save with generated name
      await saveFavorite(getNextProjectName());
    } catch (error) {
      console.error('Failed to save favorite:', error);
    } finally {
      setIsSaving(false);
    }
    // Open favorites modal
    toggleFavorites(true);
  };

  const handleCopyToClipboard = async () => {
    if (!previewImage || isCopying) return;

    setIsCopying(true);
    try {
      // Create PNG blob from image using canvas for better compatibility
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = previewImage;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(img, 0, 0);

      // Get PNG blob
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create blob'))),
          'image/png'
        );
      });

      // Try clipboard API with PNG
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        try {
          const item = new ClipboardItem({ 'image/png': pngBlob });
          await navigator.clipboard.write([item]);
          setShowCopied(true);
          setTimeout(() => setShowCopied(false), 2000);
          return;
        } catch (clipboardError) {
          console.warn('Clipboard API failed:', clipboardError);
          // Continue to fallbacks
        }
      }

      // Fallback: Use Web Share API on mobile (for sharing)
      if (navigator.share && navigator.canShare) {
        const file = new File([pngBlob], 'wojak.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Wojak',
          });
          setShowCopied(true);
          setTimeout(() => setShowCopied(false), 2000);
          return;
        }
      }

      // Final fallback: Download the image
      const url = URL.createObjectURL(pngBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wojak.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy/share:', error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl ${className}`}
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Randomize button */}
      <button
        className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
        style={{
          background: '#3B82F6',
          border: '1px solid #3B82F6',
        }}
        onClick={handleRandomize}
        title="Randomize"
        aria-label="Randomize"
      >
        <motion.span
          className="text-lg block"
          variants={prefersReducedMotion ? undefined : diceRollVariants}
          animate={isRandomizing ? 'rolling' : 'idle'}
        >
          🎲
        </motion.span>
      </button>

      {/* Undo button */}
      <motion.button
        className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
        style={{
          background: canUndo ? 'var(--color-glass-bg)' : 'transparent',
          color: canUndo
            ? 'var(--color-text-secondary)'
            : 'var(--color-text-muted)',
          border: `1px solid ${canUndo ? 'var(--color-border)' : 'transparent'}`,
        }}
        variants={prefersReducedMotion ? undefined : historyButtonVariants}
        whileHover={canUndo ? 'hover' : undefined}
        whileTap={canUndo ? 'tap' : undefined}
        onClick={undo}
        disabled={!canUndo}
        title="Undo"
        aria-label="Undo"
      >
        <Undo2 size={18} />
      </motion.button>

      {/* Redo button */}
      <motion.button
        className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
        style={{
          background: canRedo ? 'var(--color-glass-bg)' : 'transparent',
          color: canRedo
            ? 'var(--color-text-secondary)'
            : 'var(--color-text-muted)',
          border: `1px solid ${canRedo ? 'var(--color-border)' : 'transparent'}`,
        }}
        variants={prefersReducedMotion ? undefined : historyButtonVariants}
        whileHover={canRedo ? 'hover' : undefined}
        whileTap={canRedo ? 'tap' : undefined}
        onClick={redo}
        disabled={!canRedo}
        title="Redo"
        aria-label="Redo"
      >
        <Redo2 size={18} />
      </motion.button>

      {/* Save to favorites */}
      <motion.button
        className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
        style={{
          background: hasSelection ? 'var(--color-glass-bg)' : 'transparent',
          color: hasSelection
            ? 'var(--color-text-secondary)'
            : 'var(--color-text-muted)',
          border: `1px solid ${hasSelection ? 'var(--color-border)' : 'transparent'}`,
        }}
        variants={prefersReducedMotion ? undefined : heartVariants}
        whileHover={hasSelection && !isSaving ? 'hover' : undefined}
        whileTap={hasSelection && !isSaving ? 'tap' : undefined}
        onClick={handleSaveAndOpenFavorites}
        disabled={!hasSelection || isSaving}
        title="Save to favorites"
        aria-label="Save to favorites"
      >
        <Heart size={18} />
        {favorites.length > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold rounded-full"
            style={{
              background: 'var(--color-brand-primary)',
              color: 'white',
            }}
          >
            {favorites.length}
          </span>
        )}
      </motion.button>

      {/* Export button */}
      <motion.button
        className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
        style={{
          background: hasSelection ? 'var(--color-glass-bg)' : 'transparent',
          color: hasSelection
            ? 'var(--color-text-secondary)'
            : 'var(--color-text-muted)',
          border: `1px solid ${hasSelection ? 'var(--color-border)' : 'transparent'}`,
        }}
        variants={prefersReducedMotion ? undefined : actionButtonVariants}
        whileHover={hasSelection ? 'hover' : undefined}
        whileTap={hasSelection ? 'tap' : undefined}
        onClick={() => toggleExport(true)}
        disabled={!hasSelection}
        title="Export image"
        aria-label="Export image"
      >
        <Download size={18} />
      </motion.button>

      {/* Copy to clipboard button - desktop only */}
      {isDesktop && (
        <div className="relative">
          <motion.button
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{
              background: hasSelection ? 'var(--color-glass-bg)' : 'transparent',
              color: hasSelection
                ? 'var(--color-text-secondary)'
                : 'var(--color-text-muted)',
              border: `1px solid ${hasSelection ? 'var(--color-border)' : 'transparent'}`,
            }}
            variants={prefersReducedMotion ? undefined : actionButtonVariants}
            whileHover={hasSelection && !isCopying ? 'hover' : undefined}
            whileTap={hasSelection && !isCopying ? 'tap' : undefined}
            onClick={handleCopyToClipboard}
            disabled={!hasSelection || isCopying}
            title="Copy to clipboard"
            aria-label="Copy to clipboard"
          >
            <Copy size={18} />
          </motion.button>
          {showCopied && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
              style={{
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              Copied!
            </div>
          )}
        </div>
      )}

      {/* Coming soon button */}
      <div className="relative group">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-not-allowed"
          style={{
            background: 'var(--color-glass-bg)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            opacity: 0.5,
          }}
          onClick={() => setShowSoonTooltip(true)}
          onBlur={() => setShowSoonTooltip(false)}
          aria-label="Coming soon"
        >
          <span className="text-lg">🌱</span>
        </button>
        {/* Desktop tooltip on hover */}
        <div
          className="absolute bottom-full right-0 mb-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block"
          style={{
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          Soon
        </div>
        {/* Mobile tooltip on click */}
        {showSoonTooltip && (
          <div
            className="absolute bottom-full right-0 mb-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap sm:hidden"
            style={{
              background: 'var(--color-bg-primary)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            Soon
          </div>
        )}
      </div>
    </div>
  );
}

export default ActionBar;
