var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../.wrangler/tmp/bundle-mGotxL/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// lib/auth.ts
var cachedJwks = null;
var jwksCachedAt = 0;
var JWKS_CACHE_TTL = 60 * 60 * 1e3;
async function fetchJwks(clerkDomain) {
  const now = Date.now();
  if (cachedJwks && now - jwksCachedAt < JWKS_CACHE_TTL) {
    return cachedJwks;
  }
  const jwksUrl = `https://${clerkDomain}/.well-known/jwks.json`;
  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.status}`);
  }
  cachedJwks = await response.json();
  jwksCachedAt = now;
  return cachedJwks;
}
__name(fetchJwks, "fetchJwks");
function base64UrlDecode(input) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
  return atob(padded);
}
__name(base64UrlDecode, "base64UrlDecode");
function decodeJwt(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  const [headerB64, payloadB64, signature] = parts;
  const header = JSON.parse(base64UrlDecode(headerB64));
  const payload = JSON.parse(base64UrlDecode(payloadB64));
  return { header, payload, signature };
}
__name(decodeJwt, "decodeJwt");
async function importKey(jwk) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-256" }
    },
    false,
    ["verify"]
  );
}
__name(importKey, "importKey");
async function verifySignature(token, key) {
  const parts = token.split(".");
  const signedData = `${parts[0]}.${parts[1]}`;
  const signature = parts[2];
  const signatureBytes = Uint8Array.from(
    base64UrlDecode(signature),
    (c) => c.charCodeAt(0)
  );
  const encoder = new TextEncoder();
  const data = encoder.encode(signedData);
  return crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signatureBytes,
    data
  );
}
__name(verifySignature, "verifySignature");
async function verifyClerkToken(token, clerkDomain) {
  const { header, payload } = decodeJwt(token);
  if (header.alg !== "RS256") {
    throw new Error("Unsupported algorithm");
  }
  const now = Math.floor(Date.now() / 1e3);
  if (payload.exp && payload.exp < now) {
    throw new Error("Token expired");
  }
  if (payload.nbf && payload.nbf > now) {
    throw new Error("Token not yet valid");
  }
  const expectedIssuer = `https://${clerkDomain}`;
  if (payload.iss !== expectedIssuer) {
    throw new Error("Invalid issuer");
  }
  const jwks = await fetchJwks(clerkDomain);
  const key = jwks.keys.find((k) => k.kid === header.kid);
  if (!key) {
    cachedJwks = null;
    const freshJwks = await fetchJwks(clerkDomain);
    const freshKey = freshJwks.keys.find((k) => k.kid === header.kid);
    if (!freshKey) {
      throw new Error("Signing key not found");
    }
    const cryptoKey = await importKey(freshKey);
    const valid = await verifySignature(token, cryptoKey);
    if (!valid) {
      throw new Error("Invalid signature");
    }
  } else {
    const cryptoKey = await importKey(key);
    const valid = await verifySignature(token, cryptoKey);
    if (!valid) {
      throw new Error("Invalid signature");
    }
  }
  if (!payload.sub) {
    throw new Error("Missing subject claim");
  }
  return {
    userId: payload.sub,
    payload
  };
}
__name(verifyClerkToken, "verifyClerkToken");
function extractBearerToken(authHeader) {
  if (!authHeader) return null;
  const match2 = authHeader.match(/^Bearer\s+(.+)$/i);
  return match2 ? match2[1] : null;
}
__name(extractBearerToken, "extractBearerToken");
async function authenticateRequest(request, clerkDomain) {
  const authHeader = request.headers.get("Authorization");
  const token = extractBearerToken(authHeader);
  if (!token) {
    return null;
  }
  try {
    return await verifyClerkToken(token, clerkDomain);
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}
__name(authenticateRequest, "authenticateRequest");

// api/messages/[id]/read.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};
var onRequest = /* @__PURE__ */ __name(async (context) => {
  const { request, env, params } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );
  }
  if (!env.CLERK_DOMAIN || !env.DB) {
    return new Response(
      JSON.stringify({ error: "Server not configured" }),
      { status: 500, headers: corsHeaders }
    );
  }
  const auth = await authenticateRequest(request, env.CLERK_DOMAIN);
  if (!auth) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: corsHeaders }
    );
  }
  const messageId = params.id;
  if (!messageId) {
    return new Response(
      JSON.stringify({ error: "Message ID required" }),
      { status: 400, headers: corsHeaders }
    );
  }
  try {
    const result = await env.DB.prepare(
      `UPDATE messages
         SET read = 1
         WHERE id = ? AND user_id = ?`
    ).bind(messageId, auth.userId).run();
    if (result.meta.changes === 0) {
      return new Response(
        JSON.stringify({ error: "Message not found" }),
        { status: 404, headers: corsHeaders }
      );
    }
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[Messages] Error marking read:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}, "onRequest");
var onRequestOptions = /* @__PURE__ */ __name(async () => {
  return new Response(null, { headers: corsHeaders });
}, "onRequestOptions");

