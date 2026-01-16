-- Migration: Add streak tracking columns to profiles
-- Run with: wrangler d1 execute wojak-users --file=migrations/0005_add_streak_columns.sql

-- Add streak columns to profiles table
ALTER TABLE profiles ADD COLUMN current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN longest_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN last_played_date TEXT;
