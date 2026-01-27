/**
 * Chat JWT Authentication
 *
 * Verifies the short-lived tokens issued by /api/chat/token
 */

import crypto from 'crypto';

export interface ChatTokenPayload {
  userId: string;
  walletAddress: string;
  nftCount: number;
  isAdmin?: boolean;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

/**
 * Base64URL decode
 */
function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  return Buffer.from(padded, 'base64').toString('utf-8');
}

/**
 * Verify HMAC-SHA256 JWT signature
 */
function verifySignature(token: string, secret: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;
  const message = `${header}.${payload}`;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return signature === expectedSignature;
}

/**
 * Verify and decode a chat JWT token
 */
export function verifyChatToken(token: string, secret: string): ChatTokenPayload | null {
  try {
    // Verify signature
    if (!verifySignature(token, secret)) {
      console.error('[Auth] Invalid signature');
      return null;
    }

    // Decode payload
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(base64UrlDecode(parts[1])) as ChatTokenPayload;

    // Validate issuer and audience
    if (payload.iss !== 'wojak.ink' || payload.aud !== 'wojak-chat') {
      console.error('[Auth] Invalid issuer or audience');
      return null;
    }

    // Validate expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.error('[Auth] Token expired');
      return null;
    }

    // Validate required fields
    if (!payload.userId || !payload.walletAddress || typeof payload.nftCount !== 'number') {
      console.error('[Auth] Missing required fields');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[Auth] Token verification error:', error);
    return null;
  }
}