// api/messages/unread-count.ts
var corsHeaders2 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};
var onRequest2 = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders2 });
  }
  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders2 }
    );
  }
  if (!env.CLERK_DOMAIN || !env.DB) {
    return new Response(
      JSON.stringify({ error: "Server not configured" }),
      { status: 500, headers: corsHeaders2 }
    );
  }
  const auth = await authenticateRequest(request, env.CLERK_DOMAIN);
  if (!auth) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: corsHeaders2 }
    );
  }
  try {
    const result = await env.DB.prepare(
      `SELECT COUNT(*) as count
         FROM messages
         WHERE user_id = ? AND read = 0`
    ).bind(auth.userId).first();
    return new Response(
      JSON.stringify({ count: result?.count || 0 }),
      { status: 200, headers: corsHeaders2 }
    );
  } catch (error) {
    console.error("[Messages] Error counting unread:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders2 }
    );
  }
}, "onRequest");
var onRequestOptions2 = /* @__PURE__ */ __name(async () => {
  return new Response(null, { headers: corsHeaders2 });
}, "onRequestOptions");

// api/leaderboard/submit.ts
var VALID_GAME_IDS = [
  "orange-stack",
  "memory-match",
  "orange-pong",
  "wojak-runner",
  "orange-juggle",
  "orange-slice"
];
var corsHeaders3 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};
async function ensureUser(db, userId) {
  await db.prepare(
    `INSERT INTO users (id, created_at, updated_at)
       VALUES (?, datetime('now'), datetime('now'))
       ON CONFLICT(id) DO UPDATE SET updated_at = datetime('now')`
  ).bind(userId).run();
}
__name(ensureUser, "ensureUser");
async function updateStreak(db, userId) {
  try {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const profile = await db.prepare("SELECT current_streak, longest_streak, last_played_date FROM profiles WHERE user_id = ?").bind(userId).first();
    if (!profile) {
      return { currentStreak: 1, isNewDay: true };
    }
    const lastPlayed = profile.last_played_date;
    let newStreak = profile.current_streak || 0;
    let isNewDay = false;
    if (lastPlayed === today) {
      return { currentStreak: newStreak, isNewDay: false };
    }
    const yesterday = /* @__PURE__ */ new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    if (lastPlayed === yesterdayStr) {
      newStreak += 1;
      isNewDay = true;
    } else {
      newStreak = 1;
      isNewDay = true;
    }
    const longestStreak = Math.max(newStreak, profile.longest_streak || 0);
    await db.prepare(`
        UPDATE profiles
        SET current_streak = ?, longest_streak = ?, last_played_date = ?
        WHERE user_id = ?
      `).bind(newStreak, longestStreak, today, userId).run();
    return { currentStreak: newStreak, isNewDay };
  } catch (error) {
    console.log("[Leaderboard] Streak columns not available, skipping streak update");
    return { currentStreak: 0, isNewDay: false };
  }
}
__name(updateStreak, "updateStreak");
async function getUserHighScore(db, userId, gameId) {
  const result = await db.prepare(
    "SELECT MAX(score) as high_score FROM leaderboard_scores WHERE user_id = ? AND game_id = ?"
  ).bind(userId, gameId).first();
  return result?.high_score ?? null;
}
__name(getUserHighScore, "getUserHighScore");
async function insertScore(db, userId, data) {
  const result = await db.prepare(
    `INSERT INTO leaderboard_scores (user_id, game_id, score, level, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       RETURNING id`
  ).bind(
    userId,
    data.gameId,
    data.score,
    data.level ?? null,
    data.metadata ? JSON.stringify(data.metadata) : null
  ).first();
  return result?.id ?? 0;
}
__name(insertScore, "insertScore");
async function getScoreRank(db, gameId, score) {
  const result = await db.prepare(
    `SELECT COUNT(*) + 1 as rank FROM leaderboard_scores
       WHERE game_id = ? AND score > ?`
  ).bind(gameId, score).first();
  return result?.rank ?? 1;
}
__name(getScoreRank, "getScoreRank");
function validateRequest(data) {
  if (!data.gameId) {
    return { valid: false, error: "gameId is required" };
  }
  if (!VALID_GAME_IDS.includes(data.gameId)) {
    return { valid: false, error: "Invalid gameId" };
  }
  if (typeof data.score !== "number" || isNaN(data.score)) {
    return { valid: false, error: "score must be a number" };
  }
  if (data.score < 0) {
    return { valid: false, error: "score must be non-negative" };
  }
  if (data.level !== void 0 && (typeof data.level !== "number" || data.level < 0)) {
    return { valid: false, error: "level must be a non-negative number" };
  }
  return { valid: true };
}
__name(validateRequest, "validateRequest");
var onRequest3 = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders3 });
  }
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders3 }
    );
  }
  if (!env.CLERK_DOMAIN) {
    return new Response(
      JSON.stringify({ error: "Auth not configured" }),
      { status: 500, headers: corsHeaders3 }
    );
  }
  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: "Database not configured" }),
      { status: 500, headers: corsHeaders3 }
    );
  }
  const auth = await authenticateRequest(request, env.CLERK_DOMAIN);
  if (!auth) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: corsHeaders3 }
    );
  }
  const { userId } = auth;
  try {
    let data;
    try {
      data = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: corsHeaders3 }
      );
    }
    const validation = validateRequest(data);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: corsHeaders3 }
      );
    }
    await ensureUser(env.DB, userId);
    const previousHighScore = await getUserHighScore(env.DB, userId, data.gameId);
    const scoreId = await insertScore(env.DB, userId, data);
    const rank = await getScoreRank(env.DB, data.gameId, data.score);
    const isNewHighScore = previousHighScore === null || data.score > previousHighScore;
    const streakInfo = await updateStreak(env.DB, userId);
    return new Response(
      JSON.stringify({
        success: true,
        scoreId,
        rank,
        isNewHighScore,
        previousHighScore,
        currentStreak: streakInfo.currentStreak,
        isNewDay: streakInfo.isNewDay
      }),
      { status: 200, headers: corsHeaders3 }
    );
  } catch (error) {
    console.error("[Leaderboard Submit] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders3 }
    );
  }
}, "onRequest");

