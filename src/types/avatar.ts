/**
 * Avatar Type Definitions
 *
 * Tiered avatar system:
 * - Emoji avatars (default or user-selected)
 * - NFT avatars (premium, from Wojak Farmers Plot collection)
 */

export interface UserAvatar {
  type: 'emoji' | 'nft';
  value: string; // Emoji character OR IPFS image URL
  source: 'default' | 'user' | 'wallet';
  // Only for NFT avatars:
  nftId?: string; // e.g., "0042" - the edition number
  nftLauncherId?: string; // MintGarden encoded_id for linking
}

// 15 curated emojis - visually distinct, no conflicts with currencies (no 🍊💎🏆⭐🌟🌈)
export const DEFAULT_EMOJIS = [
  '🎮', // gaming
  '🔥', // fire
  '🚀', // rocket
  '🎯', // target
  '🦊', // fox
  '🐸', // frog
  '👾', // alien/retro
  '🤖', // robot
  '🎪', // circus
  '🌸', // flower
  '🍕', // pizza
  '🎸', // guitar
  '⚡', // lightning
  '🦁', // lion
  '🐙', // octopus
] as const;

export type DefaultEmoji = typeof DEFAULT_EMOJIS[number];

export function getRandomDefaultEmoji(): DefaultEmoji {
  return DEFAULT_EMOJIS[Math.floor(Math.random() * DEFAULT_EMOJIS.length)];
}

export function isValidEmoji(emoji: string): boolean {
  return DEFAULT_EMOJIS.includes(emoji as DefaultEmoji);
}

// Default avatar for new users
export function createDefaultAvatar(): UserAvatar {
  return {
    type: 'emoji',
    value: getRandomDefaultEmoji(),
    source: 'default',
  };
}
