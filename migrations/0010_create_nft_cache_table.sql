-- NFT Count Cache Table
-- Caches the last known NFT count for each wallet address
-- Used as fallback when MintGarden API is unavailable

CREATE TABLE IF NOT EXISTS nft_cache (
  wallet_address TEXT PRIMARY KEY,
  nft_count INTEGER NOT NULL DEFAULT 0,
  collection_id TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Index for cleanup of stale entries
CREATE INDEX IF NOT EXISTS idx_nft_cache_updated_at ON nft_cache(updated_at);

-- Index for collection-specific queries
CREATE INDEX IF NOT EXISTS idx_nft_cache_collection ON nft_cache(collection_id);