// api/leaderboard/[gameId].ts
var VALID_GAME_IDS2 = [
  "orange-stack",
  "memory-match",
  "orange-pong",
  "wojak-runner",
  "orange-juggle",
  "orange-slice"
];
var corsHeaders4 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};
async function getLeaderboard(db, gameId, limit, offset) {
  const results = await db.prepare(
    `SELECT
         ls.score,
         ls.level,
         ls.created_at,
         COALESCE(p.display_name, 'Anonymous') as display_name,
         ROW_NUMBER() OVER (ORDER BY ls.score DESC, ls.created_at ASC) as rank
       FROM leaderboard_scores ls
       LEFT JOIN profiles p ON ls.user_id = p.user_id
       WHERE ls.game_id = ?
       ORDER BY ls.score DESC, ls.created_at ASC
       LIMIT ? OFFSET ?`
  ).bind(gameId, limit, offset).all();
  return (results.results || []).map((row) => ({
    rank: row.rank,
    displayName: row.display_name,
    score: row.score,
    level: row.level,
    date: row.created_at.split("T")[0]
    // Extract date part
  }));
}
__name(getLeaderboard, "getLeaderboard");
async function getLeaderboardCount(db, gameId) {
  const result = await db.prepare("SELECT COUNT(*) as count FROM leaderboard_scores WHERE game_id = ?").bind(gameId).first();
  return result?.count ?? 0;
}
__name(getLeaderboardCount, "getLeaderboardCount");
var onRequest4 = /* @__PURE__ */ __name(async (context) => {
  const { request, env, params } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders4 });
  }
  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders4 }
    );
  }
  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: "Database not configured" }),
      { status: 500, headers: corsHeaders4 }
    );
  }
  const gameId = params.gameId;
  if (!gameId || !VALID_GAME_IDS2.includes(gameId)) {
    return new Response(
      JSON.stringify({ error: "Invalid gameId" }),
      { status: 400, headers: corsHeaders4 }
    );
  }
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");
    let limit = limitParam ? parseInt(limitParam, 10) : 10;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;
    let offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    if (isNaN(offset) || offset < 0) offset = 0;
    const entries = await getLeaderboard(env.DB, gameId, limit, offset);
    const totalCount = await getLeaderboardCount(env.DB, gameId);
    return new Response(
      JSON.stringify({
        gameId,
        entries,
        pagination: {
          limit,
          offset,
          total: totalCount,
          hasMore: offset + entries.length < totalCount
        }
      }),
      { status: 200, headers: corsHeaders4 }
    );
  } catch (error) {
    console.error("[Leaderboard Get] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders4 }
    );
  }
}, "onRequest");

