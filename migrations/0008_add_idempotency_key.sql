-- Migration: Add idempotency key to leaderboard_scores
-- Prevents duplicate score submissions from network retries
-- Run with: wrangler d1 execute wojak-ink-db --file=migrations/0008_add_idempotency_key.sql

-- Add idempotency_key column (nullable, allows old scores without keys)
ALTER TABLE leaderboard_scores ADD COLUMN idempotency_key TEXT;

-- Create unique index to enforce uniqueness (only for non-null keys)
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_idempotency
ON leaderboard_scores(idempotency_key)
WHERE idempotency_key IS NOT NULL;

-- Add CHECK constraint for score (D1 doesn't support ALTER TABLE ADD CHECK, so this is informational)
-- Scores must be non-negative - enforced in API validation
