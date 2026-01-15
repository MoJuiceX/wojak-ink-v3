-- Migration: Create messages table for user notifications
-- Run with: wrangler d1 execute wojak-users --remote --file=migrations/0003_create_messages_table.sql

-- Messages table: Admin-to-user notifications
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,            -- UUID
  user_id TEXT NOT NULL,          -- Recipient user ID
  title TEXT NOT NULL,            -- Message title
  content TEXT NOT NULL,          -- Message body (supports markdown)
  type TEXT NOT NULL DEFAULT 'info',  -- info, success, warning
  read INTEGER NOT NULL DEFAULT 0,    -- 0 = unread, 1 = read
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,                -- Admin who created the message (optional)
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for fetching user's messages
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);

-- Index for unread messages count
CREATE INDEX IF NOT EXISTS idx_messages_user_unread ON messages(user_id, read);
