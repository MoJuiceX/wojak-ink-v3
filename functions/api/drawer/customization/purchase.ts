/**
 * Customization Purchase API
 * POST /api/drawer/customization/purchase
 *
 * Purchase a customization item with oranges.
 */

import { authenticateRequest } from '../../../lib/auth';

interface Env {
  CLERK_DOMAIN: string;
  DB: D1Database;
}

interface PurchaseRequest {
  category: string;
  itemId: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await authenticateRequest(context.request, context.env.CLERK_DOMAIN);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = auth.userId;
    const { category, itemId } = await context.request.json() as PurchaseRequest;

    if (!category || !itemId) {
      return new Response(JSON.stringify({ error: 'Missing category or itemId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get item from catalog
    const item = await context.env.DB.prepare(`
      SELECT id, category, name, price_oranges
      FROM customization_catalog
      WHERE id = ? AND category = ? AND is_active = 1
    `).bind(itemId, category).first<{
      id: string;
      category: string;
      name: string;
      price_oranges: number;
    }>();

    if (!item) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if already owned
    const existing = await context.env.DB.prepare(`
      SELECT id FROM user_customization_items
      WHERE user_id = ? AND category = ? AND item_id = ?
    `).bind(userId, category, itemId).first();

    if (existing) {
      return new Response(JSON.stringify({ error: 'Already owned' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Free items don't need currency check
    if (item.price_oranges === 0) {
      await context.env.DB.prepare(`
        INSERT INTO user_customization_items (user_id, category, item_id)
        VALUES (?, ?, ?)
      `).bind(userId, category, itemId).run();

      return new Response(JSON.stringify({
        success: true,
        item: item.name,
        price: 0,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user's balance
    const currency = await context.env.DB.prepare(`
      SELECT oranges FROM user_currency WHERE user_id = ?
    `).bind(userId).first<{ oranges: number }>();

    const balance = currency?.oranges || 0;

    if (balance < item.price_oranges) {
      return new Response(JSON.stringify({
        error: 'Insufficient oranges',
        required: item.price_oranges,
        balance,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process purchase - deduct oranges and add item
    await context.env.DB.batch([
      context.env.DB.prepare(`
        UPDATE user_currency
        SET oranges = oranges - ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).bind(item.price_oranges, userId),

      context.env.DB.prepare(`
        INSERT INTO user_customization_items (user_id, category, item_id)
        VALUES (?, ?, ?)
      `).bind(userId, category, itemId),

      // Track in purchase history
      context.env.DB.prepare(`
        INSERT INTO purchase_history (user_id, item_id, price_paid, currency)
        VALUES (?, ?, ?, 'oranges')
      `).bind(userId, itemId, item.price_oranges),
    ]);

    // Get new balance
    const newCurrency = await context.env.DB.prepare(`
      SELECT oranges, gems FROM user_currency WHERE user_id = ?
    `).bind(userId).first<{ oranges: number; gems: number }>();

    return new Response(JSON.stringify({
      success: true,
      item: item.name,
      price: item.price_oranges,
      newBalance: {
        oranges: newCurrency?.oranges || 0,
        gems: newCurrency?.gems || 0,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Customization Purchase] Error:', error);
    return new Response(JSON.stringify({ error: 'Purchase failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
