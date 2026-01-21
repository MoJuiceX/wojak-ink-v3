-- =====================================================
-- Votes Table for Emoji Flick Voting
-- Migration 011: Create votes table for donut/poop voting
-- =====================================================

CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  emoji TEXT NOT NULL CHECK (emoji IN ('donut', 'poop')),
  x_percent REAL,
  y_percent REAL,
  user_id TEXT,
  ip_hash TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for fetching counts by page type
CREATE INDEX IF NOT EXISTS idx_votes_page_target ON votes(page_type, target_id);

-- Index for fetching positions for heatmap
CREATE INDEX IF NOT EXISTS idx_votes_page_emoji ON votes(page_type, emoji, created_at);

-- Index for rate limiting by IP
CREATE INDEX IF NOT EXISTS idx_votes_ip ON votes(ip_hash, created_at);
