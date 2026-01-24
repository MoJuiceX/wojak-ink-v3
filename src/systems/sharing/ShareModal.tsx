/**
 * Share Modal Component
 *
 * Modal with multiple sharing options for game scores.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { useShare } from './useShare';
import { useGameSounds } from '@/hooks/useGameSounds';
import type { ScoreShareData } from './types';
import { generateShareText, getShareUrl } from './ShareImageGenerator';
import './sharing.css';

// Platform icons as simple components
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoreData: ScoreShareData;
  /** Optional game screenshot (base64 data URL) for composite share image */
  screenshot?: string | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  scoreData,
  screenshot
}) => {
  const { shareScore, shareToPlatform, copyToClipboard, shareSupported } = useShare();
  const { playMatchFound, playButtonClick } = useGameSounds(); // Use matchFound as success sound
  const [copied, setCopied] = useState(false);

  const shareText = generateShareText(scoreData);
  const shareUrl = getShareUrl(scoreData.gameId);

  const handleNativeShare = async () => {
    playButtonClick();
    const success = await shareScore(scoreData, screenshot);
    if (success) {
      playMatchFound();
      onClose();
    }
  };

  const handlePlatformShare = async (platform: 'twitter' | 'facebook' | 'whatsapp' | 'telegram') => {
    playButtonClick();
    await shareToPlatform(platform, {
      title: `${scoreData.gameName} Score`,
      text: shareText,
      url: shareUrl
    });
  };

  const handleCopy = async () => {
    playButtonClick();
    const success = await copyToClipboard(`${shareText}\n\n${shareUrl}`);
    if (success) {
      playMatchFound();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="share-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="share-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="share-modal-content">
              {/* Header */}
              <div className="share-modal-header">
                <h2>Share Your Score</h2>
                <button className="share-close-button" onClick={onClose}>
                  <X size={20} />
                </button>
              </div>

              {/* Score Preview */}
              <div className="share-preview">
                <div className="preview-game">{scoreData.gameName}</div>
                <div className="preview-score">{scoreData.score.toLocaleString()}</div>
                {scoreData.isNewHighScore && (
                  <div className="preview-badge">🏆 New High Score!</div>
                )}
                {scoreData.rank && (
                  <div className="preview-rank">Rank #{scoreData.rank}</div>
                )}
              </div>

              {/* Share Options */}
              <div className="share-options">
                {/* Native Share (if supported) */}
                {shareSupported && (
                  <button
                    className="share-native-button"
                    onClick={handleNativeShare}
                  >
                    <Share2 size={20} />
                    Share
                  </button>
                )}

                {/* Platform buttons */}
                <div className="share-platforms">
                  <button
                    className="platform-button twitter"
                    onClick={() => handlePlatformShare('twitter')}
                    title="Share on Twitter/X"
                  >
                    <TwitterIcon />
                    <span>Twitter</span>
                  </button>

                  <button
                    className="platform-button facebook"
                    onClick={() => handlePlatformShare('facebook')}
                    title="Share on Facebook"
                  >
                    <FacebookIcon />
                    <span>Facebook</span>
                  </button>

                  <button
                    className="platform-button whatsapp"
                    onClick={() => handlePlatformShare('whatsapp')}
                    title="Share on WhatsApp"
                  >
                    <WhatsAppIcon />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    className="platform-button telegram"
                    onClick={() => handlePlatformShare('telegram')}
                    title="Share on Telegram"
                  >
                    <TelegramIcon />
                    <span>Telegram</span>
                  </button>

                  <button
                    className={`platform-button copy ${copied ? 'copied' : ''}`}
                    onClick={handleCopy}
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={24} /> : <Copy size={24} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Share Text Preview */}
              <div className="share-text-preview">
                <p>{shareText}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
