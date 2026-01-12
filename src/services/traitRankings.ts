/**
 * Trait Rankings Service
 *
 * Provides rarity ranking data for each trait within its category.
 * Shows rank (e.g., "#11 of 36") and tooltip leaderboard data.
 */

// Types
export interface TraitRankInfo {
  rank: number;
  of: number;
  count: number;
}

export interface LeaderboardEntry {
  rank: number;
  trait: string;
  count: number;
}

export interface TraitRankingsData {
  lookup: Record<string, Record<string, TraitRankInfo>>;
  leaderboards: Record<string, LeaderboardEntry[]>;
}

export interface TooltipData {
  category: string;
  currentTrait: string;
  currentRank: number;
  total: number;
  contextWindow: LeaderboardEntry[];
  rarest: LeaderboardEntry | null;
  mostCommon: LeaderboardEntry | null;
}

// Cache for loaded data
let rankingsData: TraitRankingsData | null = null;
let loadingPromise: Promise<TraitRankingsData> | null = null;

/**
 * Load trait rankings data (cached after first load)
 */
export async function loadTraitRankings(): Promise<TraitRankingsData> {
  if (rankingsData) {
    return rankingsData;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = fetch('/assets/nft-data/trait_rankings.json')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load trait rankings');
      return res.json();
    })
    .then((data: TraitRankingsData) => {
      rankingsData = data;
      return data;
    })
    .catch((err) => {
      loadingPromise = null;
      throw err;
    });

  return loadingPromise;
}

/**
 * Get trait rank info for a specific category and trait value
 */
export function getTraitRank(category: string, traitValue: string): TraitRankInfo | null {
  if (!rankingsData) return null;

  const categoryData = rankingsData.lookup[category];
  if (!categoryData) return null;

  return categoryData[traitValue] || null;
}

/**
 * Get tooltip data for a trait showing context window and bookends
 */
export function getTooltipData(category: string, currentTrait: string): TooltipData | null {
  if (!rankingsData) return null;

  const leaderboard = rankingsData.leaderboards[category];
  const traitInfo = getTraitRank(category, currentTrait);

  if (!leaderboard || !traitInfo) return null;

  const currentRank = traitInfo.rank;
  const total = leaderboard.length;

  // For small categories (6 or fewer), show entire leaderboard
  if (total <= 6) {
    return {
      category,
      currentTrait,
      currentRank,
      total,
      contextWindow: leaderboard,
      rarest: null,
      mostCommon: null,
    };
  }

  // Context window: 2 above, current, 2 below
  // Ranks are 1-indexed, array is 0-indexed
  const contextStart = Math.max(0, currentRank - 3); // -3 because rank is 1-indexed, then -2 for context
  const contextEnd = Math.min(total, currentRank + 2);
  const contextWindow = leaderboard.slice(contextStart, contextEnd);

  // Bookends
  const rarest = leaderboard[0];
  const mostCommon = leaderboard[total - 1];

  // Determine if bookends are already in context
  const showRarestBookend = currentRank > 3;
  const showCommonBookend = currentRank < total - 2;

  return {
    category,
    currentTrait,
    currentRank,
    total,
    contextWindow,
    rarest: showRarestBookend ? rarest : null,
    mostCommon: showCommonBookend ? mostCommon : null,
  };
}

/**
 * Check if data is loaded
 */
export function isDataLoaded(): boolean {
  return rankingsData !== null;
}

/**
 * Format rank display string
 */
export function formatRankDisplay(rank: number, total: number): string {
  return `#${rank} of ${total}`;
}
