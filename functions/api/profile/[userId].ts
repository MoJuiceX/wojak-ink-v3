/**
 * Public Profile API
 *
 * GET /api/profile/:userId - Fetch public profile data
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
    // Fetch profile
    const profile = await env.DB.prepare(`
      SELECT
        user_id,
        display_name,
        x_handle,
        wallet_address,
        avatar_type,
        avatar_value,
        avatar_source,
        avatar_nft_id,
        owned_nft_ids,
        updated_at
      FROM profiles
      WHERE user_id = ?
    `).bind(userId).first<{
      user_id: string;
      display_name: string | null;
      x_handle: string | null;
      wallet_address: string | null;
      avatar_type: string | null;
      avatar_value: string | null;
      avatar_source: string | null;
      avatar_nft_id: string | null;
      owned_nft_ids: string | null;
      updated_at: string;
    }>();

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Fetch currency (optional)
    let currency: { oranges: number; gems: number } | null = null;
    try {
      currency = await env.DB.prepare(`
        SELECT oranges, gems FROM user_currency WHERE user_id = ?
      `).bind(userId).first<{ oranges: number; gems: number }>();
    } catch {
      // user_currency table may not exist
    }

    // Fetch game scores (optional)
    let gameScores: any[] = [];
    try {
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
      gameScores = await Promise.all(
        (scores.results || []).map(async (s: any) => {
          try {
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
          } catch {
            return {
              gameId: s.game_id,
              highScore: s.high_score,
              rank: null,
              lastPlayed: s.last_played,
            };
          }
        })
      );
    } catch {
      // leaderboard_scores table may not exist
    }

    // Fetch owned items (optional)
    let ownedItems: any[] = [];
    try {
      const items = await env.DB.prepare(`
        SELECT item_id, purchased_at FROM user_inventory WHERE user_id = ?
      `).bind(userId).all();
      ownedItems = (items.results || []).map((i: any) => ({ id: i.item_id }));
    } catch {
      // user_inventory table may not exist
    }

    // Safely parse owned_nft_ids
    let ownedNftIds: string[] = [];
    if (profile.owned_nft_ids) {
      try {
        ownedNftIds = JSON.parse(profile.owned_nft_ids);
      } catch (e) {
        console.warn('[Profile API] Failed to parse owned_nft_ids:', e);
      }
    }

    return new Response(JSON.stringify({
      userId: profile.user_id,
      displayName: profile.display_name || 'Player',
      avatar: {
        type: profile.avatar_type || 'emoji',
        value: profile.avatar_value || '🎮',
        source: profile.avatar_source || 'default',
        nftId: profile.avatar_nft_id,
      },
      xHandle: profile.x_handle,
      walletAddress: profile.wallet_address,
      updatedAt: profile.updated_at,
      oranges: currency?.oranges || 0,
      gems: currency?.gems || 0,
      ownedNftIds,
      gameScores,
      ownedItems,
    }), {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('[Profile API] Error for userId', userId, ':', error);
    return new Response(JSON.stringify({ error: 'Server error', details: String(error) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};
