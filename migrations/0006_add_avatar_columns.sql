-- Add avatar columns to profiles table
-- Migration: 0006_add_avatar_columns.sql
-- Date: 2026-01-21

-- Avatar type: 'emoji' or 'nft'
ALTER TABLE profiles ADD COLUMN avatar_type TEXT DEFAULT 'emoji';

-- Avatar value: emoji character or IPFS image URL
ALTER TABLE profiles ADD COLUMN avatar_value TEXT DEFAULT '🎮';

-- Avatar source: 'default', 'user', or 'wallet'
ALTER TABLE profiles ADD COLUMN avatar_source TEXT DEFAULT 'default';

-- NFT avatar metadata (only for NFT avatars)
ALTER TABLE profiles ADD COLUMN avatar_nft_id TEXT;
ALTER TABLE profiles ADD COLUMN avatar_nft_launcher_id TEXT;

-- List of NFT edition numbers user owns (JSON array as string)
ALTER TABLE profiles ADD COLUMN owned_nft_ids TEXT;

-- Set default avatar value for existing rows that have NULL
UPDATE profiles
SET avatar_value = '🎮', avatar_type = 'emoji', avatar_source = 'default'
WHERE avatar_value IS NULL;
