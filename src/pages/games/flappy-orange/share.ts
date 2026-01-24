/**
 * FlappyOrange Share System Utilities
 *
 * Pure utility functions for sharing, challenges, and toast notifications.
 * Extracted from FlappyOrange.tsx to reduce file size.
 */

// ============================================
// TYPES
// ============================================

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export interface ChallengeData {
  s: number; // score
}

// ============================================
// CHALLENGE ENCODING/DECODING
// ============================================

/**
 * Decode a challenge from a base64-encoded URL parameter
 * @param encoded - Base64 encoded challenge string
 * @returns The challenge target score, or null if invalid
 */
export function decodeChallenge(encoded: string): number | null {
  try {
    const data = JSON.parse(atob(encoded)) as ChallengeData;
    return data.s || null;
  } catch {
    return null;
  }
}

/**
 * Encode a challenge score for sharing via URL
 * @param score - The score to encode as a challenge
 * @returns Base64 encoded challenge string
 */
export function encodeChallenge(score: number): string {
  const data: ChallengeData = { s: score };
  return btoa(JSON.stringify(data));
}

/**
 * Create a challenge URL for sharing
 * @param score - The score to challenge others to beat
 * @param baseUrl - Base URL (defaults to current origin)
 * @returns Full challenge URL
 */
export function createChallengeUrl(score: number, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const encoded = encodeChallenge(score);
  return `${base}/games/flappy-orange?challenge=${encoded}`;
}

// ============================================
// IMAGE DOWNLOAD
// ============================================

/**
 * Download an image from a data URL
 * @param dataUrl - The image data URL to download
 * @param filename - The filename for the download
 */
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * Generate a filename for a score image
 * @param score - The player's score
 * @param prefix - Filename prefix (default: 'flappy-orange')
 * @returns Formatted filename with score
 */
export function generateScoreFilename(score: number, prefix: string = 'flappy-orange'): string {
  return `${prefix}-${score}.png`;
}

// ============================================
// SHARE TEXT GENERATION
// ============================================

/**
 * Generate share text for social media
 * @param score - The player's score
 * @param isNewRecord - Whether this is a new personal record
 * @param challengeUrl - Optional challenge URL to include
 * @returns Formatted share text
 */
export function generateShareText(
  score: number,
  isNewRecord: boolean = false,
  challengeUrl?: string
): string {
  const recordText = isNewRecord ? ' (NEW RECORD!)' : '';
  const challengeText = challengeUrl ? `\n\nCan you beat my score? ${challengeUrl}` : '';

  return `I scored ${score} in Flappy Orange!${recordText}${challengeText}\n\nPlay at wojak.ink/games/flappy-orange`;
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is complete
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
}

// ============================================
// URL PARAMETER UTILITIES
// ============================================

/**
 * Parse challenge parameter from current URL
 * @returns The challenge target score if present, null otherwise
 */
export function parseChallengeFromUrl(): number | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const challengeParam = params.get('challenge');

  if (challengeParam) {
    return decodeChallenge(challengeParam);
  }

  return null;
}

/**
 * Remove challenge parameter from URL without page reload
 */
export function clearChallengeFromUrl(): void {
  if (typeof window === 'undefined') return;

  window.history.replaceState({}, '', window.location.pathname);
}
