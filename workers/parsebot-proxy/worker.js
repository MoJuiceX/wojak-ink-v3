/**
 * Parse.bot API Proxy Worker
 *
 * Cloudflare Worker that proxies requests to Parse.bot API,
 * adding the API key securely server-side.
 *
 * Environment Variables (set in Cloudflare dashboard):
 * - PARSEBOT_API_KEY: Your Parse.bot API key
 *
 * Endpoints:
 * - POST /collection-stats - Fetch collection statistics
 * - POST /nft-details - Fetch NFT details (requires nft_url in body)
 * - POST /nft-owner - Fetch NFT owner (requires nft_url in body)
 */

const PARSEBOT_BASE = 'https://api.parse.bot';
const SCRAPER_ID = '3e7e6f3c-882b-4235-a9df-d1c183f09db9';
const COLLECTION_URL = 'https://mintgarden.io/collections/wojak-farmers-plot-col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://wojak.ink',
  'https://www.wojak.ink',
  'http://localhost:5173',
  'http://localhost:3000',
];

function corsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

function errorResponse(message, status = 400, origin = '') {
  return jsonResponse({ error: message }, status, origin);
}

async function proxyToParseBot(endpoint, body, apiKey) {
  const url = `${PARSEBOT_BASE}/scraper/${SCRAPER_ID}/${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Parse.bot error (${response.status}): ${errorText}`);
  }

  return response.json();
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    // Check API key is configured
    if (!env.PARSEBOT_API_KEY) {
      return errorResponse('API key not configured', 500, origin);
    }

    // Route handling
    const path = url.pathname;

    try {
      // Collection stats - no body needed
      if (path === '/collection-stats' && request.method === 'POST') {
        const data = await proxyToParseBot(
          'fetch_collection_stats',
          { collection_url: COLLECTION_URL },
          env.PARSEBOT_API_KEY
        );
        return jsonResponse(data, 200, origin);
      }

      // NFT details - requires nft_url in body
      if (path === '/nft-details' && request.method === 'POST') {
        const body = await request.json();
        if (!body.nft_url) {
          return errorResponse('nft_url is required', 400, origin);
        }
        const data = await proxyToParseBot(
          'fetch_nft_details',
          { nft_url: body.nft_url },
          env.PARSEBOT_API_KEY
        );
        return jsonResponse(data, 200, origin);
      }

      // NFT owner - requires nft_url in body
      if (path === '/nft-owner' && request.method === 'POST') {
        const body = await request.json();
        if (!body.nft_url) {
          return errorResponse('nft_url is required', 400, origin);
        }
        const data = await proxyToParseBot(
          'fetch_nft_details',
          { nft_url: body.nft_url },
          env.PARSEBOT_API_KEY
        );
        // Extract just owner info
        const ownerInfo = data.owner ? {
          address: data.owner_address?.encoded_id || '',
          name: data.owner?.name || null,
          avatar_uri: data.owner?.avatar_uri || null,
          twitter_handle: data.owner?.twitter_handle || null,
        } : null;
        return jsonResponse(ownerInfo, 200, origin);
      }

      // Health check
      if (path === '/health' && request.method === 'GET') {
        return jsonResponse({ status: 'ok', scraper_id: SCRAPER_ID }, 200, origin);
      }

      // Not found
      return errorResponse('Not found', 404, origin);

    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse(error.message || 'Internal server error', 500, origin);
    }
  },
};
