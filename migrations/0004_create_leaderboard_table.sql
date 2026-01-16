-- Migration: Create leaderboard scores table
-- Run with: wrangler d1 execute wojak-ink-db --file=migrations/0004_create_leaderboard_table.sql

-- Leaderboard scores table for global game rankings
CREATE TABLE IF NOT EXISTS leaderboard_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,              -- References users(id) - Clerk user ID
  game_id TEXT NOT NULL,              -- Game identifier (orange-stack, memory-match, etc.)
  score INTEGER NOT NULL,             -- Final score
  level INTEGER,                      -- Optional: final level reached
  metadata TEXT,                      -- Optional: JSON for game-specific data
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for efficient leaderboard queries (top scores per game)
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_score
ON leaderboard_scores(game_id, score DESC);

-- Index for user's scores per game
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_game
ON leaderboard_scores(user_id, game_id);

-- Index for recent scores
CREATE INDEX IF NOT EXISTS idx_leaderboard_created
ON leaderboard_scores(created_at DESC);
