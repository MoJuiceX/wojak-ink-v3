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

interface AvatarData {
  type: 'emoji' | 'nft';
  value: string;
  source: 'default' | 'user' | 'wallet';
  nftId?: string;
  nftLauncherId?: string;
}

interface ProfileData {
  displayName?: string;
  xHandle?: string;
  walletAddress?: string;
  avatar?: AvatarData;
  ownedNftIds?: string[];
  // NFT verification for chat access
  nftCount?: number | null;
  nftVerifiedAt?: string | null;
}

// Valid emoji list for validation and random assignment
const VALID_EMOJIS = ['🎮', '🔥', '🚀', '🎯', '🦊', '🐸', '👾', '🤖', '🎪', '🌸', '🍕', '🎸', '⚡', '🦁', '🐙'];

/**
 * Get a random emoji from the valid list
 */
function getRandomEmoji(): string {
  return VALID_EMOJIS[Math.floor(Math.random() * VALID_EMOJIS.length)];
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
 * Get user profile with streak and avatar info
 * JOINs users table to get created_at for "Member for X days" display
 * Note: Falls back gracefully if columns don't exist yet
 */
async function getProfile(db: D1Database, userId: string) {
  // Try with all columns including avatar, NFT count, and user created_at
  try {
    const result = await db
      .prepare(`SELECT
        u.created_at as user_created_at,
        p.display_name,
        p.x_handle,
        p.wallet_address,
        p.current_streak,
        p.longest_streak,
        p.last_played_date,
        p.avatar_type,
        p.avatar_value,
        p.avatar_source,
        p.avatar_nft_id,
        p.avatar_nft_launcher_id,
        p.owned_nft_ids,
        p.nft_count,
        p.nft_verified_at,
        p.updated_at
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      WHERE p.user_id = ?`)
      .bind(userId)
      .first<{
        user_created_at: string;
        display_name: string | null;
        x_handle: string | null;
        wallet_address: string | null;
        current_streak: number | null;
        longest_streak: number | null;
        last_played_date: string | null;
        avatar_type: string | null;
        avatar_value: string | null;
        avatar_source: string | null;
        avatar_nft_id: string | null;
        avatar_nft_launcher_id: string | null;
        owned_nft_ids: string | null;
        nft_count: number | null;
        nft_verified_at: string | null;
        updated_at: string;
      }>();

    return result;
  } catch (error) {
    // Fallback: avatar columns might not exist yet
    console.log('[Profile] Falling back to query without avatar columns');
    try {
      const result = await db
        .prepare(`SELECT
          u.created_at as user_created_at,
          p.display_name,
          p.x_handle,
          p.wallet_address,
          p.current_streak,
          p.longest_streak,
          p.last_played_date,
          p.updated_at
        FROM profiles p
        JOIN users u ON u.id = p.user_id
        WHERE p.user_id = ?`)
        .bind(userId)
        .first<{
          user_created_at: string;
          display_name: string | null;
          x_handle: string | null;
          wallet_address: string | null;
          current_streak: number | null;
          longest_streak: number | null;
          last_played_date: string | null;
          updated_at: string;
        }>();

      // Return with default avatar values
      return result ? {
        ...result,
        avatar_type: null,
        avatar_value: null,
        avatar_source: null,
        avatar_nft_id: null,
        avatar_nft_launcher_id: null,
        owned_nft_ids: null,
        nft_count: null,
        nft_verified_at: null,
      } : null;
    } catch {
      // Final fallback: basic columns only
      console.log('[Profile] Falling back to basic query');
      const result = await db
        .prepare(`SELECT
          u.created_at as user_created_at,
          p.display_name,
          p.x_handle,
          p.wallet_address,
          p.updated_at
        FROM profiles p
        JOIN users u ON u.id = p.user_id
        WHERE p.user_id = ?`)
        .bind(userId)
        .first<{
          user_created_at: string;
          display_name: string | null;
          x_handle: string | null;
          wallet_address: string | null;
          updated_at: string;
        }>();

      return result ? {
        ...result,
        current_streak: null,
        longest_streak: null,
        last_played_date: null,
        avatar_type: null,
        avatar_value: null,
        avatar_source: null,
        avatar_nft_id: null,
        avatar_nft_launcher_id: null,
        owned_nft_ids: null,
        nft_count: null,
        nft_verified_at: null,
      } : null;
    }
  }
}

/**
 * Validate profile data
 */
function validateProfileData(data: ProfileData, existingProfile?: { wallet_address: string | null }): { valid: boolean; error?: string } {
  // Validate displayName (optional, 3-20 chars)
  if (data.displayName !== undefined && data.displayName !== null && data.displayName !== '') {
    if (data.displayName.length < 3 || data.displayName.length > 20) {
      return { valid: false, error: 'Display name must be 3-20 characters' };
    }
  }

  // Validate xHandle (optional, alphanumeric + underscore, max 15 chars)
  if (data.xHandle !== undefined && data.xHandle !== null && data.xHandle !== '') {
    // Remove @ if present
    const handle = data.xHandle.replace(/^@/, '');

    if (!/^[a-zA-Z0-9_]{1,15}$/.test(handle)) {
      return { valid: false, error: 'X handle must be 1-15 alphanumeric characters or underscores' };
    }

    // Update the data with cleaned handle
    data.xHandle = handle;
  }

  // Validate walletAddress (optional, xch prefix, 62 chars)
  if (data.walletAddress !== undefined && data.walletAddress !== null && data.walletAddress !== '') {
    const wallet = data.walletAddress.trim().toLowerCase();

    if (!wallet.startsWith('xch') || wallet.length !== 62) {
      return { valid: false, error: 'Wallet address must be a valid Chia address (xch...)' };
    }

    // Update with cleaned address
    data.walletAddress = wallet;
  }

  // Validate avatar if provided
  if (data.avatar) {
    const { type, value, source } = data.avatar;

    if (type === 'nft') {
      // NFT avatar requires wallet to be connected
      const walletAddress = data.walletAddress || existingProfile?.wallet_address;
      if (!walletAddress) {
        return { valid: false, error: 'Wallet must be connected to use NFT avatar' };
      }
    }

    if (type === 'emoji' && source === 'user') {
      // Validate emoji is in allowed list
      if (!VALID_EMOJIS.includes(value)) {
        return { valid: false, error: 'Invalid emoji selection' };
      }
    }
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
  // Try with avatar columns first
  try {
    await db
      .prepare(
        `INSERT INTO profiles (
          user_id, display_name, x_handle, wallet_address,
          avatar_type, avatar_value, avatar_source, avatar_nft_id, avatar_nft_launcher_id,
          owned_nft_ids, nft_count, nft_verified_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
          display_name = COALESCE(?, profiles.display_name),
          x_handle = COALESCE(?, profiles.x_handle),
          wallet_address = COALESCE(?, profiles.wallet_address),
          avatar_type = COALESCE(?, profiles.avatar_type),
          avatar_value = COALESCE(?, profiles.avatar_value),
          avatar_source = COALESCE(?, profiles.avatar_source),
          avatar_nft_id = ?,
          avatar_nft_launcher_id = ?,
          owned_nft_ids = COALESCE(?, profiles.owned_nft_ids),
          nft_count = COALESCE(?, profiles.nft_count),
          nft_verified_at = COALESCE(?, profiles.nft_verified_at),
          updated_at = datetime('now')`
      )
      .bind(
        userId,
        data.displayName || null,
        data.xHandle || null,
        data.walletAddress || null,
        data.avatar?.type || null,
        data.avatar?.value || null,
        data.avatar?.source || null,
        data.avatar?.nftId || null,
        data.avatar?.nftLauncherId || null,
        data.ownedNftIds ? JSON.stringify(data.ownedNftIds) : null,
        data.nftCount ?? null,
        data.nftVerifiedAt || null,
        // Update values
        data.displayName !== undefined ? data.displayName || null : null,
        data.xHandle !== undefined ? data.xHandle || null : null,
        data.walletAddress !== undefined ? data.walletAddress || null : null,
        data.avatar?.type || null,
        data.avatar?.value || null,
        data.avatar?.source || null,
        data.avatar?.nftId || null,
        data.avatar?.nftLauncherId || null,
        data.ownedNftIds ? JSON.stringify(data.ownedNftIds) : null,
        data.nftCount !== undefined ? data.nftCount : null,
        data.nftVerifiedAt !== undefined ? data.nftVerifiedAt : null
      )
      .run();
    
    console.log('[Profile] Upsert successful with avatar columns');
    return; // Success - exit early
  } catch (error) {
    // Log the actual error to understand what's happening
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Profile] Upsert with avatar columns failed:', errorMessage);
    
    // Only fallback if it's a column-not-found error
    // D1/SQLite error for missing column contains "no such column" or "no column"
    if (!errorMessage.toLowerCase().includes('no such column') && 
        !errorMessage.toLowerCase().includes('no column')) {
      // Re-throw for other errors - don't silently drop avatar data
      throw error;
    }
    
    console.log('[Profile] Falling back to basic upsert without avatar columns');
    await db
      .prepare(
        `INSERT INTO profiles (user_id, display_name, x_handle, wallet_address, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT(user_id) DO UPDATE SET
           display_name = COALESCE(?, profiles.display_name),
           x_handle = COALESCE(?, profiles.x_handle),
           wallet_address = COALESCE(?, profiles.wallet_address),
           updated_at = datetime('now')`
      )
      .bind(
        userId,
        data.displayName || null,
        data.xHandle || null,
        data.walletAddress || null,
        data.displayName !== undefined ? data.displayName || null : null,
        data.xHandle !== undefined ? data.xHandle || null : null,
        data.walletAddress !== undefined ? data.walletAddress || null : null
      )
      .run();
  }
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
      let profile = await getProfile(env.DB, userId);

      // Auto-assign random emoji for new users without an avatar
      if (!profile || !profile.avatar_value) {
        const randomEmoji = getRandomEmoji();
        console.log(`[Profile] Assigning random emoji ${randomEmoji} to user ${userId}`);

        // Save the random emoji to the database
        await upsertProfile(env.DB, userId, {
          avatar: {
            type: 'emoji',
            value: randomEmoji,
            source: 'default',
          },
        });

        // Fetch the updated profile
        profile = await getProfile(env.DB, userId);
      }

      return new Response(
        JSON.stringify({
          userId,
          profile: profile
            ? {
                displayName: profile.display_name,
                xHandle: profile.x_handle,
                walletAddress: profile.wallet_address,
                currentStreak: profile.current_streak || 0,
                longestStreak: profile.longest_streak || 0,
                lastPlayedDate: profile.last_played_date,
                avatar: {
                  type: profile.avatar_type || 'emoji',
                  value: profile.avatar_value || '🎮',
                  source: profile.avatar_source || 'default',
                  nftId: profile.avatar_nft_id,
                  nftLauncherId: profile.avatar_nft_launcher_id,
                },
                ownedNftIds: profile.owned_nft_ids ? JSON.parse(profile.owned_nft_ids) : [],
                nftCount: profile.nft_count,
                nftVerifiedAt: profile.nft_verified_at,
                createdAt: profile.user_created_at,
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

      // Get existing profile for validation
      const existingProfile = await getProfile(env.DB, userId);

      // Validate
      const validation = validateProfileData(data, existingProfile ? { wallet_address: existingProfile.wallet_address } : undefined);
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
                walletAddress: profile.wallet_address,
                currentStreak: profile.current_streak || 0,
                longestStreak: profile.longest_streak || 0,
                lastPlayedDate: profile.last_played_date,
                avatar: {
                  type: profile.avatar_type || 'emoji',
                  value: profile.avatar_value || '🎮',
                  source: profile.avatar_source || 'default',
                  nftId: profile.avatar_nft_id,
                  nftLauncherId: profile.avatar_nft_launcher_id,
                },
                ownedNftIds: profile.owned_nft_ids ? JSON.parse(profile.owned_nft_ids) : [],
                nftCount: profile.nft_count,
                nftVerifiedAt: profile.nft_verified_at,
                createdAt: profile.user_created_at,
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
