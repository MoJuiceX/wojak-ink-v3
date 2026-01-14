-- Migration: Add wallet_address to profiles
-- Run with: wrangler d1 execute wojak-users --remote --file=migrations/0002_add_wallet_address.sql

ALTER TABLE profiles ADD COLUMN wallet_address TEXT;

-- Index for wallet lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);
