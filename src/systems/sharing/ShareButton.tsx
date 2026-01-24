/**
 * Share Button Component
 *
 * A button that opens a modal to preview and download the share image.
 */

import React, { useState, useCallback } from 'react';
import { Share2, Loader2, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateScoreImageWithScreenshot } from './ShareImageGenerator';
import { useGameSounds } from '@/hooks/useGameSounds';
import type { ScoreShareData } from './types';
import './sharing.css';

interface ShareButtonProps {
  scoreData: ScoreShareData;
  /** Optional game screenshot (base64 data URL) for composite share image */
  screenshot?: string | null;
  variant?: 'button' | 'icon';
  size?: 'small' | 'default' | 'large';
  className?: string;
  onShareComplete?: (success: boolean) => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  scoreData,
  screenshot,
  variant = 'button',
  size = 'default',
  className = '',
  onShareComplete
}) => {
  const { playMatchFound, playButtonClick } = useGameSounds();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleOpenModal = useCallback(async () => {
    playButtonClick();
    setIsGenerating(true);

    try {
      // Generate the share image
      const blob = await generateScoreImageWithScreenshot(scoreData, screenshot || null);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setShowModal(true);
    } catch (error) {
      console.error('[ShareButton] Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [scoreData, screenshot, playButtonClick]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    // Clean up object URL after modal closes
    if (imageUrl) {
      setTimeout(() => {
        URL.revokeObjectURL(imageUrl);
        setImageUrl(null);
      }, 300);
    }
  }, [imageUrl]);

  const handleDownload = useCallback(async () => {
    if (!imageUrl) return;

    playButtonClick();

    try {
      const link = document.createElement('a');
      link.download = `${scoreData.gameId}-score-${scoreData.score}.png`;
      link.href = imageUrl;
      link.click();

      playMatchFound();
      onShareComplete?.(true);
    } catch (error) {
      console.error('[ShareButton] Failed to download:', error);
      onShareComplete?.(false);
    }
  }, [imageUrl, scoreData, playButtonClick, playMatchFound, onShareComplete]);

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  const buttonContent = isGenerating ? (
    <>
      <Loader2 size={iconSize} className="animate-spin" />
      {variant !== 'icon' && <span>Loading...</span>}
    </>
  ) : (
    <>
      <Share2 size={iconSize} />
      {variant !== 'icon' && <span>Share</span>}
    </>
  );

  return (
    <>
      {variant === 'icon' ? (
        <button
          className={`share-icon-button share-${size} ${className}`}
          onClick={handleOpenModal}
          disabled={isGenerating}
          aria-label="Share score"
        >
          {buttonContent}
        </button>
      ) : (
        <button
          className={`share-button share-${size} ${className}`}
          onClick={handleOpenModal}
          disabled={isGenerating}
        >
          {buttonContent}
        </button>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              className="share-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            />

            {/* Modal */}
            <motion.div
              className="share-modal share-modal-simple"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="share-modal-content">
                {/* Header */}
                <div className="share-modal-header">
                  <h2>Your Score Card</h2>
                  <button className="share-close-button" onClick={handleCloseModal}>
                    <X size={20} />
                  </button>
                </div>

                {/* Image Preview */}
                {imageUrl && (
                  <div className="share-image-preview">
                    <img src={imageUrl} alt="Score card" />
                  </div>
                )}

                {/* Download Button */}
                <div className="share-modal-actions">
                  <button className="share-download-button" onClick={handleDownload}>
                    <Download size={20} />
                    Download Image
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShareButton;
