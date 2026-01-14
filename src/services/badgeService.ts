/**
 * Badge Service
 *
 * Loads and provides access to NFT badge data.
 */

// Badge definition from badge_system.json v2.2
export interface BadgeDefinition {
  count: number;
  emoji: string;
  type: 'both_primaries_required' | 'primary_only' | 'primary_plus_secondary';
  primary: Record<string, string[]>;
  secondary: Record<string, string[]>;
  lore: string;
}

// Badge ranked by rarity (from badges_ranked_by_rarity array)
export interface BadgeRanked {
  name: string;
  count: number;
  emoji: string;
}

// NFT badge assignment from nft_badge_mapping.json v2.2
export interface NFTBadgeInfo {
  badge: string;
  qualification: 'primary_only' | 'primary_plus_secondary' | 'two_primaries' | 'both_primaries_required';
  matched: string[]; // e.g., ["Head:Crown", "Clothes:Chia Farmer"]
}

export interface NFTBadgeEntry {
  badges: NFTBadgeInfo[];
  flags: string[];
}

// Badge system data
export interface BadgeSystem {
  version: string;
  total_collection: number;
  nfts_with_badges: number;
  coverage_percent: number;
  qualification_rules: {
    standard: string;
    primary_only: string;
    both_primaries_required: string;
  };
  badges_ranked_by_rarity: BadgeRanked[];
  badges: Record<string, BadgeDefinition>;
  special_flags: Record<string, { description: string }>;
}

/**
 * Get a friendly display name for a qualification type
 */
export function getQualificationDisplayName(qualification: NFTBadgeInfo['qualification']): string {
  switch (qualification) {
    case 'primary_only':
      return 'Primary Only';
    case 'primary_plus_secondary':
      return 'Primary + Secondary';
    case 'two_primaries':
      return '2 Primaries';
    case 'both_primaries_required':
      return 'Both Primaries';
    default:
      return qualification;
  }
}

// Badge mapping data
export interface BadgeMapping {
  version: string;
  total_nfts_with_badges: number;
  badge_counts: Record<string, number>;
  nft_badges: Record<string, NFTBadgeEntry>;
}

// Cached data
let badgeSystemCache: BadgeSystem | null = null;
let badgeMappingCache: BadgeMapping | null = null;

/**
 * Load badge system definitions
 */
export async function loadBadgeSystem(): Promise<BadgeSystem> {
  if (badgeSystemCache) return badgeSystemCache;

  try {
    const response = await fetch('/assets/Badges/badge_system.json');
    if (!response.ok) throw new Error('Failed to load badge system');
    badgeSystemCache = await response.json();
    return badgeSystemCache!;
  } catch (error) {
    console.error('[BadgeService] Failed to load badge system:', error);
    throw error;
  }
}

/**
 * Load NFT badge mappings
 */
export async function loadBadgeMapping(): Promise<BadgeMapping> {
  if (badgeMappingCache) return badgeMappingCache;

  try {
    const response = await fetch('/assets/Badges/nft_badge_mapping.json');
    if (!response.ok) throw new Error('Failed to load badge mapping');
    badgeMappingCache = await response.json();
    return badgeMappingCache!;
  } catch (error) {
    console.error('[BadgeService] Failed to load badge mapping:', error);
    throw error;
  }
}

/**
 * Get all available badge names sorted by count (descending)
 */
export async function getBadgeNames(): Promise<string[]> {
  const system = await loadBadgeSystem();
  return Object.entries(system.badges)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name]) => name);
}

/**
 * Get badge info for a specific NFT
 */
export async function getNFTBadges(nftId: number | string): Promise<NFTBadgeEntry | null> {
  const mapping = await loadBadgeMapping();
  const id = String(nftId);
  return mapping.nft_badges[id] || null;
}

/**
 * Get all NFT IDs that have a specific badge
 */
export async function getNFTsWithBadge(badgeName: string): Promise<string[]> {
  const mapping = await loadBadgeMapping();
  const nftIds: string[] = [];

  for (const [id, entry] of Object.entries(mapping.nft_badges)) {
    if (entry.badges.some(b => b.badge === badgeName)) {
      nftIds.push(id);
    }
  }

  return nftIds;
}

/**
 * Get all NFT IDs that have a specific flag (e.g., "HOAMI Edition", "High Five")
 */
export async function getNFTsWithFlag(flagName: string): Promise<string[]> {
  const mapping = await loadBadgeMapping();
  const nftIds: string[] = [];

  for (const [id, entry] of Object.entries(mapping.nft_badges)) {
    if (entry.flags.includes(flagName)) {
      nftIds.push(id);
    }
  }

  return nftIds;
}

/**
 * Get badge definition details
 */
export async function getBadgeDefinition(badgeName: string): Promise<BadgeDefinition | null> {
  const system = await loadBadgeSystem();
  return system.badges[badgeName] || null;
}

/**
 * Get all badge definitions with their names
 */
export async function getAllBadges(): Promise<Array<{ name: string; definition: BadgeDefinition }>> {
  const system = await loadBadgeSystem();
  return Object.entries(system.badges)
    .map(([name, definition]) => ({ name, definition }))
    .sort((a, b) => b.definition.count - a.definition.count);
}

/**
 * Get badges sorted by rarity (rarest first)
 */
export async function getBadgesByRarity(): Promise<BadgeRanked[]> {
  const system = await loadBadgeSystem();
  return system.badges_ranked_by_rarity;
}

/**
 * Get badge definition with emoji
 */
export async function getBadgeWithEmoji(badgeName: string): Promise<{ name: string; emoji: string; definition: BadgeDefinition } | null> {
  const system = await loadBadgeSystem();
  const definition = system.badges[badgeName];
  if (!definition) return null;
  return { name: badgeName, emoji: definition.emoji, definition };
}

/**
 * Check if an NFT has any badges
 */
export async function hasBadges(nftId: number | string): Promise<boolean> {
  const badges = await getNFTBadges(nftId);
  return badges !== null && badges.badges.length > 0;
}

/**
 * Preload all badge data (call during app init)
 */
export async function preloadBadgeData(): Promise<void> {
  await Promise.all([
    loadBadgeSystem(),
    loadBadgeMapping(),
  ]);
}

// Export singleton-style access for synchronous reads after preload
export function getCachedBadgeSystem(): BadgeSystem | null {
  return badgeSystemCache;
}

export function getCachedBadgeMapping(): BadgeMapping | null {
  return badgeMappingCache;
}

/**
 * Get cached NFT badges (synchronous, requires preload)
 */
export function getCachedNFTBadges(nftId: number | string): NFTBadgeEntry | null {
  if (!badgeMappingCache) return null;
  return badgeMappingCache.nft_badges[String(nftId)] || null;
}
