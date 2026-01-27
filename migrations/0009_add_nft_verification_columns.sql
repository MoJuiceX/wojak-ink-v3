-- Migration: Add NFT verification columns for chat access
-- These columns store the verified NFT count and timestamp to enable
-- seamless chat room entry without requiring wallet connection each time

ALTER TABLE profiles ADD COLUMN nft_count INTEGER DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN nft_verified_at TEXT DEFAULT NULL;

-- Create index for quick lookups of users with NFT access
CREATE INDEX IF NOT EXISTS idx_profiles_nft_count ON profiles(nft_count);
