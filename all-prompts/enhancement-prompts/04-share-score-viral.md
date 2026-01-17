# ENHANCEMENT PROMPT 04: Share Score & Viral Features

## Priority: MEDIUM
Sharing scores creates organic viral growth. When users share achievements, their friends see the game, creating a viral loop.

---

## Overview

Create a share system that:
1. Generates shareable images with score + branding
2. Uses Web Share API for native sharing
3. Falls back to clipboard copy on unsupported devices
4. Tracks referrals for viral coefficient measurement
5. Creates pre-filled share messages

---

## Architecture

```
src/systems/sharing/
├── index.ts
├── ShareContext.tsx         # Context for share state
├── useShare.ts              # Hook for sharing functionality
├── ShareButton.tsx          # Share button component
├── ShareModal.tsx           # Share options modal
├── ShareImageGenerator.ts   # Canvas-based image generation
└── sharing.css              # Styles
```

---

## Part 1: Share Types

Create `src/systems/sharing/types.ts`:

```typescript
export interface ShareData {
  title: string;
  text: string;
  url: string;
  image?: Blob;
}

export interface ScoreShareData {
  gameId: string;
  gameName: string;
  score: number;
  highScore?: number;
  isNewHighScore: boolean;
  rank?: number;
  username?: string;
  avatar?: string;
}

export type SharePlatform =
  | 'native'     // Web Share API
  | 'twitter'
  | 'facebook'
  | 'whatsapp'
  | 'telegram'
  | 'copy';      // Copy to clipboard
```

---

## Part 2: Share Image Generator

Create `src/systems/sharing/ShareImageGenerator.ts`:

```typescript
import { ScoreShareData } from './types';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350; // 4:5 aspect ratio for social

interface BrandColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

const BRAND_COLORS: BrandColors = {
  primary: '#FF8C32',
  secondary: '#FFD700',
  background: '#0f0f1a',
  text: '#ffffff'
};

/**
 * Generate a shareable image for a game score
 */
export async function generateScoreImage(data: ScoreShareData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#0f0f1a');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Decorative elements
  drawDecorativeElements(ctx);

  // Game title
  ctx.fillStyle = BRAND_COLORS.text;
  ctx.font = 'bold 48px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.gameName.toUpperCase(), CANVAS_WIDTH / 2, 200);

  // Score label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '32px system-ui, sans-serif';
  ctx.fillText(data.isNewHighScore ? '🏆 NEW HIGH SCORE!' : 'MY SCORE', CANVAS_WIDTH / 2, 400);

  // Score value
  ctx.fillStyle = BRAND_COLORS.primary;
  ctx.font = 'bold 180px system-ui, sans-serif';
  ctx.fillText(formatScore(data.score), CANVAS_WIDTH / 2, 580);

  // Rank (if available)
  if (data.rank) {
    ctx.fillStyle = BRAND_COLORS.secondary;
    ctx.font = 'bold 48px system-ui, sans-serif';
    ctx.fillText(`RANK #${data.rank}`, CANVAS_WIDTH / 2, 700);
  }

  // Challenge text
  ctx.fillStyle = BRAND_COLORS.text;
  ctx.font = '36px system-ui, sans-serif';
  ctx.fillText('Can you beat my score? 🎮', CANVAS_WIDTH / 2, 900);

  // Branding
  drawBranding(ctx);

  // Username (if available)
  if (data.username) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`@${data.username}`, CANVAS_WIDTH / 2, 1100);
  }

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate image'));
      }
    }, 'image/png', 0.9);
  });
}

function drawDecorativeElements(ctx: CanvasRenderingContext2D): void {
  // Orange circles decoration
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = BRAND_COLORS.primary;

  // Top left circle
  ctx.beginPath();
  ctx.arc(-100, -100, 300, 0, Math.PI * 2);
  ctx.fill();

  // Bottom right circle
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH + 100, CANVAS_HEIGHT + 100, 400, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;

  // Border
  ctx.strokeStyle = BRAND_COLORS.primary;
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, CANVAS_WIDTH - 80, CANVAS_HEIGHT - 80);
}

function drawBranding(ctx: CanvasRenderingContext2D): void {
  // Logo/brand area at bottom
  ctx.fillStyle = 'rgba(255, 140, 50, 0.1)';
  ctx.fillRect(0, CANVAS_HEIGHT - 200, CANVAS_WIDTH, 200);

  // Brand name
  ctx.fillStyle = BRAND_COLORS.text;
  ctx.font = 'bold 56px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍊 WOJAK GAMES', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);

  // URL
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '28px system-ui, sans-serif';
  ctx.fillText('wojak.ink', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);
}

