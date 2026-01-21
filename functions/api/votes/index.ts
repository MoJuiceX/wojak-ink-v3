/**
 * Votes API - POST /api/votes
 *
 * Submit a vote (donut or poop) with position data
 */

interface Env {
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

    // Insert vote
    await env.DB.prepare(`
      INSERT INTO votes (page_type, target_id, emoji, x_percent, y_percent, ip_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      pageType,
      targetId,
      emoji,
      xPercent ?? null,
      yPercent ?? null,
      ipHash
    ).run();

    return new Response(JSON.stringify({ success: true }), {
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
