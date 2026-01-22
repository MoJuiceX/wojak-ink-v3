/**
 * Votes API - POST /api/votes
 *
 * Submit a vote (donut or poop) with position data
 * Requires authentication and deducts from user's consumables
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

// Simple hash function for IP (privacy-preserving rate limiting)
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    // Authenticate user
    const auth = await authenticateRequest(request, env.CLERK_DOMAIN);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const body = await request.json() as {
      targetId: string;
      pageType: string;
      emoji: 'donut' | 'poop';
      xPercent?: number;
      yPercent?: number;
    };

    const { targetId, pageType, emoji, xPercent, yPercent } = body;

    // Validate required fields
    if (!targetId || !pageType || !emoji) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Validate emoji type
    if (emoji !== 'donut' && emoji !== 'poop') {
      return new Response(JSON.stringify({ error: 'Invalid emoji type' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Validate page type
    const validPageTypes = ['games', 'gallery', 'media', 'shop'];
    if (!validPageTypes.includes(pageType)) {
      return new Response(JSON.stringify({ error: 'Invalid page type' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Check user has consumables
    const consumableType = emoji; // 'donut' or 'poop'
    const consumable = await env.DB.prepare(`
      SELECT quantity FROM user_consumables
      WHERE user_id = ? AND consumable_type = ?
    `).bind(auth.userId, consumableType).first<{ quantity: number }>();

    if (!consumable || consumable.quantity <= 0) {
      return new Response(JSON.stringify({
        error: 'No consumables available',
        type: consumableType,
        balance: consumable?.quantity || 0,
      }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get IP for rate limiting (privacy-preserving hash)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ipHash = hashIP(ip);

    // Simple rate limiting: max 100 votes per IP per hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const recentVotes = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM votes
      WHERE ip_hash = ? AND created_at > ?
    `).bind(ipHash, oneHourAgo).first<{ count: number }>();

    if (recentVotes && recentVotes.count >= 100) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: corsHeaders,
      });
    }

    // Atomic transaction: decrement consumable and insert vote
    await env.DB.batch([
      // Decrement consumable
      env.DB.prepare(`
        UPDATE user_consumables
        SET quantity = quantity - 1, updated_at = datetime('now')
        WHERE user_id = ? AND consumable_type = ? AND quantity > 0
      `).bind(auth.userId, consumableType),

      // Insert vote
      env.DB.prepare(`
        INSERT INTO votes (page_type, target_id, emoji, x_percent, y_percent, user_id, ip_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        pageType,
        targetId,
        emoji,
        xPercent ?? null,
        yPercent ?? null,
        auth.userId,
        ipHash
      ),
    ]);

    // Return new balance
    const newBalance = await env.DB.prepare(`
      SELECT quantity FROM user_consumables
      WHERE user_id = ? AND consumable_type = ?
    `).bind(auth.userId, consumableType).first<{ quantity: number }>();

    return new Response(JSON.stringify({
      success: true,
      newBalance: newBalance?.quantity || 0,
    }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('[Votes API] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};