// api/coingecko/[[path]].ts
var onRequest5 = /* @__PURE__ */ __name(async (context) => {
  const { params, request } = context;
  const pathSegments = params.path;
  const path = pathSegments ? pathSegments.join("/") : "";
  const url = new URL(request.url);
  const queryString = url.search;
  const coingeckoUrl = `https://api.coingecko.com/${path}${queryString}`;
  try {
    const response = await fetch(coingeckoUrl, {
      method: request.method,
      headers: {
        "Accept": "application/json",
        "User-Agent": "wojak.ink/1.0"
      }
    });
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=300"
        // Cache for 5 minutes
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch from CoinGecko" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}, "onRequest");
var onRequestOptions3 = /* @__PURE__ */ __name(async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}, "onRequestOptions");

// api/dexie/[[path]].ts
var onRequest6 = /* @__PURE__ */ __name(async (context) => {
  const { params, request } = context;
  const pathSegments = params.path;
  const path = pathSegments ? pathSegments.join("/") : "";
  const url = new URL(request.url);
  const queryString = url.search;
  const dexieUrl = `https://api.dexie.space/${path}${queryString}`;
  try {
    const response = await fetch(dexieUrl, {
      method: request.method,
      headers: {
        "Accept": "application/json",
        "User-Agent": "wojak.ink/1.0"
      }
    });
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=60"
        // Cache for 1 minute
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch from Dexie" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}, "onRequest");
var onRequestOptions4 = /* @__PURE__ */ __name(async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}, "onRequestOptions");

// api/mintgarden/[[path]].ts
var onRequest7 = /* @__PURE__ */ __name(async (context) => {
  const { params, request } = context;
  const pathSegments = params.path;
  const path = pathSegments ? pathSegments.join("/") : "";
  const url = new URL(request.url);
  const queryString = url.search;
  const mintgardenUrl = `https://api.mintgarden.io/${path}${queryString}`;
  try {
    const response = await fetch(mintgardenUrl, {
      method: request.method,
      headers: {
        "Accept": "application/json",
        "User-Agent": "wojak.ink/1.0"
      }
    });
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=60"
        // Cache for 1 minute
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch from MintGarden" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}, "onRequest");
var onRequestOptions5 = /* @__PURE__ */ __name(async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}, "onRequestOptions");

// api/parsebot/[[path]].ts
var onRequest8 = /* @__PURE__ */ __name(async (context) => {
  const { params, request, env } = context;
  const pathSegments = params.path;
  const path = pathSegments ? pathSegments.join("/") : "";
  const parsebotUrl = `https://api.parse.bot/${path}`;
  try {
    let body = null;
    if (request.method === "POST") {
      body = await request.text();
    }
    const response = await fetch(parsebotUrl, {
      method: request.method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "wojak.ink/1.0",
        "x-api-key": env.PARSEBOT_API_KEY || ""
      },
      body
    });
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=60"
        // Cache for 1 minute
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch from Parse.bot" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}, "onRequest");
var onRequestOptions6 = /* @__PURE__ */ __name(async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}, "onRequestOptions");

// api/spacescan/[[path]].ts
var onRequest9 = /* @__PURE__ */ __name(async (context) => {
  const { params } = context;
  const pathSegments = params.path;
  const path = pathSegments ? pathSegments.join("/") : "";
  const spacescanUrl = `https://api.spacescan.io/${path}`;
  try {
    const response = await fetch(spacescanUrl, {
      method: context.request.method,
      headers: {
        "Accept": "application/json",
        "User-Agent": "wojak.ink/1.0"
      }
    });
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=300"
        // Cache for 5 minutes
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch from SpaceScan" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}, "onRequest");
var onRequestOptions7 = /* @__PURE__ */ __name(async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}, "onRequestOptions");

// api/messages/index.ts
var corsHeaders5 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};
var onRequest10 = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders5 });
  }
  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders5 }
    );
  }
  if (!env.CLERK_DOMAIN || !env.DB) {
    return new Response(
      JSON.stringify({ error: "Server not configured" }),
      { status: 500, headers: corsHeaders5 }
    );
  }
  const auth = await authenticateRequest(request, env.CLERK_DOMAIN);
  if (!auth) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: corsHeaders5 }
    );
  }
  try {
    const result = await env.DB.prepare(
      `SELECT id, title, content, type, read, created_at
         FROM messages
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 50`
    ).bind(auth.userId).all();
    const messages = result.results || [];
    return new Response(
      JSON.stringify({
        messages: messages.map((m) => ({
          id: m.id,
          title: m.title,
          content: m.content,
          type: m.type,
          read: m.read === 1,
          createdAt: m.created_at
        }))
      }),
      { status: 200, headers: corsHeaders5 }
    );
  } catch (error) {
    console.error("[Messages] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders5 }
    );
  }
}, "onRequest");
var onRequestOptions8 = /* @__PURE__ */ __name(async () => {
  return new Response(null, { headers: corsHeaders5 });
}, "onRequestOptions");

