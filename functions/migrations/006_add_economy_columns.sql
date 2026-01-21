-- Economy System Migration - Add columns to existing tables
-- Adds currency tracking, transactions, login streaks, daily challenges, and achievements

-- ============ ADD CURRENCY COLUMNS TO PROFILES ============
-- These columns may already exist, so we use a try-add approach

-- Add oranges column
ALTER TABLE profiles ADD COLUMN oranges INTEGER DEFAULT 100;

-- Add gems column
ALTER TABLE profiles ADD COLUMN gems INTEGER DEFAULT 0;

-- Add lifetime tracking
ALTER TABLE profiles ADD COLUMN lifetime_oranges INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN lifetime_gems INTEGER DEFAULT 0;

-- Add gifted oranges tracking
ALTER TABLE profiles ADD COLUMN gifted_oranges INTEGER DEFAULT 0;

-- Add gem conversion tracking
ALTER TABLE profiles ADD COLUMN gems_converted_this_month INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN gem_conversion_reset_date TEXT;

-- Add NFT holder tracking
ALTER TABLE profiles ADD COLUMN owns_nft INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN owned_nft_count INTEGER DEFAULT 0;

-- Add anti-abuse tracking
ALTER TABLE profiles ADD COLUMN account_trust_level TEXT DEFAULT 'new';
ALTER TABLE profiles ADD COLUMN trust_start_date TEXT;
