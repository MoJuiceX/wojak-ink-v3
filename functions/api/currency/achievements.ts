/**
 * Achievements API - /api/currency/achievements
 *
 * GET: Returns all achievement progress for the authenticated user
 * POST: Records progress or claims rewards
 *
 * POST body: {
 *   action: 'update_progress' | 'claim'
 *   achievementId: string
 *   progress?: number (for update_progress)
 *   target?: number (for update_progress)
 * }
 */

import { authenticateRequest } from '../../lib/auth';

interface Env {
  CLERK_DOMAIN: string;
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// Starting balance for new users
const STARTING_BALANCE = { oranges: 100, gems: 0 };

/**
 * Ensure user profile exists
 */
async function ensureUserRecords(db: D1Database, userId: string): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (id, created_at, updated_at)
       VALUES (?, datetime('now'), datetime('now'))
       ON CONFLICT(id) DO UPDATE SET updated_at = datetime('now')`
    )
    .bind(userId)
    .run();

  await db
    .prepare(
      `INSERT INTO profiles (
        user_id, oranges, gems, lifetime_oranges, lifetime_gems,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(user_id) DO NOTHING`
    )
    .bind(userId, STARTING_BALANCE.oranges, STARTING_BALANCE.gems, STARTING_BALANCE.oranges, STARTING_BALANCE.gems)
    .run();
}

/**
 * Get all achievement progress for user
 */
async function getAchievementProgress(db: D1Database, userId: string) {
  const result = await db
    .prepare(
      `SELECT
        achievement_id,
        progress,
        target,
        is_completed,
        completed_at,
        is_claimed,
        claimed_at,
        reward_oranges,
        reward_gems
       FROM achievements
       WHERE user_id = ?`
    )
    .bind(userId)
    .all<{
      achievement_id: string;
      progress: number;
      target: number;
      is_completed: number;
      completed_at: string | null;
      is_claimed: number;
      claimed_at: string | null;
      reward_oranges: number;
      reward_gems: number;
    }>();

  return result.results || [];
}

/**
 * Update or create achievement progress
 */
async function updateProgress(
  db: D1Database,
  userId: string,
  achievementId: string,
  progress: number,
  target: number,
  rewardOranges: number = 0,
  rewardGems: number = 0
): Promise<{ isCompleted: boolean; justCompleted: boolean }> {
  // Get current state
  const current = await db
    .prepare(
      `SELECT progress, is_completed
       FROM achievements
       WHERE user_id = ? AND achievement_id = ?`
    )
    .bind(userId, achievementId)
    .first<{ progress: number; is_completed: number }>();

  const wasCompleted = current?.is_completed === 1;
  const isNowCompleted = progress >= target;
  const justCompleted = !wasCompleted && isNowCompleted;

  // Upsert achievement progress
  await db
    .prepare(
      `INSERT INTO achievements (
        user_id, achievement_id, progress, target, is_completed, completed_at,
        is_claimed, reward_oranges, reward_gems, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END, 0, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(user_id, achievement_id) DO UPDATE SET
        progress = ?,
        target = ?,
        is_completed = CASE WHEN achievements.is_completed = 1 THEN 1 ELSE ? END,
        completed_at = CASE WHEN achievements.is_completed = 0 AND ? = 1 THEN datetime('now') ELSE achievements.completed_at END,
        reward_oranges = ?,
        reward_gems = ?,
        updated_at = datetime('now')`
    )
    .bind(
      userId,
      achievementId,
      progress,
      target,
      isNowCompleted ? 1 : 0,
      isNowCompleted ? 1 : 0,
      rewardOranges,
      rewardGems,
      // Update values
      progress,
      target,
      isNowCompleted ? 1 : 0,
      isNowCompleted ? 1 : 0,
      rewardOranges,
      rewardGems
    )
    .run();

  return { isCompleted: isNowCompleted, justCompleted };
}

/**
 * Claim achievement reward
 */
async function claimReward(
  db: D1Database,
  userId: string,
  achievementId: string
): Promise<{ success: boolean; error?: string; oranges?: number; gems?: number; newBalance?: { oranges: number; gems: number } }> {
  // Get achievement state
  const achievement = await db
    .prepare(
      `SELECT is_completed, is_claimed, reward_oranges, reward_gems
       FROM achievements
       WHERE user_id = ? AND achievement_id = ?`
    )
    .bind(userId, achievementId)
    .first<{ is_completed: number; is_claimed: number; reward_oranges: number; reward_gems: number }>();

  if (!achievement) {
    return { success: false, error: 'Achievement not found' };
  }

  if (!achievement.is_completed) {
    return { success: false, error: 'Achievement not completed' };
  }

  if (achievement.is_claimed) {
    return { success: false, error: 'Already claimed' };
  }

  // Mark as claimed
  await db
    .prepare(
      `UPDATE achievements SET
        is_claimed = 1,
        claimed_at = datetime('now'),
        updated_at = datetime('now')
      WHERE user_id = ? AND achievement_id = ?`
    )
    .bind(userId, achievementId)
    .run();

  // Award currency
  const oranges = achievement.reward_oranges || 0;
  const gems = achievement.reward_gems || 0;

  if (oranges > 0 || gems > 0) {
    await db
      .prepare(
        `UPDATE profiles SET
          oranges = oranges + ?,
          gems = gems + ?,
          lifetime_oranges = lifetime_oranges + ?,
          lifetime_gems = lifetime_gems + ?,
          updated_at = datetime('now')
        WHERE user_id = ?`
      )
      .bind(oranges, gems, oranges, gems, userId)
      .run();
  }

  // Get new balance
  const balance = await db
    .prepare(`SELECT oranges, gems FROM profiles WHERE user_id = ?`)
    .bind(userId)
    .first<{ oranges: number; gems: number }>();

  if (!balance) {
    return { success: false, error: 'Failed to get balance' };
  }

  // Record transactions
  if (oranges > 0) {
    await db
      .prepare(
        `INSERT INTO currency_transactions
          (user_id, currency_type, amount, balance_after, source, source_details, is_gifted, created_at)
         VALUES (?, 'oranges', ?, ?, 'achievement', ?, 0, datetime('now'))`
      )
      .bind(userId, oranges, balance.oranges, JSON.stringify({ achievementId }))
      .run();
  }

  if (gems > 0) {
    await db
      .prepare(
        `INSERT INTO currency_transactions
          (user_id, currency_type, amount, balance_after, source, source_details, is_gifted, created_at)
         VALUES (?, 'gems', ?, ?, 'achievement', ?, 0, datetime('now'))`
      )
      .bind(userId, gems, balance.gems, JSON.stringify({ achievementId }))
      .run();
  }

  return {
    success: true,
    oranges,
    gems,
    newBalance: balance,
  };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check configuration
  if (!env.CLERK_DOMAIN || !env.DB) {
    return new Response(JSON.stringify({ error: 'Service not configured' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Authenticate
  const auth = await authenticateRequest(request, env.CLERK_DOMAIN);
  if (!auth) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    // Ensure user records exist
    await ensureUserRecords(env.DB, auth.userId);

    // Handle GET - return all progress
    if (request.method === 'GET') {
      const progress = await getAchievementProgress(env.DB, auth.userId);

      // Format response
      const formattedProgress = progress.map((p) => ({
        achievementId: p.achievement_id,
        progress: p.progress,
        target: p.target,
        completed: Boolean(p.is_completed),
        completedAt: p.completed_at,
        claimed: Boolean(p.is_claimed),
        claimedAt: p.claimed_at,
        rewardOranges: p.reward_oranges,
        rewardGems: p.reward_gems,
      }));

      const unclaimedCount = formattedProgress.filter((p) => p.completed && !p.claimed).length;
      const completedCount = formattedProgress.filter((p) => p.completed).length;

      return new Response(
        JSON.stringify({
          progress: formattedProgress,
          unclaimedCount,
          completedCount,
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Handle POST - update progress or claim
    if (request.method === 'POST') {
      let body: {
        action: string;
        achievementId: string;
        progress?: number;
        target?: number;
        rewardOranges?: number;
        rewardGems?: number;
      };

      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      if (!body.achievementId) {
        return new Response(JSON.stringify({ error: 'achievementId required' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      switch (body.action) {
        case 'update_progress': {
          if (body.progress === undefined || body.target === undefined) {
            return new Response(JSON.stringify({ error: 'progress and target required' }), {
              status: 400,
              headers: corsHeaders,
            });
          }

          const result = await updateProgress(
            env.DB,
            auth.userId,
            body.achievementId,
            body.progress,
            body.target,
            body.rewardOranges || 0,
            body.rewardGems || 0
          );

          return new Response(
            JSON.stringify({
              success: true,
              achievementId: body.achievementId,
              ...result,
            }),
            { status: 200, headers: corsHeaders }
          );
        }

        case 'claim': {
          const result = await claimReward(env.DB, auth.userId, body.achievementId);

          if (!result.success) {
            return new Response(JSON.stringify({ error: result.error }), {
              status: 400,
              headers: corsHeaders,
            });
          }

          return new Response(
            JSON.stringify({
              success: true,
              achievementId: body.achievementId,
              oranges: result.oranges,
              gems: result.gems,
              newBalance: result.newBalance,
            }),
            { status: 200, headers: corsHeaders }
          );
        }

        default:
          return new Response(
            JSON.stringify({ error: 'Invalid action. Use: update_progress, claim' }),
            { status: 400, headers: corsHeaders }
          );
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('[Achievements] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
