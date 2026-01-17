/**
 * Share Types
 *
 * Type definitions for the sharing system.
 */

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
