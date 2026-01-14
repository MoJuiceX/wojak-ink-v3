/**
 * Cloudflare Pages Function - /api/profile
 *
 * GET: Returns the authenticated user's profile
 * POST: Creates/updates the authenticated user's profile
 */

import { authenticateRequest } from '../lib/auth';

interface Env {
  CLERK_DOMAIN: string;
  DB: D1Database; // D1 binding
}

interface ProfileData {
  displayName?: string;
  xHandle?: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

/**
 * Ensure user exists in users table (upsert)
 */
async function ensureUser(db: D1Database, userId: string): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (id, created_at, updated_at)
       VALUES (?, datetime('now'), datetime('now'))
       ON CONFLICT(id) DO UPDATE SET updated_at = datetime('now')`
    )
    .bind(userId)
    .run();
}

/**
 * Get user profile
 */
async function getProfile(db: D1Database, userId: string) {
  const result = await db
    .prepare('SELECT display_name, x_handle, updated_at FROM profiles WHERE user_id = ?')
    .bind(userId)
    .first<{ display_name: string | null; x_handle: string | null; updated_at: string }>();

  return result;
}

/**
 * Validate profile data
 */
function validateProfileData(data: ProfileData): { valid: boolean; error?: string } {
  // Validate displayName (optional, 3-20 chars)
  if (data.displayName !== undefined && data.displayName !== null && data.displayName !== '') {
    if (data.displayName.length < 3 || data.displayName.length > 20) {
      return { valid: false, error: 'Display name must be 3-20 characters' };
    }
  }

  // Validate xHandle (required for save, alphanumeric + underscore, max 15 chars)
  if (data.xHandle !== undefined && data.xHandle !== null && data.xHandle !== '') {
    // Remove @ if present
    const handle = data.xHandle.replace(/^@/, '');

    if (!/^[a-zA-Z0-9_]{1,15}$/.test(handle)) {
      return { valid: false, error: 'X handle must be 1-15 alphanumeric characters or underscores' };
    }

    // Update the data with cleaned handle
    data.xHandle = handle;
  }

  return { valid: true };
}

/**
 * Upsert profile
 */
async function upsertProfile(
  db: D1Database,
  userId: string,
  data: ProfileData
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO profiles (user_id, display_name, x_handle, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         display_name = COALESCE(?, display_name),
         x_handle = COALESCE(?, x_handle),
         updated_at = datetime('now')`
    )
    .bind(
      userId,
      data.displayName || null,
      data.xHandle || null,
      data.displayName !== undefined ? data.displayName || null : null,
      data.xHandle !== undefined ? data.xHandle || null : null
    )
    .run();
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if auth is configured
  if (!env.CLERK_DOMAIN) {
    return new Response(
      JSON.stringify({ error: 'Auth not configured' }),
      { status: 500, headers: corsHeaders }
    );
  }

  // Check if DB is configured
  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: 'Database not configured' }),
      { status: 500, headers: corsHeaders }
    );
  }

  // Authenticate request
  const auth = await authenticateRequest(request, env.CLERK_DOMAIN);

  if (!auth) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: corsHeaders }
    );
  }

  const { userId } = auth;

  try {
    // Ensure user exists
    await ensureUser(env.DB, userId);

    // Handle GET - return profile
    if (request.method === 'GET') {
      const profile = await getProfile(env.DB, userId);

      return new Response(
        JSON.stringify({
          userId,
          profile: profile
            ? {
                displayName: profile.display_name,
                xHandle: profile.x_handle,
                updatedAt: profile.updated_at,
              }
            : null,
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Handle POST - update profile
    if (request.method === 'POST') {
      let data: ProfileData;

      try {
        data = await request.json();
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON' }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Validate
      const validation = validateProfileData(data);
      if (!validation.valid) {
        return new Response(
          JSON.stringify({ error: validation.error }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Save
      await upsertProfile(env.DB, userId, data);

      // Return updated profile
      const profile = await getProfile(env.DB, userId);

      return new Response(
        JSON.stringify({
          success: true,
          profile: profile
            ? {
                displayName: profile.display_name,
                xHandle: profile.x_handle,
                updatedAt: profile.updated_at,
              }
            : null,
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Profile] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
};
