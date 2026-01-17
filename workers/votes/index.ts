/**
 * Cloudflare Worker for vote API
 * Supports voting on any page via pageType parameter
 */

interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // POST /api/votes - Add a vote
      if (request.method === 'POST' && url.pathname === '/api/votes') {
        const body = await request.json() as {
          targetId: string;
          pageType: string;
          emoji: 'donut' | 'poop';
          xPercent: number;
          yPercent: number;
        };

        // Validate
        if (!body.targetId || !body.pageType || !body.emoji ||
            body.xPercent < 0 || body.xPercent > 100 ||
            body.yPercent < 0 || body.yPercent > 100) {
          return new Response(JSON.stringify({ error: 'Invalid data' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Hash IP for privacy
        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        const ipHash = await hashString(clientIP);

        // Insert vote
        await env.DB.prepare(`
          INSERT INTO votes (target_id, page_type, emoji, x_percent, y_percent, ip_hash)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(body.targetId, body.pageType, body.emoji, body.xPercent, body.yPercent, ipHash).run();

        // Update count
        await env.DB.prepare(`
          INSERT INTO vote_counts (target_id, page_type, emoji, count)
          VALUES (?, ?, ?, 1)
          ON CONFLICT(target_id, page_type, emoji)
          DO UPDATE SET count = count + 1, updated_at = unixepoch()
        `).bind(body.targetId, body.pageType, body.emoji).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /api/votes/counts - Get vote counts for a page
      if (request.method === 'GET' && url.pathname === '/api/votes/counts') {
        const pageType = url.searchParams.get('pageType');

        let query = 'SELECT target_id, emoji, count FROM vote_counts';
        const params: string[] = [];

        if (pageType) {
          query += ' WHERE page_type = ?';
          params.push(pageType);
        }

        const result = await env.DB.prepare(query).bind(...params).all();

        // Transform to { targetId: { donuts: X, poops: Y } }
        const counts: Record<string, { donuts: number; poops: number }> = {};
        for (const row of result.results as { target_id: string; emoji: string; count: number }[]) {
          if (!counts[row.target_id]) {
            counts[row.target_id] = { donuts: 0, poops: 0 };
          }
          counts[row.target_id][row.emoji === 'donut' ? 'donuts' : 'poops'] = row.count;
        }

        return new Response(JSON.stringify({ counts }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /api/votes/positions - Get vote positions for heatmap
      if (request.method === 'GET' && url.pathname === '/api/votes/positions') {
        const pageType = url.searchParams.get('pageType');
        const emoji = url.searchParams.get('emoji') || 'donut';
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '200'), 200);
        const targetId = url.searchParams.get('targetId');

        let query = `
          SELECT id, target_id as targetId, x_percent as xPercent, y_percent as yPercent, created_at as createdAt
          FROM votes
          WHERE emoji = ?
        `;
        const params: (string | number)[] = [emoji];

        if (pageType) {
          query += ' AND page_type = ?';
          params.push(pageType);
        }

        if (targetId) {
          query += ' AND target_id = ?';
          params.push(targetId);
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);

        const result = await env.DB.prepare(query).bind(...params).all();

        return new Response(JSON.stringify({
          votes: result.results,
          total: result.results?.length || 0,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str + 'wojak-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}
