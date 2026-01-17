/**
 * Share Button Component
 *
 * A button that triggers the share flow for game scores.
 */

import React, { useState } from 'react';
import { Share2, Check, Loader2 } from 'lucide-react';
import { useShare } from './useShare';
import { useGameSounds } from '@/hooks/useGameSounds';
import type { ScoreShareData } from './types';
import './sharing.css';

interface ShareButtonProps {
  scoreData: ScoreShareData;
  variant?: 'button' | 'icon';
  size?: 'small' | 'default' | 'large';
  className?: string;
  onShareComplete?: (success: boolean) => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  scoreData,
  variant = 'button',
  size = 'default',
  className = '',
  onShareComplete
}) => {
  const { shareScore, isSharing } = useShare();
  const { playMatchFound } = useGameSounds(); // Use matchFound as success sound
  const [showSuccess, setShowSuccess] = useState(false);

  const handleShare = async () => {
    const success = await shareScore(scoreData);

    if (success) {
      playMatchFound();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }

    onShareComplete?.(success);
  };

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  if (variant === 'icon') {
    return (
      <button
        className={`share-icon-button share-${size} ${className}`}
        onClick={handleShare}
        disabled={isSharing}
        aria-label="Share score"
      >
        {isSharing ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : showSuccess ? (
          <Check size={iconSize} />
        ) : (
          <Share2 size={iconSize} />
        )}
      </button>
    );
  }

  return (
    <button
      className={`share-button share-${size} ${showSuccess ? 'success' : ''} ${className}`}
      onClick={handleShare}
      disabled={isSharing}
    >
      {isSharing ? (
        <>
          <Loader2 size={iconSize} className="animate-spin" />
          <span>Sharing...</span>
        </>
      ) : showSuccess ? (
        <>
          <Check size={iconSize} />
          <span>Shared!</span>
        </>
      ) : (
        <>
          <Share2 size={iconSize} />
          <span>Share Score</span>
        </>
      )}
    </button>
  );
};

export default ShareButton;
