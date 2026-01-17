/**
 * Avatar Constants
 *
 * Curated emoji avatars and utility functions for the avatar system.
 */

// Curated set of 20 fun, inclusive emojis for random assignment
export const EMOJI_AVATARS = [
  '🍊', // Orange (on-brand)
  '🎯', // Target
  '🚀', // Rocket
  '🔥', // Fire
  '⚡', // Lightning
  '💎', // Diamond
  '🌟', // Star
  '🎪', // Circus tent
  '🎨', // Art palette
  '🎭', // Theater masks
  '👻', // Ghost
  '🤖', // Robot
  '🦊', // Fox
  '🐱', // Cat
  '🎃', // Pumpkin
  '💀', // Skull
  '🌈', // Rainbow
  '🍀', // Clover
  '🎵', // Music note
  '⭐', // Star
] as const;

export type EmojiAvatar = typeof EMOJI_AVATARS[number];

// Get random emoji for new users
export const getRandomEmoji = (): EmojiAvatar => {
  const index = Math.floor(Math.random() * EMOJI_AVATARS.length);
  return EMOJI_AVATARS[index];
};

// Avatar display sizes
export const AVATAR_SIZES = {
  small: 32,   // Leaderboard rows
  medium: 48,  // Navigation, comments
  large: 80,   // Profile page
  xlarge: 120, // Profile edit modal
} as const;

export type AvatarSize = keyof typeof AVATAR_SIZES;

// Avatar data structure
interface AvatarDataInterface {
  type: 'emoji' | 'nft';
  value: string; // Emoji character OR NFT image URL
  nftId?: string; // If NFT, the token ID
  nftCollection?: string; // Collection name
}

export type AvatarData = AvatarDataInterface;

// Create default emoji avatar
export const createDefaultAvatar = (): AvatarData => ({
  type: 'emoji',
  value: getRandomEmoji(),
});

// Force rebuild