// api/auth-debug.ts
var corsHeaders6 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};
function base64UrlDecode2(input) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
  return atob(padded);
}
__name(base64UrlDecode2, "base64UrlDecode");
var onRequest11 = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders6 });
  }
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "") || null;
  if (!token) {
    return new Response(
      JSON.stringify({
        error: "No token provided",
        clerkDomain: env.CLERK_DOMAIN || "NOT SET"
      }),
      { status: 200, headers: corsHeaders6 }
    );
  }
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return new Response(
        JSON.stringify({ error: "Invalid token format" }),
        { status: 200, headers: corsHeaders6 }
      );
    }
    const header = JSON.parse(base64UrlDecode2(parts[0]));
    const payload = JSON.parse(base64UrlDecode2(parts[1]));
    return new Response(
      JSON.stringify({
        clerkDomain: env.CLERK_DOMAIN || "NOT SET",
        expectedIssuer: `https://${env.CLERK_DOMAIN}`,
        tokenIssuer: payload.iss,
        tokenSubject: payload.sub,
        tokenExpires: new Date(payload.exp * 1e3).toISOString(),
        issuerMatch: payload.iss === `https://${env.CLERK_DOMAIN}`,
        header
      }),
      { status: 200, headers: corsHeaders6 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to decode token",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 200, headers: corsHeaders6 }
    );
  }
}, "onRequest");

// api/me.ts
var corsHeaders7 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};
var onRequest12 = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders7 });
  }
  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders7 }
    );
  }
  if (!env.CLERK_DOMAIN) {
    return new Response(
      JSON.stringify({ error: "Auth not configured" }),
      { status: 500, headers: corsHeaders7 }
    );
  }
  const auth = await authenticateRequest(request, env.CLERK_DOMAIN);
  if (!auth) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: corsHeaders7 }
    );
  }
  return new Response(
    JSON.stringify({
      userId: auth.userId
      // Include additional claims if needed
      // email: auth.payload.email,
    }),
    { status: 200, headers: corsHeaders7 }
  );
}, "onRequest");

