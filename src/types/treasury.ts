/**
 * Treasury Types
 *
 * Data models for the Treasury page and crypto bubble visualization.
 */

export interface WalletToken {
  id: string; // Token ID (e.g., 'xch', 'cat_abc123')
  symbol: string; // Display symbol (e.g., 'XCH', 'DBX')
  name: string; // Full name (e.g., 'Chia', 'dexie bucks')
  type: 'native' | 'cat'; // XCH or CAT token

  // Balances
  balance: bigint; // Raw balance in mojos
  balanceFormatted: number; // Human-readable balance
  decimals: number; // Token decimals (XCH = 12)

  // Valuation
  priceUSD: number; // Current price per token
  valueUSD: number; // Total value (balance * price)
  priceXCH?: number; // Price in XCH (for CATs)
  valueXCH?: number; // Value in XCH equivalent

  // Market data
  change24h?: number; // 24h price change percentage
  volume24h?: number; // 24h trading volume

  // Display
  logoUrl: string; // Token logo (square, min 64px)
  logoFallback: string; // Single letter or emoji fallback
  color: string; // Brand/accent color for bubble

  // Bubble state
  isVisible: boolean; // Shown in bubble vis (value >= $1)
  bubbleRadius?: number; // Computed bubble radius
}

export interface PortfolioSummary {
  totalValueUSD: number;
  totalValueXCH: number;

  // Breakdown
  xchValueUSD: number;
  catsValueUSD: number;

  // XCH conversion rate
  xchPriceUSD: number;
  lastUpdated: Date;

  // Tokens
  tokens: WalletToken[];
  visibleTokens: WalletToken[]; // Tokens with value >= $1
  smallTokens: WalletToken[]; // Tokens with value < $1

  // Stats
  tokenCount: number;
  visibleTokenCount: number;
}

export interface WalletInfo {
  address: string; // Full wallet address
  addressTruncated: string; // Display format (xch1a2b3...xyz)
  fingerprint?: number; // Wallet fingerprint if available
  explorerUrl: string; // Link to block explorer
  isConnected: boolean;
}

// Bubble physics state
export interface Bubble {
  id: string;
  token: WalletToken;

  // Position (center of bubble)
  x: number;
  y: number;

  // Velocity
  vx: number;
  vy: number;

  // Physics
  radius: number;
  mass: number; // Proportional to radius

  // State
  isPopped: boolean;
  popTime?: number; // Timestamp when popped
  respawnTime?: number; // When to respawn

  // Animation
  scale: number; // For pop/spawn animations
  opacity: number;
  rotation: number; // Logo rotation (subtle)
}

// Particle for pop effect
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
  life: number; // 0-1, decrements each frame
  decay: number; // How fast life decreases
}

// Ripple for pop effect
export interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
}

// Treasury state for context
export interface TreasuryState {
  // Data
  portfolio: PortfolioSummary | null;
  wallet: WalletInfo | null;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;

  // Bubble game state
  poppedCount: number;
  allPopped: boolean;

  // Preferences
  soundEnabled: boolean;
  hapticsEnabled: boolean;

  // UI state
  showInfoTooltip: boolean;
  lastRefresh: Date | null;
}

// Info video for easter egg
export interface InfoVideo {
  id: string;
  title: string;
  url: string;
  duration: number; // seconds
}
