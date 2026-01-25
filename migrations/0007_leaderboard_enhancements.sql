-- Migration: Leaderboard Enhancement System
-- Run with: wrangler d1 execute wojak-ink-db --file=migrations/0007_leaderboard_enhancements.sql

-- =====================================================
-- Table: user_best_ranks
-- Tracks each user's best rank achieved per game (all-time)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_best_ranks (
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  best_rank INTEGER NOT NULL,
  best_score INTEGER NOT NULL,
  achieved_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, game_id)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_best_ranks_user ON user_best_ranks(user_id);

-- =====================================================
-- Table: leaderboard_period_snapshots
-- Archives period leaderboard data for "Last Week's Winners" feature
-- =====================================================
CREATE TABLE IF NOT EXISTS leaderboard_period_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly')),
  period_key TEXT NOT NULL,   -- '2026-01-25' for daily, '2026-W04' for weekly
  snapshot_data TEXT NOT NULL, -- JSON of top 100 entries
  total_players INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(game_id, period_type, period_key)
);

-- Index for period lookups
CREATE INDEX IF NOT EXISTS idx_period_snapshots_lookup 
  ON leaderboard_period_snapshots(game_id, period_type, period_key);

-- =====================================================
-- New columns in profiles table
-- =====================================================

-- Total oranges earned specifically from game rewards
ALTER TABLE profiles ADD COLUMN lifetime_oranges_from_games INTEGER DEFAULT 0;

-- Total games played across all games
ALTER TABLE profiles ADD COLUMN total_games_played INTEGER DEFAULT 0;

-- User's most played game (cached for performance)
ALTER TABLE profiles ADD COLUMN favorite_game_id TEXT;
