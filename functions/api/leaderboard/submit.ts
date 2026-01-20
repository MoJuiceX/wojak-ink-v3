/**
 * Cloudflare Pages Function - /api/leaderboard/submit
 *
 * POST: Submit a score to the global leaderboard (authenticated)
 */

import { authenticateRequest } from '../../lib/auth';

interface Env {
  CLERK_DOMAIN: string;
  DB: D1Database;
}

interface SubmitScoreRequest {
  gameId: string;
  score: number;
  level?: number;
  metadata?: Record<string, unknown>;
}

// Valid game IDs
const VALID_GAME_IDS = [
  'orange-stack',
  'memory-match',
  'orange-pong',
  'wojak-runner',
  'orange-juggle',
  'knife-game',
  'color-reaction',
  'merge-2048',
  'orange-wordle',
  'block-puzzle',
  'flappy-orange',
  'citrus-drop',
  'orange-snake',
  'brick-breaker',
  'wojak-whack',
];

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

/**
 * Ensure user exists in users table (upsert)
 */
async function ensureUser(db: D1Database, userId: string): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (id, created_at, updated_at)
       VALUES (?, datetime('now'), datetime('now'))
       ON CONFLICT(id) DO UPDATE SET updated_at = datetime('now')`
    )
    .bind(userId)
    .run();
}

/**
 * Update user's play streak
 * Returns the new streak count
 * Note: Returns defaults if streak columns don't exist yet
 */
async function updateStreak(db: D1Database, userId: string): Promise<{ currentStreak: number; isNewDay: boolean }> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Get current streak info
    const profile = await db
      .prepare('SELECT current_streak, longest_streak, last_played_date FROM profiles WHERE user_id = ?')
      .bind(userId)
      .first<{ current_streak: number | null; longest_streak: number | null; last_played_date: string | null }>();

    if (!profile) {
      // No profile yet, will be created with streak = 1
      return { currentStreak: 1, isNewDay: true };
    }

    const lastPlayed = profile.last_played_date;
    let newStreak = profile.current_streak || 0;
    let isNewDay = false;

    if (lastPlayed === today) {
      // Already played today, no change
      return { currentStreak: newStreak, isNewDay: false };
    }

    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastPlayed === yesterdayStr) {
      // Consecutive day! Increment streak
      newStreak += 1;
      isNewDay = true;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
      isNewDay = true;
    }

    // Update longest streak if needed
    const longestStreak = Math.max(newStreak, profile.longest_streak || 0);

    // Update profile with new streak
    await db
      .prepare(`
        UPDATE profiles
        SET current_streak = ?, longest_streak = ?, last_played_date = ?
        WHERE user_id = ?
      `)
      .bind(newStreak, longestStreak, today, userId)
      .run();

    return { currentStreak: newStreak, isNewDay };
  } catch (error) {
    // Streak columns might not exist yet - return defaults
    console.log('[Leaderboard] Streak columns not available, skipping streak update');
    return { currentStreak: 0, isNewDay: false };
  }
}

/**
 * Get user's current high score for a game
 */
async function getUserHighScore(
  db: D1Database,
  userId: string,
  gameId: string
): Promise<number | null> {
  const result = await db
    .prepare(
      'SELECT MAX(score) as high_score FROM leaderboard_scores WHERE user_id = ? AND game_id = ?'
    )
    .bind(userId, gameId)
    .first<{ high_score: number | null }>();

  return result?.high_score ?? null;
}

/**
 * Insert a new score
 */
async function insertScore(
  db: D1Database,
  userId: string,
  data: SubmitScoreRequest
): Promise<number> {
  const result = await db
    .prepare(
      `INSERT INTO leaderboard_scores (user_id, game_id, score, level, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       RETURNING id`
    )
    .bind(
      userId,
      data.gameId,
      data.score,
      data.level ?? null,
      data.metadata ? JSON.stringify(data.metadata) : null
    )
    .first<{ id: number }>();

  return result?.id ?? 0;
}

/**
 * Get rank for a score in a game
 */
async function getScoreRank(
  db: D1Database,
  gameId: string,
  score: number
): Promise<number> {
  const result = await db
    .prepare(
      `SELECT COUNT(*) + 1 as rank FROM leaderboard_scores
       WHERE game_id = ? AND score > ?`
    )
    .bind(gameId, score)
    .first<{ rank: number }>();

  return result?.rank ?? 1;
}

/**
 * Validate submit request
 */
function validateRequest(data: SubmitScoreRequest): { valid: boolean; error?: string } {
  if (!data.gameId) {
    return { valid: false, error: 'gameId is required' };
  }

  if (!VALID_GAME_IDS.includes(data.gameId)) {
    return { valid: false, error: 'Invalid gameId' };
  }

  if (typeof data.score !== 'number' || isNaN(data.score)) {
    return { valid: false, error: 'score must be a number' };
  }

  if (data.score < 0) {
    return { valid: false, error: 'score must be non-negative' };
  }

  if (data.level !== undefined && (typeof data.level !== 'number' || data.level < 0)) {
    return { valid: false, error: 'level must be a non-negative number' };
  }

  return { valid: true };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  // Check if auth is configured
  if (!env.CLERK_DOMAIN) {
    return new Response(
      JSON.stringify({ error: 'Auth not configured' }),
      { status: 500, headers: corsHeaders }
    );
  }

  // Check if DB is configured
  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: 'Database not configured' }),
      { status: 500, headers: corsHeaders }
    );
  }

  // Authenticate request
  const auth = await authenticateRequest(request, env.CLERK_DOMAIN);

  if (!auth) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: corsHeaders }
    );
  }

  const { userId } = auth;

  try {
    // Parse request body
    let data: SubmitScoreRequest;
    try {
      data = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate request
    const validation = validateRequest(data);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Ensure user exists
    await ensureUser(env.DB, userId);

    // Get user's previous high score
    const previousHighScore = await getUserHighScore(env.DB, userId, data.gameId);

    // Insert the new score
    const scoreId = await insertScore(env.DB, userId, data);

    // Get rank for this score
    const rank = await getScoreRank(env.DB, data.gameId, data.score);

    // Determine if this is a new high score
    const isNewHighScore = previousHighScore === null || data.score > previousHighScore;

    // Update play streak
    const streakInfo = await updateStreak(env.DB, userId);

    return new Response(
      JSON.stringify({
        success: true,
        scoreId,
        rank,
        isNewHighScore,
        previousHighScore,
        currentStreak: streakInfo.currentStreak,
        isNewDay: streakInfo.isNewDay,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Leaderboard Submit] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
};
