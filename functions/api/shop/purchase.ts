/**
 * Shop Purchase API - /api/shop/purchase
 *
 * POST: Purchase an item from the shop
 * Body: { itemId: string }
 *
 * Response: {
 *   success: boolean,
 *   item: InventoryItem,
 *   newBalance: number
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

interface ShopItem {
  id: string;
  name: string;
  category: string;
  rarity: string;
  price_oranges: number;
  emoji: string | null;
}

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
    const body = await request.json() as { itemId: string };
    const { itemId } = body;

    if (!itemId) {
      return new Response(JSON.stringify({ error: 'itemId is required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get the item details
    const item = await env.DB
      .prepare('SELECT id, name, category, rarity, price_oranges, emoji FROM shop_items WHERE id = ? AND is_active = 1')
      .bind(itemId)
      .first<ShopItem>();

    if (!item) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Check if user already owns this item
    const existing = await env.DB
      .prepare('SELECT id FROM user_inventory WHERE user_id = ? AND item_id = ?')
      .bind(auth.userId, itemId)
      .first();

    if (existing) {
      return new Response(JSON.stringify({ error: 'You already own this item' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get user's current balance
    const profile = await env.DB
      .prepare('SELECT oranges FROM profiles WHERE user_id = ?')
      .bind(auth.userId)
      .first<{ oranges: number }>();

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Check if user has enough oranges
    if (profile.oranges < item.price_oranges) {
      return new Response(JSON.stringify({
        error: 'Insufficient oranges',
        required: item.price_oranges,
        current: profile.oranges,
      }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Perform the purchase using batch for atomicity
    const newBalance = profile.oranges - item.price_oranges;

    await env.DB.batch([
      // Deduct oranges from profile
      env.DB.prepare(
        'UPDATE profiles SET oranges = ?, updated_at = datetime("now") WHERE user_id = ?'
      ).bind(newBalance, auth.userId),

      // Add item to inventory
      env.DB.prepare(
        'INSERT INTO user_inventory (user_id, item_id, acquisition_type, acquired_at) VALUES (?, ?, "purchase", datetime("now"))'
      ).bind(auth.userId, itemId),

      // Record purchase history
      env.DB.prepare(
        'INSERT INTO purchase_history (user_id, item_id, price_paid, currency, purchased_at) VALUES (?, ?, ?, "oranges", datetime("now"))'
      ).bind(auth.userId, itemId, item.price_oranges),

      // Record currency transaction
      env.DB.prepare(
        `INSERT INTO currency_transactions (user_id, currency_type, amount, balance_after, source, source_details, created_at)
         VALUES (?, "oranges", ?, ?, "shop", ?, datetime("now"))`
      ).bind(auth.userId, -item.price_oranges, newBalance, JSON.stringify({ itemId, itemName: item.name })),

      // If it's an emoji badge, add to owned emojis
      ...(item.category === 'emoji_badge' && item.emoji ? [
        env.DB.prepare(
          'INSERT OR IGNORE INTO user_owned_emojis (user_id, emoji, item_id, acquired_at) VALUES (?, ?, ?, datetime("now"))'
        ).bind(auth.userId, item.emoji, itemId),
      ] : []),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        item: {
          id: item.id,
          name: item.name,
          category: item.category,
          rarity: item.rarity,
          emoji: item.emoji,
        },
        newBalance,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Shop Purchase] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
