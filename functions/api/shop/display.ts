/**
 * User Display API - /api/shop/display
 *
 * GET: Returns all equipped cosmetics for rendering (used everywhere)
 * Query: ?userId=xxx (optional - defaults to authenticated user)
 */

import { authenticateRequest } from '../../lib/auth';

interface Env {
  CLERK_DOMAIN: string;
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Get userId from query param or authentication
  const url = new URL(request.url);
  let userId = url.searchParams.get('userId');

  // If no userId in query, try to authenticate
  if (!userId && env.CLERK_DOMAIN) {
    const auth = await authenticateRequest(request, env.CLERK_DOMAIN);
    if (auth) {
      userId = auth.userId;
    }
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: 'userId required (query param or authentication)' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    // Get user profile
    const profile = await env.DB
      .prepare('SELECT user_id, display_name FROM profiles WHERE user_id = ?')
      .bind(userId)
      .first<{ user_id: string; display_name: string | null }>();

    if (!profile) {
      // Return default display for non-existent users
      return new Response(
        JSON.stringify({
          userId,
          username: 'Anonymous',
          emojiRing: {},
          frame: null,
          title: null,
          nameEffect: null,
          background: null,
          celebration: null,
          bigpulp: { hat: null, mood: 'happy', accessory: null },
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Get equipped items with their details
    const equipped = await env.DB
      .prepare(
        `SELECT
          e.frame_id, e.title_id, e.name_effect_id, e.background_id, e.celebration_id,
          f.css_class as frame_css, f.name as frame_name,
          t.name as title_name,
          ne.css_class as name_effect_css, ne.name as name_effect_name,
          bg.css_class as background_css, bg.name as background_name,
          c.css_class as celebration_css, c.name as celebration_name
        FROM user_equipped e
        LEFT JOIN shop_items f ON e.frame_id = f.id
        LEFT JOIN shop_items t ON e.title_id = t.id
        LEFT JOIN shop_items ne ON e.name_effect_id = ne.id
        LEFT JOIN shop_items bg ON e.background_id = bg.id
        LEFT JOIN shop_items c ON e.celebration_id = c.id
        WHERE e.user_id = ?`
      )
      .bind(userId)
      .first();

    // Get emoji ring positions
    const { results: emojiRing } = await env.DB
      .prepare('SELECT position, emoji FROM user_emoji_ring WHERE user_id = ?')
      .bind(userId)
      .all<{ position: string; emoji: string }>();

    // Convert emoji ring to object
    const ringPositions: Record<string, string> = {};
    for (const pos of emojiRing || []) {
      ringPositions[pos.position] = pos.emoji;
    }

    // Get BigPulp state
    const bigpulp = await env.DB
      .prepare('SELECT current_hat, current_mood, current_accessory FROM user_bigpulp WHERE user_id = ?')
      .bind(userId)
      .first<{ current_hat: string | null; current_mood: string; current_accessory: string | null }>();

    const equippedData = equipped as {
      frame_id: string | null;
      frame_css: string | null;
      frame_name: string | null;
      title_id: string | null;
      title_name: string | null;
      name_effect_id: string | null;
      name_effect_css: string | null;
      name_effect_name: string | null;
      background_id: string | null;
      background_css: string | null;
      background_name: string | null;
      celebration_id: string | null;
      celebration_css: string | null;
      celebration_name: string | null;
    } | null;

    return new Response(
      JSON.stringify({
        userId,
        username: profile.display_name || 'Anonymous',
        emojiRing: ringPositions,
        frame: equippedData?.frame_id ? {
          id: equippedData.frame_id,
          css: equippedData.frame_css,
          name: equippedData.frame_name,
        } : null,
        title: equippedData?.title_id ? {
          id: equippedData.title_id,
          name: equippedData.title_name,
        } : null,
        nameEffect: equippedData?.name_effect_id ? {
          id: equippedData.name_effect_id,
          css: equippedData.name_effect_css,
          name: equippedData.name_effect_name,
        } : null,
        background: equippedData?.background_id ? {
          id: equippedData.background_id,
          css: equippedData.background_css,
          name: equippedData.background_name,
        } : null,
        celebration: equippedData?.celebration_id ? {
          id: equippedData.celebration_id,
          css: equippedData.celebration_css,
          name: equippedData.celebration_name,
        } : null,
        bigpulp: {
          hat: bigpulp?.current_hat || null,
          mood: bigpulp?.current_mood || 'happy',
          accessory: bigpulp?.current_accessory || null,
        },
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Shop Display] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
