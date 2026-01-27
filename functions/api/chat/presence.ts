/**
 * Chat Presence API - /api/chat/presence
 *
 * GET: Returns current online user counts for each chat room
 * No authentication required - public endpoint for displaying room activity
 *
 * Response: {
 *   rooms: {
 *     whale: { online: number },
 *     holder: { online: number },
 *   },
 *   totalOnline: number
 * }
 */

import { checkRateLimit, getRateLimitKey, getRateLimitHeaders, CHAT_RATE_LIMITS } from '../../lib/rateLimit';

interface Env {
  DB?: D1Database; // Optional - rate limiting works without it
}

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://wojak.ink',
  'https://www.wojak.ink',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
];

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://wojak.ink';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };
}

// Socket.io server URL
const CHAT_SERVER_URL = 'https://wojak-chat.fly.dev';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const corsHeaders = getCorsHeaders(request);

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

  // Rate limiting (IP-based for public endpoint)
  const rateLimitKey = getRateLimitKey(request);
  const rateLimitResult = await checkRateLimit(env.DB, rateLimitKey, CHAT_RATE_LIMITS.presence);
  
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { 
        status: 429, 
        headers: {
          ...corsHeaders,
          ...getRateLimitHeaders(rateLimitResult, CHAT_RATE_LIMITS.presence),
        }
      }
    );
  }

  try {
    // Fetch presence data from Socket.io server health endpoint
    const healthResponse = await fetch(`${CHAT_SERVER_URL}/health`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'wojak.ink/presence-api',
      },
    });

    if (!healthResponse.ok) {
      throw new Error(`Chat server returned ${healthResponse.status}`);
    }

    const healthData = await healthResponse.json() as {
      status: string;
      rooms: string[];
      uptime: number;
      onlineUsers: {
        whale: number;
        holder: number;
      };
    };

    // Transform to presence format
    const response = {
      rooms: {
        whale: { online: healthData.onlineUsers?.whale || 0 },
        holder: { online: healthData.onlineUsers?.holder || 0 },
      },
      totalOnline: (healthData.onlineUsers?.whale || 0) + (healthData.onlineUsers?.holder || 0),
      serverStatus: healthData.status,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('[Chat Presence] Error fetching presence:', error);
    
    // Return zeroes on error rather than failing
    return new Response(
      JSON.stringify({
        rooms: {
          whale: { online: 0 },
          holder: { online: 0 },
        },
        totalOnline: 0,
        serverStatus: 'unknown',
        error: 'Could not fetch presence data',
      }),
      { status: 200, headers: corsHeaders }
    );
  }
};
