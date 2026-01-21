/**
 * User Scores API
 *
 * GET /api/scores/:userId - Fetch all game scores for a user
 */

interface Env {
  DB: D1Database;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env } = context;
  const userId = params.userId as string;

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID required' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    // Fetch all game scores grouped by game
    const scores = await env.DB.prepare(`
      SELECT
        ls.game_id,
        MAX(ls.score) as high_score,
        MAX(ls.created_at) as last_played
      FROM leaderboard_scores ls
      WHERE ls.user_id = ?
      GROUP BY ls.game_id
    `).bind(userId).all();

    // Calculate ranks for each game
    const scoresWithRanks = await Promise.all(
      (scores.results || []).map(async (s: any) => {
        const rankResult = await env.DB.prepare(`
          SELECT COUNT(*) + 1 as rank
          FROM (
            SELECT user_id, MAX(score) as max_score
            FROM leaderboard_scores
            WHERE game_id = ?
            GROUP BY user_id
          ) ranked
          WHERE max_score > ?
        `).bind(s.game_id, s.high_score).first<{ rank: number }>();

        return {
          gameId: s.game_id,
          highScore: s.high_score,
          rank: rankResult?.rank || null,
          lastPlayed: s.last_played,
        };
      })
    );

    return new Response(JSON.stringify({
      scores: scoresWithRanks,
    }), {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('[Scores API] Error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};
