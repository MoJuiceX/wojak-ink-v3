/**
 * Cloudflare Pages Function - /api/leaderboard/[gameId]
 *
 * GET: Returns top scores for a specific game (public)
 */

interface Env {
  DB: D1Database;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
    source: 'default' | 'user' | 'wallet';
  };
  score: number;
  level?: number;
  createdAt: string;
}

interface LeaderboardResponse {
  gameId: string;
  entries: LeaderboardEntry[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
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
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

/**
 * Get leaderboard entries for a game
 * Returns top scores with user display names
 */
async function getLeaderboard(
  db: D1Database,
  gameId: string,
  limit: number,
  offset: number
): Promise<LeaderboardEntry[]> {
  // Join with profiles to get display names and avatar data
  // Use ROW_NUMBER to calculate rank
  const results = await db
    .prepare(
      `SELECT
         ROW_NUMBER() OVER (ORDER BY ls.score DESC, ls.created_at ASC) as rank,
         ls.user_id,
         ls.score,
         ls.level,
         ls.created_at,
         COALESCE(p.display_name, 'Player') as display_name,
         COALESCE(p.avatar_type, 'emoji') as avatar_type,
         COALESCE(p.avatar_value, '🎮') as avatar_value,
         COALESCE(p.avatar_source, 'default') as avatar_source
       FROM leaderboard_scores ls
       LEFT JOIN profiles p ON ls.user_id = p.user_id
       WHERE ls.game_id = ?
       ORDER BY ls.score DESC, ls.created_at ASC
       LIMIT ? OFFSET ?`
    )
    .bind(gameId, limit, offset)
    .all<{
      rank: number;
      user_id: string;
      score: number;
      level: number | null;
      created_at: string;
      display_name: string;
      avatar_type: string;
      avatar_value: string;
      avatar_source: string;
    }>();

  return (results.results || []).map((row) => ({
    rank: row.rank,
    userId: row.user_id,
    displayName: row.display_name,
    avatar: {
      type: row.avatar_type as 'emoji' | 'nft',
      value: row.avatar_value,
      source: row.avatar_source as 'default' | 'user' | 'wallet',
    },
    score: row.score,
    level: row.level || undefined,
    createdAt: row.created_at,
  }));
}

/**
 * Get total count of entries for a game
 */
async function getLeaderboardCount(db: D1Database, gameId: string): Promise<number> {
  const result = await db
    .prepare('SELECT COUNT(*) as count FROM leaderboard_scores WHERE game_id = ?')
    .bind(gameId)
    .first<{ count: number }>();

  return result?.count ?? 0;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET
  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  // Check if DB is configured
  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: 'Database not configured' }),
      { status: 500, headers: corsHeaders }
    );
  }

  // Get gameId from params
  const gameId = params.gameId as string;

  if (!gameId || !VALID_GAME_IDS.includes(gameId)) {
    return new Response(
      JSON.stringify({ error: 'Invalid gameId' }),
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    // Parse query params
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const offsetParam = url.searchParams.get('offset');

    // Default: 10, max: 100
    let limit = limitParam ? parseInt(limitParam, 10) : 10;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    let offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    if (isNaN(offset) || offset < 0) offset = 0;

    // Get leaderboard entries
    const entries = await getLeaderboard(env.DB, gameId, limit, offset);
    const totalCount = await getLeaderboardCount(env.DB, gameId);

    const response: LeaderboardResponse = {
      gameId,
      entries,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + entries.length < totalCount,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });
  } catch (error) {
    console.error('[Leaderboard Get] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
};
