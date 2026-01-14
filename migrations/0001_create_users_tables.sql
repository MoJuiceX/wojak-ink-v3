-- Migration: Create users and profiles tables
-- Run with: wrangler d1 execute <database-name> --file=migrations/0001_create_users_tables.sql

-- Users table: Core user record linked to Clerk
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,          -- Clerk user ID (from JWT sub claim)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Profiles table: User-editable profile data
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,     -- References users(id)
  display_name TEXT,            -- Optional display name (3-20 chars)
  x_handle TEXT,                -- Twitter/X handle (without @)
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for profile lookups by x_handle
CREATE INDEX IF NOT EXISTS idx_profiles_x_handle ON profiles(x_handle);
