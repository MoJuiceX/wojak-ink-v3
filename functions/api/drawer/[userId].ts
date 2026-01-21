/**
 * Achievement Drawer API - /api/drawer/[userId]
 *
 * GET: Returns public drawer data for a user (shareable link)
 */

interface Env {
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

interface InventoryItem {
  id: string;
  item_id: string;
  name: string;
  category: string;
  rarity: string;
  css_class: string | null;
  emoji: string | null;
  acquired_at: string;
}

// BigPulp dialogue based on collection size
function getBigPulpDialogue(totalItems: number): { text: string; mood: string } {
  if (totalItems >= 50) {
    const dialogues = [
      { text: "You madlad. You actually got them all. 👑", mood: "hype" },
      { text: "This is what PEAK performance looks like.", mood: "sergeant" },
    ];
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  } else if (totalItems >= 20) {
    const dialogues = [
      { text: "ABSOLUTE UNIT. This drawer is STACKED!", mood: "hype" },
      { text: "Look at this flex! Impressive.", mood: "sergeant" },
    ];
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  } else if (totalItems >= 10) {
    const dialogues = [
      { text: "Now we're talking! The Grove recognizes you.", mood: "happy" },
      { text: "Solid collection. You're getting there!", mood: "hype" },
    ];
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  } else {
    const dialogues = [
      { text: "Nice start! Keep grinding, seedling.", mood: "happy" },
      { text: "Everyone starts somewhere. Keep at it!", mood: "chill" },
    ];
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

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

  const userId = params.userId as string;

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID required' }), {
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
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Get all items in user's inventory
    const { results: inventory } = await env.DB
      .prepare(
        `SELECT
          ui.id,
          ui.item_id,
          si.name,
          si.category,
          si.rarity,
          si.css_class,
          si.emoji,
          ui.acquired_at
        FROM user_inventory ui
        JOIN shop_items si ON ui.item_id = si.id
        WHERE ui.user_id = ?
        ORDER BY si.category, ui.acquired_at DESC`
      )
      .bind(userId)
      .all<InventoryItem>();

    // Get equipped items
    const equipped = await env.DB
      .prepare(
        'SELECT frame_id, title_id, name_effect_id, background_id, celebration_id FROM user_equipped WHERE user_id = ?'
      )
      .bind(userId)
      .first();

    // Get owned emojis
    const { results: ownedEmojis } = await env.DB
      .prepare('SELECT emoji FROM user_owned_emojis WHERE user_id = ?')
      .bind(userId)
      .all<{ emoji: string }>();

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

    // Get total spent
    const spending = await env.DB
      .prepare('SELECT SUM(price_paid) as total FROM purchase_history WHERE user_id = ?')
      .bind(userId)
      .first<{ total: number | null }>();

    // Group inventory by category
    const byCategory: Record<string, InventoryItem[]> = {};
    for (const item of inventory || []) {
      if (!byCategory[item.category]) {
        byCategory[item.category] = [];
      }
      byCategory[item.category].push(item);
    }

    const totalItems = inventory?.length || 0;
    const dialogue = getBigPulpDialogue(totalItems);

    // Get drawer customization settings
    const customization = await env.DB
      .prepare(`SELECT
        font_color, font_style, font_family,
        page_background, avatar_glow, avatar_size,
        bigpulp_position, dialogue_style, dialogue_color,
        stats_style, stats_color, stats_visible,
        collection_layout, card_style, featured_slots, featured_items,
        category_tabs_style, page_theme, page_border,
        entrance_animation, background_music, visitor_counter_style
      FROM drawer_customization WHERE user_id = ?`)
      .bind(userId)
      .first();

    // Get equipped item details for display
    let equippedFrame = null;
    let equippedTitle = null;
    let equippedNameEffect = null;

    if (equipped) {
      const equippedItems = equipped as {
        frame_id: string | null;
        title_id: string | null;
        name_effect_id: string | null;
        background_id: string | null;
        celebration_id: string | null;
      };

      if (equippedItems.frame_id) {
        equippedFrame = await env.DB
          .prepare('SELECT id, name, css_class FROM shop_items WHERE id = ?')
          .bind(equippedItems.frame_id)
          .first();
      }
      if (equippedItems.title_id) {
        equippedTitle = await env.DB
          .prepare('SELECT id, name FROM shop_items WHERE id = ?')
          .bind(equippedItems.title_id)
          .first();
      }
      if (equippedItems.name_effect_id) {
        equippedNameEffect = await env.DB
          .prepare('SELECT id, name, css_class FROM shop_items WHERE id = ?')
          .bind(equippedItems.name_effect_id)
          .first();
      }
    }

    return new Response(
      JSON.stringify({
        userId,
        username: profile.display_name || 'Anonymous',
        totalItems,
        totalSpent: spending?.total || 0,
        emojiRing: ringPositions,
        ownedEmojis: ownedEmojis?.map(e => e.emoji) || [],
        frames: byCategory.frame || [],
        titles: byCategory.title || [],
        nameEffects: byCategory.name_effect || [],
        backgrounds: byCategory.background || [],
        celebrations: byCategory.celebration || [],
        bigpulp: bigpulp || { current_hat: null, current_mood: 'happy', current_accessory: null },
        bigpulpItems: {
          hats: byCategory.bigpulp_hat || [],
          moods: byCategory.bigpulp_mood || [],
          accessories: byCategory.bigpulp_accessory || [],
        },
        equipped: {
          frame: equippedFrame,
          title: equippedTitle,
          nameEffect: equippedNameEffect,
        },
        bigpulpComment: dialogue.text,
        bigpulpMood: dialogue.mood,
        customization: customization || null,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Drawer] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
