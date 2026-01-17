/**
 * Guild Types
 *
 * Type definitions for the guild (clan) system.
 */

export interface Guild {
  id: string;
  name: string;
  tag: string;
  description: string;
  banner: GuildBanner;
  createdAt: Date;

  // Stats
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalScore: number;
  weeklyScore: number;

  // Members
  memberCount: number;
  maxMembers: number;

  // Settings
  isPublic: boolean;
  minLevelToJoin: number;

  // Rankings
  rank: number | null;
  weeklyRank: number | null;
}

export interface GuildBanner {
  backgroundColor: string;
  pattern: BannerPattern;
  emblem: string;
  accentColor: string;
}

export type BannerPattern =
  | 'solid'
  | 'stripes'
  | 'gradient'
  | 'diagonal'
  | 'dots'
  | 'chevron';

export interface GuildMember {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
  };
  role: GuildRole;
  joinedAt: Date;

  // Contributions
  weeklyScore: number;
  totalScore: number;
  gamesPlayedThisWeek: number;
  lastActiveAt: Date;
}

export type GuildRole = 'leader' | 'officer' | 'member';

export interface GuildInvite {
  id: string;
  guildId: string;
  guildName: string;
  guildTag: string;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface GuildJoinRequest {
  id: string;
  userId: string;
  username: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
  };
  message: string;
  requestedAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}

export interface GuildActivity {
  id: string;
  type: GuildActivityType;
  userId: string;
  username: string;
  data: Record<string, unknown>;
  createdAt: Date;
}

export type GuildActivityType =
  | 'member_joined'
  | 'member_left'
  | 'member_promoted'
  | 'member_demoted'
  | 'high_score'
  | 'level_up'
  | 'rank_change'
  | 'challenge_completed';

export interface GuildLeaderboardEntry {
  rank: number;
  guild: {
    id: string;
    name: string;
    tag: string;
    banner: GuildBanner;
    level: number;
  };
  totalScore: number;
  weeklyScore: number;
  memberCount: number;
  topContributor: {
    username: string;
    score: number;
  };
}

export interface CreateGuildData {
  name: string;
  tag: string;
  description: string;
  banner: GuildBanner;
  isPublic: boolean;
}

export interface GuildSettings {
  isPublic: boolean;
  minLevelToJoin: number;
  description: string;
  banner: GuildBanner;
}

// Constants
export const GUILD_CONSTANTS = {
  MAX_MEMBERS: 50,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 24,
  MIN_TAG_LENGTH: 2,
  MAX_TAG_LENGTH: 4,
  MAX_DESCRIPTION_LENGTH: 200,
  INVITE_EXPIRY_DAYS: 7,
  MAX_OFFICERS: 5,
} as const;

// Guild XP levels
export const GUILD_LEVELS = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 1000 },
  { level: 3, xpRequired: 3000 },
  { level: 4, xpRequired: 6000 },
  { level: 5, xpRequired: 10000 },
  { level: 6, xpRequired: 15000 },
  { level: 7, xpRequired: 22000 },
  { level: 8, xpRequired: 30000 },
  { level: 9, xpRequired: 40000 },
  { level: 10, xpRequired: 55000 },
] as const;

// Banner customization options
export const BANNER_COLORS = [
  '#FF6B35', '#FF8C42', '#FFD93D', '#6BCB77',
  '#4D96FF', '#9B59B6', '#E74C3C', '#1ABC9C',
  '#34495E', '#F39C12', '#E91E63', '#00BCD4',
] as const;

export const BANNER_PATTERNS: BannerPattern[] = [
  'solid', 'stripes', 'gradient', 'diagonal', 'dots', 'chevron',
];

export const GUILD_EMBLEMS = [
  '🍊', '⚔️', '🛡️', '👑', '🔥', '⚡', '💎', '🌟',
  '🦁', '🐉', '🦅', '🐺', '🎯', '🏆', '💪', '🎮',
] as const;

// Helper to get XP required for next level
export const getXpForLevel = (level: number): number => {
  const levelData = GUILD_LEVELS.find(l => l.level === level);
  return levelData?.xpRequired || 0;
};

// Helper to calculate level from XP
export const getLevelFromXp = (xp: number): { level: number; xpIntoLevel: number; xpToNextLevel: number } => {
  let currentLevel = 1;
  for (const { level, xpRequired } of GUILD_LEVELS) {
    if (xp >= xpRequired) {
      currentLevel = level;
    } else {
      break;
    }
  }

  const currentLevelXp = getXpForLevel(currentLevel);
  const nextLevelXp = getXpForLevel(currentLevel + 1) || currentLevelXp + 20000;

  return {
    level: currentLevel,
    xpIntoLevel: xp - currentLevelXp,
    xpToNextLevel: nextLevelXp - currentLevelXp,
  };
};