function formatScore(score: number): string {
  if (score >= 1000000) {
    return `${(score / 1000000).toFixed(1)}M`;
  }
  if (score >= 10000) {
    return `${(score / 1000).toFixed(0)}K`;
  }
  return score.toLocaleString();
}

/**
 * Generate a simpler text-based share (for platforms without image support)
 */
export function generateShareText(data: ScoreShareData): string {
  const emoji = data.isNewHighScore ? '🏆' : '🎮';
  const rankText = data.rank ? ` (Rank #${data.rank})` : '';

  return `${emoji} I just scored ${data.score.toLocaleString()} in ${data.gameName}${rankText}!\n\nCan you beat me? 🍊\n\nPlay now: ${getShareUrl(data.gameId)}`;
}

export function getShareUrl(gameId: string, referrer?: string): string {
  const baseUrl = `${window.location.origin}/games/${gameId}`;
  if (referrer) {
    return `${baseUrl}?ref=${referrer}`;
  }
  return baseUrl;
}
```

---

## Part 3: Share Hook

Create `src/systems/sharing/useShare.ts`:

```typescript
import { useCallback, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ShareData, ScoreShareData, SharePlatform } from './types';
import { generateScoreImage, generateShareText, getShareUrl } from './ShareImageGenerator';

interface UseShareReturn {
  isSharing: boolean;
  shareSupported: boolean;
  shareScore: (data: ScoreShareData) => Promise<boolean>;
  shareToplatform: (platform: SharePlatform, data: ShareData) => Promise<boolean>;
  copyToClipboard: (text: string) => Promise<boolean>;
}