// api/profile.ts
var corsHeaders8 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};
async function ensureUser2(db, userId) {
  await db.prepare(
    `INSERT INTO users (id, created_at, updated_at)
       VALUES (?, datetime('now'), datetime('now'))
       ON CONFLICT(id) DO UPDATE SET updated_at = datetime('now')`
  ).bind(userId).run();
}
__name(ensureUser2, "ensureUser");
async function getProfile(db, userId) {
  try {
    const result = await db.prepare(`SELECT
        display_name,
        x_handle,
        wallet_address,
        current_streak,
        longest_streak,
        last_played_date,
        updated_at
      FROM profiles WHERE user_id = ?`).bind(userId).first();
    return result;
  } catch (error) {
    console.log("[Profile] Falling back to query without streak columns");
    const result = await db.prepare(`SELECT
        display_name,
        x_handle,
        wallet_address,
        updated_at
      FROM profiles WHERE user_id = ?`).bind(userId).first();
    return result ? {
      ...result,
      current_streak: null,
      longest_streak: null,
      last_played_date: null
    } : null;
  }
}
__name(getProfile, "getProfile");
function validateProfileData(data) {
  if (data.displayName !== void 0 && data.displayName !== null && data.displayName !== "") {
    if (data.displayName.length < 3 || data.displayName.length > 20) {
      return { valid: false, error: "Display name must be 3-20 characters" };
    }
  }
  if (data.xHandle !== void 0 && data.xHandle !== null && data.xHandle !== "") {
    const handle = data.xHandle.replace(/^@/, "");
    if (!/^[a-zA-Z0-9_]{1,15}$/.test(handle)) {
      return { valid: false, error: "X handle must be 1-15 alphanumeric characters or underscores" };
    }
    data.xHandle = handle;
  }
  if (data.walletAddress !== void 0 && data.walletAddress !== null && data.walletAddress !== "") {
    const wallet = data.walletAddress.trim().toLowerCase();
    if (!wallet.startsWith("xch") || wallet.length !== 62) {
      return { valid: false, error: "Wallet address must be a valid Chia address (xch...)" };
    }
    data.walletAddress = wallet;
  }
  return { valid: true };
}
__name(validateProfileData, "validateProfileData");
async function upsertProfile(db, userId, data) {
  await db.prepare(
    `INSERT INTO profiles (user_id, display_name, x_handle, wallet_address, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         display_name = COALESCE(?, display_name),
         x_handle = COALESCE(?, x_handle),
         wallet_address = COALESCE(?, wallet_address),
         updated_at = datetime('now')`
  ).bind(
    userId,
    data.displayName || null,
    data.xHandle || null,
    data.walletAddress || null,
    data.displayName !== void 0 ? data.displayName || null : null,
    data.xHandle !== void 0 ? data.xHandle || null : null,
    data.walletAddress !== void 0 ? data.walletAddress || null : null
  ).run();
}
__name(upsertProfile, "upsertProfile");
var onRequest13 = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders8 });
  }
  if (!env.CLERK_DOMAIN) {
    return new Response(
      JSON.stringify({ error: "Auth not configured" }),
      { status: 500, headers: corsHeaders8 }
    );
  }
  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: "Database not configured" }),
      { status: 500, headers: corsHeaders8 }
    );
  }
  const auth = await authenticateRequest(request, env.CLERK_DOMAIN);
  if (!auth) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: corsHeaders8 }
    );
  }
  const { userId } = auth;
  try {
    await ensureUser2(env.DB, userId);
    if (request.method === "GET") {
      const profile = await getProfile(env.DB, userId);
      return new Response(
        JSON.stringify({
          userId,
          profile: profile ? {
            displayName: profile.display_name,
            xHandle: profile.x_handle,
            walletAddress: profile.wallet_address,
            currentStreak: profile.current_streak || 0,
            longestStreak: profile.longest_streak || 0,
            lastPlayedDate: profile.last_played_date,
            updatedAt: profile.updated_at
          } : null
        }),
        { status: 200, headers: corsHeaders8 }
      );
    }
    if (request.method === "POST") {
      let data;
      try {
        data = await request.json();
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid JSON" }),
          { status: 400, headers: corsHeaders8 }
        );
      }
      const validation = validateProfileData(data);
      if (!validation.valid) {
        return new Response(
          JSON.stringify({ error: validation.error }),
          { status: 400, headers: corsHeaders8 }
        );
      }
      await upsertProfile(env.DB, userId, data);
      const profile = await getProfile(env.DB, userId);
      return new Response(
        JSON.stringify({
          success: true,
          profile: profile ? {
            displayName: profile.display_name,
            xHandle: profile.x_handle,
            walletAddress: profile.wallet_address,
            updatedAt: profile.updated_at
          } : null
        }),
        { status: 200, headers: corsHeaders8 }
      );
    }
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders8 }
    );
  } catch (error) {
    console.error("[Profile] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders8 }
    );
  }
}, "onRequest");

