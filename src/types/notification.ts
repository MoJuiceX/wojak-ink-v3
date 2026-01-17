/**
 * Push Notification Types
 *
 * Types for PWA push notification system.
 */

// User's notification preferences
export interface NotificationPreferences {
  dailyRewards: boolean;
  highScoreBeaten: boolean;
  guildUpdates: boolean;
  achievements: boolean;
  social: boolean;
}

// Default preferences for new users
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  dailyRewards: true,
  highScoreBeaten: true,
  guildUpdates: true,
  achievements: true,
  social: true,
};

// Push subscription from the browser
export interface PushSubscriptionData {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Notification payload sent to service worker
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: {
    url?: string;
    type?: NotificationType;
    [key: string]: unknown;
  };
  actions?: NotificationAction[];
}

// Action buttons on notifications
export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Types of notifications
export type NotificationType =
  | 'daily_reward'
  | 'high_score_beaten'
  | 'guild_challenge'
  | 'guild_invite'
  | 'achievement'
  | 'friend_joined'
  | 'leaderboard_update'
  | 'event_start'
  | 'general';

// Notification log entry for analytics
export interface NotificationLog {
  id: string;
  userId: string;
  type: NotificationType;
  payload: NotificationPayload;
  sentAt: Date;
  clickedAt?: Date;
  dismissedAt?: Date;
}

// Notification templates
export const NotificationTemplates = {
  dailyReward: (): NotificationPayload => ({
    title: 'Daily Reward Available!',
    body: "Your daily reward is waiting. Don't break your streak!",
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge.png',
    tag: 'daily-reward',
    data: {
      url: '/rewards',
      type: 'daily_reward',
    },
  }),

  highScoreBeaten: (gameName: string, newHolder: string): NotificationPayload => ({
    title: 'Your Record Was Beaten!',
    body: `${newHolder} just beat your high score in ${gameName}!`,
    icon: '/icons/notification-icon.png',
    tag: 'high-score',
    data: {
      url: `/games`,
      type: 'high_score_beaten',
    },
    actions: [
      { action: 'play', title: 'Play Now' },
      { action: 'view', title: 'View Leaderboard' },
    ],
  }),

  guildChallenge: (guildName: string): NotificationPayload => ({
    title: `[${guildName}] Needs You!`,
    body: 'Your guild is in a close competition. Every point counts!',
    icon: '/icons/notification-icon.png',
    tag: 'guild',
    data: {
      url: '/guild',
      type: 'guild_challenge',
    },
  }),

  guildInvite: (guildName: string, inviterName: string): NotificationPayload => ({
    title: 'Guild Invite!',
    body: `${inviterName} invited you to join [${guildName}]`,
    icon: '/icons/notification-icon.png',
    tag: 'guild-invite',
    data: {
      url: '/guild',
      type: 'guild_invite',
    },
    actions: [
      { action: 'view', title: 'View Invite' },
      { action: 'dismiss', title: 'Later' },
    ],
  }),

  newAchievement: (achievementName: string): NotificationPayload => ({
    title: 'Achievement Unlocked!',
    body: `You earned "${achievementName}"! Claim your reward.`,
    icon: '/icons/notification-icon.png',
    tag: 'achievement',
    data: {
      url: '/achievements',
      type: 'achievement',
    },
  }),

  friendJoined: (friendName: string): NotificationPayload => ({
    title: 'Friend Joined!',
    body: `${friendName} just joined Wojak Games!`,
    icon: '/icons/notification-icon.png',
    tag: 'social',
    data: {
      url: '/friends',
      type: 'friend_joined',
    },
  }),

  leaderboardUpdate: (position: number, gameName: string): NotificationPayload => ({
    title: 'Leaderboard Update!',
    body: `You're now #${position} in ${gameName}!`,
    icon: '/icons/notification-icon.png',
    tag: 'leaderboard',
    data: {
      url: '/leaderboard',
      type: 'leaderboard_update',
    },
  }),

  eventStart: (eventName: string): NotificationPayload => ({
    title: 'Event Started!',
    body: `${eventName} is now live! Join now for exclusive rewards.`,
    icon: '/icons/notification-icon.png',
    tag: 'event',
    data: {
      url: '/events',
      type: 'event_start',
    },
  }),
};