export const useShare = (): UseShareReturn => {
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);

  // Check if Web Share API is supported
  const shareSupported = 'share' in navigator;

  // Share a score
  const shareScore = useCallback(async (data: ScoreShareData): Promise<boolean> => {
    setIsSharing(true);

    try {
      // Add username to data if available
      const shareData: ScoreShareData = {
        ...data,
        username: user?.username || undefined
      };

      // Generate share text
      const text = generateShareText(shareData);
      const url = getShareUrl(shareData.gameId, user?.id);

      // Try native share with image
      if (navigator.share && navigator.canShare) {
        try {
          // Generate image
          const imageBlob = await generateScoreImage(shareData);
          const imageFile = new File([imageBlob], 'score.png', { type: 'image/png' });

          const sharePayload = {
            title: `${shareData.gameName} Score`,
            text,
            url,
            files: [imageFile]
          };

          // Check if we can share files
          if (navigator.canShare(sharePayload)) {
            await navigator.share(sharePayload);
            trackShare('native-image', shareData.gameId);
            return true;
          }
        } catch (e) {
          // Fall through to text-only share
        }

        // Try text-only share
        try {
          await navigator.share({ title: `${shareData.gameName} Score`, text, url });
          trackShare('native-text', shareData.gameId);
          return true;
        } catch (e) {
          if ((e as Error).name !== 'AbortError') {
            console.error('Share failed:', e);
          }
          return false;
        }
      }

      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${text}\n\n${url}`);
      trackShare('clipboard', shareData.gameId);
      return true;

    } catch (error) {
      console.error('Share error:', error);
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [user]);

  // Share to specific platform
  const shareToPlatform = useCallback(async (
    platform: SharePlatform,
    data: ShareData
  ): Promise<boolean> => {
    const encodedText = encodeURIComponent(data.text);
    const encodedUrl = encodeURIComponent(data.url);

    let shareUrl: string;

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'copy':
        return copyToClipboard(`${data.text}\n\n${data.url}`);
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share(data);
            return true;
          } catch {
            return false;
          }
        }
        return false;
      default:
        return false;
    }

    // Open share URL in new window
    window.open(shareUrl, '_blank', 'width=600,height=400');
    trackShare(platform, 'manual');
    return true;
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        return true;
      } catch {
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }, []);

  return {
    isSharing,
    shareSupported,
    shareScore,
    shareToplatform: shareToPlatform,
    copyToClipboard
  };
};

// Analytics tracking
function trackShare(method: string, gameId: string): void {
  // Implement your analytics here
  console.log(`Share tracked: ${method} for ${gameId}`);

  // Example: send to analytics
  // analytics.track('share', { method, gameId });
}
```

---

## Part 4: Share Button Component

Create `src/systems/sharing/ShareButton.tsx`:

```typescript
import React, { useState } from 'react';
import { IonButton, IonIcon, IonSpinner } from '@ionic/react';
import { shareOutline, checkmarkOutline } from 'ionicons/icons';
import { useShare } from './useShare';
import { ScoreShareData } from './types';
import { useGameSounds } from '../audio/useGameSounds';
import { useGameHaptics } from '../haptics/useGameHaptics';
import './sharing.css';

interface ShareButtonProps {
  scoreData: ScoreShareData;
  variant?: 'button' | 'icon';
  size?: 'small' | 'default' | 'large';
  onShareComplete?: (success: boolean) => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  scoreData,
  variant = 'button',
  size = 'default',
  onShareComplete
}) => {
  const { shareScore, isSharing } = useShare();
  const { playSuccess } = useGameSounds();
  const { hapticSuccess } = useGameHaptics();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleShare = async () => {
    const success = await shareScore(scoreData);

    if (success) {
      playSuccess();
      hapticSuccess();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }

    onShareComplete?.(success);
  };

  if (variant === 'icon') {
    return (
      <button
        className={`share-icon-button share-${size}`}
        onClick={handleShare}
        disabled={isSharing}
        aria-label="Share score"
      >
        {isSharing ? (
          <IonSpinner name="crescent" />
        ) : showSuccess ? (
          <IonIcon icon={checkmarkOutline} />
        ) : (
          <IonIcon icon={shareOutline} />
        )}
      </button>
    );
  }

  return (
    <IonButton
      className={`share-button share-${size} ${showSuccess ? 'success' : ''}`}
      onClick={handleShare}
      disabled={isSharing}
      fill="outline"
    >
      {isSharing ? (
        <IonSpinner name="crescent" />
      ) : showSuccess ? (
        <>
          <IonIcon icon={checkmarkOutline} slot="start" />
          Shared!
        </>
      ) : (
        <>
          <IonIcon icon={shareOutline} slot="start" />
          Share Score
        </>
      )}
    </IonButton>
  );
};
```

---

## Part 5: Share Modal Component

Create `src/systems/sharing/ShareModal.tsx`:

```typescript
import React from 'react';
import { IonModal, IonButton, IonIcon } from '@ionic/react';
import { logoTwitter, logoFacebook, logoWhatsapp, copyOutline } from 'ionicons/icons';
import { useShare } from './useShare';
import { ScoreShareData } from './types';
import { generateShareText, getShareUrl } from './ShareImageGenerator';
import './sharing.css';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoreData: ScoreShareData;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  scoreData
}) => {
  const { shareScore, shareToPlatform, copyToClipboard, shareSupported } = useShare();

  const shareText = generateShareText(scoreData);
  const shareUrl = getShareUrl(scoreData.gameId);

  const handleNativeShare = async () => {
    const success = await shareScore(scoreData);
    if (success) onClose();
  };

  const handlePlatformShare = async (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    await shareToPlatform(platform, {
      title: `${scoreData.gameName} Score`,
      text: shareText,
      url: shareUrl
    });
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(`${shareText}\n\n${shareUrl}`);
    if (success) {
      // Show copied feedback
      onClose();
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="share-modal">
      <div className="share-modal-content">
        <div className="share-modal-header">
          <h2>Share Your Score</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {/* Score Preview */}
        <div className="share-preview">
          <div className="preview-game">{scoreData.gameName}</div>
          <div className="preview-score">{scoreData.score.toLocaleString()}</div>
          {scoreData.isNewHighScore && (
            <div className="preview-badge">🏆 New High Score!</div>
          )}
        </div>

        {/* Share Options */}
        <div className="share-options">
          {/* Native Share (if supported) */}
          {shareSupported && (
            <IonButton
              expand="block"
              className="share-option native"
              onClick={handleNativeShare}
            >
              Share
            </IonButton>
          )}

          {/* Platform buttons */}
          <div className="share-platforms">
            <button
              className="platform-button twitter"
              onClick={() => handlePlatformShare('twitter')}
            >
              <IonIcon icon={logoTwitter} />
              <span>Twitter</span>
            </button>

            <button
              className="platform-button facebook"
              onClick={() => handlePlatformShare('facebook')}
            >
              <IonIcon icon={logoFacebook} />
              <span>Facebook</span>
            </button>

            <button
              className="platform-button whatsapp"
              onClick={() => handlePlatformShare('whatsapp')}
            >
              <IonIcon icon={logoWhatsapp} />
              <span>WhatsApp</span>
            </button>

            <button
              className="platform-button copy"
              onClick={handleCopy}
            >
              <IonIcon icon={copyOutline} />
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* Share Text Preview */}
        <div className="share-text-preview">
          <p>{shareText}</p>
        </div>
      </div>
    </IonModal>
  );
};
```

---

## Part 6: Styles

Create `src/systems/sharing/sharing.css`:

```css
/* Share Button */
.share-button {
  --border-color: rgba(255, 255, 255, 0.3);
  --color: #fff;
  transition: all 0.2s ease;
}

.share-button.success {
  --border-color: #4CAF50;
  --color: #4CAF50;
}

.share-icon-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.share-icon-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.share-icon-button ion-icon {
  font-size: 1.2rem;
}

/* Share Modal */
.share-modal {
  --background: rgba(20, 20, 35, 0.98);
}

.share-modal-content {
  padding: 24px;
}

.share-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.share-modal-header h2 {
  color: #fff;
  margin: 0;
  font-size: 1.3rem;
}

.close-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.5rem;
  cursor: pointer;
}

/* Score Preview */
.share-preview {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 140, 50, 0.15), rgba(255, 100, 50, 0.1));
  border-radius: 16px;
  margin-bottom: 24px;
}

.preview-game {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.preview-score {
  color: #FF8C32;
  font-size: 3rem;
  font-weight: 900;
}

.preview-badge {
  color: #FFD700;
  font-size: 1rem;
  margin-top: 8px;
}

/* Share Options */
.share-options {
  margin-bottom: 24px;
}

.share-option.native {
  --background: linear-gradient(135deg, #FF8C32, #FF6420);
  --border-radius: 12px;
  font-weight: 600;
  margin-bottom: 16px;
}

.share-platforms {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.platform-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.platform-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.platform-button ion-icon {
  font-size: 1.5rem;
}

.platform-button span {
  font-size: 0.75rem;
}

.platform-button.twitter ion-icon { color: #1DA1F2; }
.platform-button.facebook ion-icon { color: #4267B2; }
.platform-button.whatsapp ion-icon { color: #25D366; }
.platform-button.copy ion-icon { color: #fff; }

/* Share Text Preview */
.share-text-preview {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-top: 16px;
}

.share-text-preview p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
}
```

---

## Part 7: Index Export

Create `src/systems/sharing/index.ts`:

```typescript
export { useShare } from './useShare';
export { ShareButton } from './ShareButton';
export { ShareModal } from './ShareModal';
export { generateScoreImage, generateShareText, getShareUrl } from './ShareImageGenerator';
export type { ShareData, ScoreShareData, SharePlatform } from './types';
```

---

## Part 8: Integration with Game Over Screen

Update `GameOverScreen.tsx` to include share button:

```typescript
import { ShareButton } from '../sharing';

// In GameOverScreen component:
<div className="game-over-actions">
  <IonButton onClick={onPlayAgain} expand="block" className="play-again-button">
    Play Again
  </IonButton>

  <div className="secondary-actions">
    <ShareButton
      scoreData={{
        gameId,
        gameName,
        score,
        highScore,
        isNewHighScore,
        rank: leaderboardRank
      }}
    />
    {/* ... other buttons */}
  </div>
</div>
```

---

## Implementation Checklist

- [ ] Create `src/systems/sharing/` folder
- [ ] Implement share types
- [ ] Build ShareImageGenerator with canvas
- [ ] Create useShare hook
- [ ] Build ShareButton component
- [ ] Build ShareModal component
- [ ] Add styles
- [ ] Create index exports
- [ ] Integrate with GameOverScreen
- [ ] Test Web Share API on mobile
- [ ] Test fallback on desktop
- [ ] Test image generation
- [ ] Test platform-specific sharing
- [ ] Test clipboard copy fallback

---

## Testing Checklist

- [ ] Share button appears on game over screen
- [ ] Native share opens on supported devices
- [ ] Twitter share opens correct URL
- [ ] Facebook share opens correct URL
- [ ] WhatsApp share opens with pre-filled text
- [ ] Copy button copies text to clipboard
- [ ] Generated image looks correct
- [ ] Score displays correctly in share text
- [ ] High score badge appears when appropriate
- [ ] Referral URL includes user ID
