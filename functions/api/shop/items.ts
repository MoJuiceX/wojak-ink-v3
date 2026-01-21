/**
 * Shop Items API - /api/shop/items
 *
 * GET: Returns all active shop items grouped by category
 */

interface Env {
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  rarity: string;
  price_oranges: number;
  price_xch: number;
  legend_tribute: string | null;
  css_class: string | null;
  emoji: string | null;
  sort_order: number;
}

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

  try {
    // Get all active shop items
    const { results } = await env.DB
      .prepare(
        `SELECT
          id, name, description, category, rarity,
          price_oranges, price_xch, legend_tribute,
          css_class, emoji, sort_order
        FROM shop_items
        WHERE is_active = 1
        ORDER BY category, sort_order`
      )
      .all<ShopItem>();

    // Group items by category
    const categories: Record<string, ShopItem[]> = {};
    const categoryOrder = [
      'emoji_badge',
      'frame',
      'name_effect',
      'title',
      'background',
      'celebration',
      'bigpulp_hat',
      'bigpulp_mood',
      'bigpulp_accessory',
      'founder',
    ];

    for (const item of results || []) {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    }

    return new Response(
      JSON.stringify({
        items: results || [],
        categories,
        categoryOrder,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Shop Items] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
