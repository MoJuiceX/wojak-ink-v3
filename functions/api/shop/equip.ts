/**
 * Equip Item API - /api/shop/equip
 *
 * POST: Equip or unequip an item
 * Body: {
 *   slot: 'frame' | 'title' | 'name_effect' | 'background' | 'celebration',
 *   itemId: string | null  // null to unequip
 * }
 */

import { authenticateRequest } from '../../lib/auth';

interface Env {
  CLERK_DOMAIN: string;
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

type EquipSlot = 'frame' | 'title' | 'name_effect' | 'background' | 'celebration';

const SLOT_TO_CATEGORY: Record<EquipSlot, string> = {
  frame: 'frame',
  title: 'title',
  name_effect: 'name_effect',
  background: 'background',
  celebration: 'celebration',
};

const SLOT_TO_COLUMN: Record<EquipSlot, string> = {
  frame: 'frame_id',
  title: 'title_id',
  name_effect: 'name_effect_id',
  background: 'background_id',
  celebration: 'celebration_id',
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

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
    // Parse request body
    const body = await request.json() as { slot: EquipSlot; itemId: string | null };
    const { slot, itemId } = body;

    // Validate slot
    if (!slot || !SLOT_TO_COLUMN[slot]) {
      return new Response(JSON.stringify({ error: 'Invalid slot' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // If equipping (not unequipping), verify user owns the item
    if (itemId !== null) {
      const owned = await env.DB
        .prepare(
          `SELECT ui.id
           FROM user_inventory ui
           JOIN shop_items si ON ui.item_id = si.id
           WHERE ui.user_id = ? AND ui.item_id = ? AND si.category = ?`
        )
        .bind(auth.userId, itemId, SLOT_TO_CATEGORY[slot])
        .first();

      if (!owned) {
        return new Response(JSON.stringify({ error: 'You do not own this item or it does not match the slot' }), {
          status: 400,
          headers: corsHeaders,
        });
      }
    }

    // Ensure user_equipped row exists
    await env.DB
      .prepare(
        `INSERT INTO user_equipped (user_id, updated_at)
         VALUES (?, datetime("now"))
         ON CONFLICT(user_id) DO NOTHING`
      )
      .bind(auth.userId)
      .run();

    // Update the equipped item
    const column = SLOT_TO_COLUMN[slot];
    await env.DB
      .prepare(
        `UPDATE user_equipped
         SET ${column} = ?, updated_at = datetime("now")
         WHERE user_id = ?`
      )
      .bind(itemId, auth.userId)
      .run();

    // Get updated equipped state
    const equipped = await env.DB
      .prepare(
        'SELECT frame_id, title_id, name_effect_id, background_id, celebration_id FROM user_equipped WHERE user_id = ?'
      )
      .bind(auth.userId)
      .first();

    return new Response(
      JSON.stringify({
        success: true,
        slot,
        itemId,
        equipped,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Shop Equip] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
