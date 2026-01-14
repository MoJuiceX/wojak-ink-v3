/**
 * Clerk JWT Token Verification for Cloudflare Pages Functions
 *
 * Verifies tokens using Clerk's JWKS endpoint.
 * Caches JWKS keys in memory to reduce fetches.
 */

// In-memory JWKS cache (persists for the life of the worker)
let cachedJwks: { keys: JsonWebKey[] } | null = null;
let jwksCachedAt = 0;
const JWKS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface JWTHeader {
  alg: string;
  typ: string;
  kid: string;
}

interface JWTPayload {
  sub: string; // User ID
  iss: string; // Issuer
  exp: number; // Expiration
  iat: number; // Issued at
  nbf?: number; // Not before
  azp?: string; // Authorized party (client ID)
  [key: string]: unknown;
}

export interface AuthResult {
  userId: string;
  payload: JWTPayload;
}

/**
 * Fetch and cache JWKS from Clerk
 */
async function fetchJwks(clerkDomain: string): Promise<{ keys: JsonWebKey[] }> {
  const now = Date.now();

  // Return cached JWKS if still valid
  if (cachedJwks && (now - jwksCachedAt) < JWKS_CACHE_TTL) {
    return cachedJwks;
  }

  // Construct JWKS URL from Clerk domain
  // Clerk JWKS URL format: https://<your-domain>.clerk.accounts.dev/.well-known/jwks.json
  const jwksUrl = `https://${clerkDomain}/.well-known/jwks.json`;

  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.status}`);
  }

  cachedJwks = await response.json();
  jwksCachedAt = now;

  return cachedJwks!;
}

/**
 * Base64URL decode
 */
function base64UrlDecode(input: string): string {
  // Replace URL-safe chars and pad
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  return atob(padded);
}

/**
 * Decode JWT without verification (to get header/payload)
 */
function decodeJwt(token: string): { header: JWTHeader; payload: JWTPayload; signature: string } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [headerB64, payloadB64, signature] = parts;

  const header = JSON.parse(base64UrlDecode(headerB64)) as JWTHeader;
  const payload = JSON.parse(base64UrlDecode(payloadB64)) as JWTPayload;

  return { header, payload, signature };
}

/**
 * Import a JWK for verification
 */
async function importKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['verify']
  );
}

/**
 * Verify JWT signature
 */
async function verifySignature(
  token: string,
  key: CryptoKey
): Promise<boolean> {
  const parts = token.split('.');
  const signedData = `${parts[0]}.${parts[1]}`;
  const signature = parts[2];

  // Convert base64url signature to ArrayBuffer
  const signatureBytes = Uint8Array.from(
    base64UrlDecode(signature),
    (c) => c.charCodeAt(0)
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(signedData);

  return crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    signatureBytes,
    data
  );
}

/**
 * Verify a Clerk JWT token
 *
 * @param token - The JWT token from Authorization header
 * @param clerkDomain - Your Clerk domain (e.g., "your-app.clerk.accounts.dev")
 * @returns AuthResult with userId and payload, or throws on invalid token
 */
export async function verifyClerkToken(
  token: string,
  clerkDomain: string
): Promise<AuthResult> {
  // Decode token
  const { header, payload } = decodeJwt(token);

  // Validate algorithm
  if (header.alg !== 'RS256') {
    throw new Error('Unsupported algorithm');
  }

  // Validate expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }

  // Validate not before
  if (payload.nbf && payload.nbf > now) {
    throw new Error('Token not yet valid');
  }

  // Validate issuer (should match Clerk domain)
  const expectedIssuer = `https://${clerkDomain}`;
  if (payload.iss !== expectedIssuer) {
    throw new Error('Invalid issuer');
  }

  // Fetch JWKS and find matching key
  const jwks = await fetchJwks(clerkDomain);
  const key = jwks.keys.find((k) => k.kid === header.kid);

  if (!key) {
    // Key not found - might be rotated, clear cache and retry once
    cachedJwks = null;
    const freshJwks = await fetchJwks(clerkDomain);
    const freshKey = freshJwks.keys.find((k) => k.kid === header.kid);

    if (!freshKey) {
      throw new Error('Signing key not found');
    }

    const cryptoKey = await importKey(freshKey);
    const valid = await verifySignature(token, cryptoKey);

    if (!valid) {
      throw new Error('Invalid signature');
    }
  } else {
    const cryptoKey = await importKey(key);
    const valid = await verifySignature(token, cryptoKey);

    if (!valid) {
      throw new Error('Invalid signature');
    }
  }

  // Validate subject exists
  if (!payload.sub) {
    throw new Error('Missing subject claim');
  }

  return {
    userId: payload.sub,
    payload,
  };
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Authenticate a request using Clerk token
 *
 * @param request - The incoming request
 * @param clerkDomain - Your Clerk domain
 * @returns AuthResult or null if not authenticated
 */
export async function authenticateRequest(
  request: Request,
  clerkDomain: string
): Promise<AuthResult | null> {
  const authHeader = request.headers.get('Authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    return null;
  }

  try {
    return await verifyClerkToken(token, clerkDomain);
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}
