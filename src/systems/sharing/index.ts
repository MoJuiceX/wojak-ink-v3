/**
 * Sharing System
 *
 * Share scores and achievements to social platforms.
 *
 * Usage:
 *   import { ShareButton, ShareModal, useShare } from '@/systems/sharing';
 *
 *   // Simple share button
 *   <ShareButton scoreData={{ gameId: 'memory-match', gameName: 'Memory Match', score: 1000, isNewHighScore: true }} />
 *
 *   // Full share modal
 *   <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} scoreData={...} />
 */

// Components
export { ShareButton } from './ShareButton';
export { ShareModal } from './ShareModal';

// Hook
export { useShare } from './useShare';

// Image generation
export { generateScoreImage, generateShareText, getShareUrl } from './ShareImageGenerator';

// Types
export type { ShareData, ScoreShareData, SharePlatform } from './types';
