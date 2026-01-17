-- Vote positions for heatmap
-- Uses generic target_id and page_type to support any page
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_id TEXT NOT NULL,
  page_type TEXT NOT NULL,
  emoji TEXT NOT NULL CHECK (emoji IN ('donut', 'poop')),
  x_percent REAL NOT NULL CHECK (x_percent >= 0 AND x_percent <= 100),
  y_percent REAL NOT NULL CHECK (y_percent >= 0 AND y_percent <= 100),
  ip_hash TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_id);
CREATE INDEX IF NOT EXISTS idx_votes_page ON votes(page_type);
CREATE INDEX IF NOT EXISTS idx_votes_emoji ON votes(emoji);
CREATE INDEX IF NOT EXISTS idx_votes_page_emoji ON votes(page_type, emoji);
CREATE INDEX IF NOT EXISTS idx_votes_target_emoji ON votes(target_id, emoji);
CREATE INDEX IF NOT EXISTS idx_votes_time ON votes(created_at DESC);

-- Aggregated counts for fast totals
CREATE TABLE IF NOT EXISTS vote_counts (
  target_id TEXT NOT NULL,
  page_type TEXT NOT NULL,
  emoji TEXT NOT NULL CHECK (emoji IN ('donut', 'poop')),
  count INTEGER DEFAULT 0,
  updated_at INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (target_id, page_type, emoji)
);

CREATE INDEX IF NOT EXISTS idx_counts_page ON vote_counts(page_type);
