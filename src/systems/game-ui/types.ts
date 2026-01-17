/**
 * Game UI System - Type Definitions
 */

export interface RewardThreshold {
  score: number;
  oranges: number;
}

export interface GameRewards {
  baseOranges: number;
  bonusThresholds: RewardThreshold[];
  perfectBonusOranges?: number;
  streakMultiplier?: number;
}

export interface GameSounds {
  blockLand?: string;
  perfectBonus?: string;
  combo?: string;
  gameOver?: string;
  levelComplete?: string;
  click?: string;
  success?: string;
  fail?: string;
  match?: string;
  [key: string]: string | undefined;
}

export interface GameSettings {
  maxLevels?: number;
  hasLevels?: boolean;
  hasPowerUps?: boolean;
  hasComboSystem?: boolean;
  hasLives?: boolean;
  maxLives?: number;
  hasTimer?: boolean;
  timeLimit?: number;
  [key: string]: unknown;
}

export interface GameConfig {
  id: string;
  name: string;
  description: string;
  emoji: string;
  primaryColor: string;
  secondaryColor?: string;
  backgroundImage?: string;
  rewards: GameRewards;
  leaderboardId?: string;
  sounds?: GameSounds;
  settings?: GameSettings;
}

export interface GameState {
  score: number;
  highScore: number;
  combo: number;
  level: number;
  lives?: number;
  timeRemaining?: number;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  level?: number;
  date: string;
  isCurrentUser?: boolean;
}
