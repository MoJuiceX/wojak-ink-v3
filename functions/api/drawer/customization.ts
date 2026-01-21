/**
 * Drawer Customization API
 * GET /api/drawer/customization - Get user's customization settings
 * PUT /api/drawer/customization - Update customization settings
 * POST /api/drawer/customization/purchase - Purchase a customization item
 */

import { verifyClerkToken } from '../../_middleware/auth';

interface Env {
  DB: D1Database;
}

interface DrawerCustomization {
  font_color: string;
  font_style: string;
  font_family: string;
  page_background: string;
  avatar_glow: string;
  avatar_size: string;
  bigpulp_position: string;
  dialogue_style: string;
  dialogue_color: string;
  stats_style: string;
  stats_color: string;
  stats_visible: string;
  collection_layout: string;
  card_style: string;
  featured_slots: number;
  featured_items: string | null;
  category_tabs_style: string;
  page_theme: string;
  page_border: string;
  entrance_animation: string;
  background_music: string | null;
  visitor_counter_style: string;
}

const DEFAULT_CUSTOMIZATION: DrawerCustomization = {
  font_color: 'orange',
  font_style: 'normal',
  font_family: 'default',
  page_background: 'midnight_black',
  avatar_glow: 'none',
  avatar_size: 'normal',
  bigpulp_position: 'right',
  dialogue_style: 'default',
  dialogue_color: 'dark',
  stats_style: 'default',
  stats_color: 'orange',
  stats_visible: '["items","emojis","spent"]',
  collection_layout: 'grid',
  card_style: 'default',
  featured_slots: 0,
  featured_items: null,
  category_tabs_style: 'default',
  page_theme: 'dark',
  page_border: 'none',
  entrance_animation: 'none',
  background_music: null,
  visitor_counter_style: 'hidden',
};

// GET - Fetch user's customization
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const authHeader = context.request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.slice(7);
    const payload = await verifyClerkToken(token);
    if (!payload) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = payload.sub;

    // Get customization settings
    const customization = await context.env.DB.prepare(`
      SELECT * FROM drawer_customization WHERE user_id = ?
    `).bind(userId).first<DrawerCustomization>();

    // Get owned items
    const { results: ownedItems } = await context.env.DB.prepare(`
      SELECT category, item_id FROM user_customization_items WHERE user_id = ?
    `).bind(userId).all<{ category: string; item_id: string }>();

    // Group owned items by category
    const owned: Record<string, string[]> = {};
    for (const item of ownedItems) {
      if (!owned[item.category]) {
        owned[item.category] = [];
      }
      owned[item.category].push(item.item_id);
    }

    // Add free items as owned
    const { results: freeItems } = await context.env.DB.prepare(`
      SELECT category, id FROM customization_catalog WHERE price_oranges = 0
    `).all<{ category: string; id: string }>();

    for (const item of freeItems) {
      if (!owned[item.category]) {
        owned[item.category] = [];
      }
      if (!owned[item.category].includes(item.id)) {
        owned[item.category].push(item.id);
      }
    }

    return new Response(JSON.stringify({
      customization: customization || DEFAULT_CUSTOMIZATION,
      owned,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Drawer Customization GET] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch customization' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PUT - Update customization settings
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const authHeader = context.request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.slice(7);
    const payload = await verifyClerkToken(token);
    if (!payload) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = payload.sub;
    const updates = await context.request.json() as Partial<DrawerCustomization>;

    // Get owned items to validate
    const { results: ownedItems } = await context.env.DB.prepare(`
      SELECT category, item_id FROM user_customization_items WHERE user_id = ?
    `).bind(userId).all<{ category: string; item_id: string }>();

    // Get free items
    const { results: freeItems } = await context.env.DB.prepare(`
      SELECT category, id FROM customization_catalog WHERE price_oranges = 0
    `).all<{ category: string; id: string }>();

    // Build owned set
    const ownedSet = new Set<string>();
    for (const item of ownedItems) {
      ownedSet.add(`${item.category}:${item.item_id}`);
    }
    for (const item of freeItems) {
      ownedSet.add(`${item.category}:${item.id}`);
    }

    // Validate all updates are owned items
    const categoryMapping: Record<string, string> = {
      font_color: 'font_color',
      font_style: 'font_style',
      font_family: 'font_family',
      page_background: 'page_background',
      avatar_glow: 'avatar_glow',
      avatar_size: 'avatar_size',
      bigpulp_position: 'bigpulp_position',
      dialogue_style: 'dialogue_style',
      collection_layout: 'collection_layout',
      card_style: 'card_style',
      entrance_animation: 'entrance_animation',
      visitor_counter_style: 'visitor_counter_style',
      stats_style: 'stats_style',
      category_tabs_style: 'category_tabs_style',
    };

    // Build SET clause dynamically
    const setClauses: string[] = [];
    const values: (string | number | null)[] = [];

    for (const [field, value] of Object.entries(updates)) {
      if (field in categoryMapping && typeof value === 'string') {
        // Validate ownership for category-based items
        const category = categoryMapping[field];
        const itemKey = `${category}:${value}`;
        // Only validate if it's a customization category
        if (!ownedSet.has(itemKey)) {
          return new Response(JSON.stringify({
            error: `You don't own this ${field}: ${value}`,
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
      setClauses.push(`${field} = ?`);
      values.push(value as string | number | null);
    }

    if (setClauses.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid updates' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    setClauses.push('updated_at = CURRENT_TIMESTAMP');

    // Upsert customization
    await context.env.DB.prepare(`
      INSERT INTO drawer_customization (user_id, ${Object.keys(updates).join(', ')}, updated_at)
      VALUES (?, ${values.map(() => '?').join(', ')}, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET ${setClauses.join(', ')}
    `).bind(userId, ...values).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Drawer Customization PUT] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update customization' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