// api/trade-values.ts
var corsHeaders9 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};
var onRequest14 = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders9 });
  }
  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders9 }
    );
  }
  try {
    const data = await env.SALES_INDEX_KV.get("trade_values_data", "json");
    if (!data) {
      return new Response(
        JSON.stringify({
          error: "No data available yet. Data is being fetched.",
          trait_stats: [],
          all_sales: [],
          total_sales_count: 0,
          last_updated: null
        }),
        { status: 200, headers: corsHeaders9 }
      );
    }
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const includeSales = url.searchParams.get("include_sales") === "true";
    const traitName = url.searchParams.get("trait");
    if (traitName) {
      const decodedTrait = decodeURIComponent(traitName);
      const traitSales = data.all_sales.filter(
        (sale) => Object.values(sale.traits).some(
          (t) => t.toLowerCase() === decodedTrait.toLowerCase()
        )
      );
      traitSales.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return new Response(
        JSON.stringify({
          trait_name: decodedTrait,
          sales: traitSales.slice(0, 20),
          total_sales: traitSales.length
        }),
        { status: 200, headers: corsHeaders9 }
      );
    }
    let responseData = {
      trait_stats: data.trait_stats,
      total_sales_count: data.total_sales_count,
      last_updated: data.last_updated
    };
    if (category && category !== "all") {
      responseData.trait_stats = data.trait_stats.filter(
        (t) => t.trait_category.toLowerCase() === category.toLowerCase()
      );
    }
    if (includeSales) {
      responseData.all_sales = data.all_sales;
    }
    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          ...corsHeaders9,
          "Cache-Control": "public, max-age=60"
        }
      }
    );
  } catch (error) {
    console.error("Error fetching trade values:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders9 }
    );
  }
}, "onRequest");

// ../.wrangler/tmp/pages-gG1ta0/functionsRoutes-0.5028800911278453.mjs
var routes = [
  {
    routePath: "/api/messages/:id/read",
    mountPath: "/api/messages/:id",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/messages/:id/read",
    mountPath: "/api/messages/:id",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/messages/unread-count",
    mountPath: "/api/messages",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
  },
  {
    routePath: "/api/leaderboard/submit",
    mountPath: "/api/leaderboard",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/api/messages/unread-count",
    mountPath: "/api/messages",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/leaderboard/:gameId",
    mountPath: "/api/leaderboard",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/coingecko/:path*",
    mountPath: "/api/coingecko",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions3]
  },
  {
    routePath: "/api/dexie/:path*",
    mountPath: "/api/dexie",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions4]
  },
  {
    routePath: "/api/mintgarden/:path*",
    mountPath: "/api/mintgarden",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions5]
  },
  {
    routePath: "/api/parsebot/:path*",
    mountPath: "/api/parsebot",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions6]
  },
  {
    routePath: "/api/spacescan/:path*",
    mountPath: "/api/spacescan",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions7]
  },
  {
    routePath: "/api/coingecko/:path*",
    mountPath: "/api/coingecko",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  },
  {
    routePath: "/api/dexie/:path*",
    mountPath: "/api/dexie",
    method: "",
    middlewares: [],
    modules: [onRequest6]
  },
  {
    routePath: "/api/mintgarden/:path*",
    mountPath: "/api/mintgarden",
    method: "",
    middlewares: [],
    modules: [onRequest7]
  },
  {
    routePath: "/api/parsebot/:path*",
    mountPath: "/api/parsebot",
    method: "",
    middlewares: [],
    modules: [onRequest8]
  },
  {
    routePath: "/api/spacescan/:path*",
    mountPath: "/api/spacescan",
    method: "",
    middlewares: [],
    modules: [onRequest9]
  },
  {
    routePath: "/api/messages",
    mountPath: "/api/messages",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions8]
  },
  {
    routePath: "/api/auth-debug",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest11]
  },
  {
    routePath: "/api/me",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest12]
  },
  {
    routePath: "/api/messages",
    mountPath: "/api/messages",
    method: "",
    middlewares: [],
    modules: [onRequest10]
  },
  {
    routePath: "/api/profile",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest13]
  },
  {
    routePath: "/api/trade-values",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest14]
  }
];

// ../../../.npm/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-mGotxL/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-mGotxL/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.08832837505300006.mjs.map
