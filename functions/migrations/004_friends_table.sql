-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  friend_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, friend_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id);
