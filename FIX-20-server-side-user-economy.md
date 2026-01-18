# FIX-20: Server-Side User Economy System

## Overview

Migrate user economy (currency, purchases, inventory) from localStorage to D1 database with proper authentication. This ensures data persistence, security, and prevents client-side manipulation.

**Priority**: CRITICAL
**Complexity**: High
**Dependencies**: Clerk authentication (already configured), D1 database (already set up)

---

## Current State (PROBLEMS)

### What's Working
- Clerk authentication with Google OAuth
- D1 database with users, profiles, leaderboard_scores, messages tables
- JWT verification in API routes

### What's BROKEN (localStorage = NOT PRODUCTION READY)
```typescript
// CURRENT BAD CODE - Easy to hack via browser console
const CURRENCY_KEY = `wojak_currency_${userId}`;
localStorage.setItem(CURRENCY_KEY, JSON.stringify({ oranges: 999999 })); // User can cheat!
```

**Files with localStorage currency:**
- `src/contexts/CurrencyContext.tsx` - Stores balances in localStorage
- `src/hooks/useFlickVoting.ts` - Vote balances may use localStorage
- Shop purchase logic - Not persisted to server

---

## Architecture Design

### Golden Rules
1. **Server = Source of Truth** - Client NEVER stores authoritative balances
2. **All Mutations via API** - No direct localStorage writes for currency
3. **Atomic Transactions** - Use D1 batch for multi-step operations
4. **Audit Trail** - Every transaction logged for debugging/compliance

### Data Flow
```
User Action → API Request (with JWT) → Verify Auth → D1 Transaction → Response → UI Update
```

---

## Phase 1: Database Migration

### File: `functions/migrations/0006_user_economy.sql`

```sql
-- ===========================================
-- USER ECONOMY TABLES
-- Migration: 0006_user_economy.sql
-- ===========================================

-- User currency balances (single row per user)
CREATE TABLE IF NOT EXISTS user_currency (
  user_id TEXT PRIMARY KEY,
  oranges INTEGER NOT NULL DEFAULT 100,
  gems INTEGER NOT NULL DEFAULT 0,
  donut_votes INTEGER NOT NULL DEFAULT 50,
  poop_votes INTEGER NOT NULL DEFAULT 25,
  lifetime_oranges INTEGER NOT NULL DEFAULT 100,
  lifetime_gems INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transaction history (immutable audit log)
CREATE TABLE IF NOT EXISTS currency_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'purchase', 'refund', 'admin', 'daily_bonus', 'game_reward', 'vote_refill')),
  currency TEXT NOT NULL CHECK (currency IN ('oranges', 'gems', 'donut_votes', 'poop_votes')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  source TEXT NOT NULL,
  reference_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User inventory (owned items)
CREATE TABLE IF NOT EXISTS user_inventory (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_category TEXT NOT NULL CHECK (item_category IN ('voting_emoji', 'game_skin', 'profile_badge', 'profile_frame', 'generator_style', 'consumable')),
  quantity INTEGER NOT NULL DEFAULT 1,
  equipped BOOLEAN NOT NULL DEFAULT FALSE,
  acquired_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,
  UNIQUE(user_id, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Shop purchase history
CREATE TABLE IF NOT EXISTS shop_purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_category TEXT NOT NULL,
  price_oranges INTEGER NOT NULL DEFAULT 0,
  price_gems INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  purchased_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_currency_transactions_user ON currency_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_created ON currency_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_category ON user_inventory(item_category);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_user ON shop_purchases(user_id);
```

### Run Migration
```bash
npx wrangler d1 execute wojak-users --file=./functions/migrations/0006_user_economy.sql
```

---

## Phase 2: API Endpoints

### File: `functions/api/currency.ts`

```typescript
/**
 * Currency API Endpoints
 *
 * GET /api/currency - Get user's current balances
 * POST /api/currency/earn - Add currency (game rewards, daily bonus)
 * POST /api/currency/spend - Deduct currency (internal use)
 */

import { verifyClerkJWT, getUserIdFromJWT } from '../lib/auth';

interface Env {
  DB: D1Database;
}

interface CurrencyBalance {
  oranges: number;
  gems: number;
  donut_votes: number;
  poop_votes: number;
  lifetime_oranges: number;
  lifetime_gems: number;
}

// GET /api/currency
export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  try {
    // Verify JWT and get user ID
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.slice(7);
    const payload = await verifyClerkJWT(token, env);
    const userId = payload.sub;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get or create currency record
    let currency = await env.DB.prepare(
      'SELECT oranges, gems, donut_votes, poop_votes, lifetime_oranges, lifetime_gems FROM user_currency WHERE user_id = ?'
    ).bind(userId).first<CurrencyBalance>();

    if (!currency) {
      // Create default currency for new user
      await env.DB.prepare(`
        INSERT INTO user_currency (user_id, oranges, gems, donut_votes, poop_votes, lifetime_oranges, lifetime_gems)
        VALUES (?, 100, 0, 50, 25, 100, 0)
      `).bind(userId).run();

      currency = {
        oranges: 100,
        gems: 0,
        donut_votes: 50,
        poop_votes: 25,
        lifetime_oranges: 100,
        lifetime_gems: 0
      };

      // Log initial grant
      await env.DB.prepare(`
        INSERT INTO currency_transactions (id, user_id, transaction_type, currency, amount, balance_after, source)
        VALUES (?, ?, 'admin', 'oranges', 100, 100, 'new_user_grant')
      `).bind(crypto.randomUUID(), userId).run();
    }

    return new Response(JSON.stringify({
      success: true,
      data: currency
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Currency fetch error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST /api/currency/earn
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.slice(7);
    const payload = await verifyClerkJWT(token, env);
    const userId = payload.sub;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json() as {
      currency: 'oranges' | 'gems' | 'donut_votes' | 'poop_votes';
      amount: number;
      source: string;
      reference_id?: string;
    };

    const { currency, amount, source, reference_id } = body;

    // Validate input
    if (!['oranges', 'gems', 'donut_votes', 'poop_votes'].includes(currency)) {
      return new Response(JSON.stringify({ error: 'Invalid currency type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (typeof amount !== 'number' || amount <= 0 || amount > 10000) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate source (prevent arbitrary earning)
    const validSources = ['game_reward', 'daily_bonus', 'achievement', 'referral', 'vote_refill'];
    if (!validSources.includes(source)) {
      return new Response(JSON.stringify({ error: 'Invalid source' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get current balance
    const current = await env.DB.prepare(
      `SELECT ${currency} as balance FROM user_currency WHERE user_id = ?`
    ).bind(userId).first<{ balance: number }>();

    if (!current) {
      return new Response(JSON.stringify({ error: 'User currency not initialized' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const newBalance = current.balance + amount;
    const transactionId = crypto.randomUUID();

    // Atomic update with transaction log
    const lifetimeColumn = currency === 'oranges' ? 'lifetime_oranges' :
                          currency === 'gems' ? 'lifetime_gems' : null;

    const statements = [
      env.DB.prepare(`
        UPDATE user_currency
        SET ${currency} = ?, updated_at = datetime('now')
        ${lifetimeColumn ? `, ${lifetimeColumn} = ${lifetimeColumn} + ?` : ''}
        WHERE user_id = ?
      `).bind(newBalance, ...(lifetimeColumn ? [amount] : []), userId),

      env.DB.prepare(`
        INSERT INTO currency_transactions (id, user_id, transaction_type, currency, amount, balance_after, source, reference_id)
        VALUES (?, ?, 'earn', ?, ?, ?, ?, ?)
      `).bind(transactionId, userId, currency, amount, newBalance, source, reference_id || null)
    ];

    await env.DB.batch(statements);

    return new Response(JSON.stringify({
      success: true,
      data: {
        currency,
        amount,
        new_balance: newBalance,
        transaction_id: transactionId
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Currency earn error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### File: `functions/api/shop/purchase.ts`

```typescript
/**
 * Shop Purchase API
 *
 * POST /api/shop/purchase - Buy an item from the shop
 */

import { verifyClerkJWT } from '../../lib/auth';

interface Env {
  DB: D1Database;
}

// Shop item definitions (could also be in database)
const SHOP_ITEMS: Record<string, {
  name: string;
  category: string;
  price_oranges: number;
  price_gems: number;
  max_quantity?: number;
}> = {
  'vote_donut_pack_10': {
    name: '10 Donut Votes',
    category: 'voting_emoji',
    price_oranges: 50,
    price_gems: 0,
  },
  'vote_donut_pack_50': {
    name: '50 Donut Votes',
    category: 'voting_emoji',
    price_oranges: 200,
    price_gems: 0,
  },
  'vote_poop_pack_10': {
    name: '10 Poop Votes',
    category: 'voting_emoji',
    price_oranges: 50,
    price_gems: 0,
  },
  'vote_poop_pack_50': {
    name: '50 Poop Votes',
    category: 'voting_emoji',
    price_oranges: 200,
    price_gems: 0,
  },
  'premium_wojak_styles': {
    name: 'Premium Wojak Styles',
    category: 'generator_style',
    price_oranges: 0,
    price_gems: 10,
    max_quantity: 1,
  },
  'golden_frame': {
    name: 'Golden Profile Frame',
    category: 'profile_frame',
    price_oranges: 500,
    price_gems: 0,
    max_quantity: 1,
  },
  'diamond_frame': {
    name: 'Diamond Profile Frame',
    category: 'profile_frame',
    price_oranges: 0,
    price_gems: 25,
    max_quantity: 1,
  },
};

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.slice(7);
    const payload = await verifyClerkJWT(token, env);
    const userId = payload.sub;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json() as {
      item_id: string;
      quantity?: number;
    };

    const { item_id, quantity = 1 } = body;

    // Validate item exists
    const item = SHOP_ITEMS[item_id];
    if (!item) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check max quantity for limited items
    if (item.max_quantity) {
      const owned = await env.DB.prepare(
        'SELECT quantity FROM user_inventory WHERE user_id = ? AND item_id = ?'
      ).bind(userId, item_id).first<{ quantity: number }>();

      if (owned && owned.quantity >= item.max_quantity) {
        return new Response(JSON.stringify({ error: 'You already own this item' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Calculate total cost
    const totalOranges = item.price_oranges * quantity;
    const totalGems = item.price_gems * quantity;

    // Get current balances
    const currency = await env.DB.prepare(
      'SELECT oranges, gems, donut_votes, poop_votes FROM user_currency WHERE user_id = ?'
    ).bind(userId).first<{ oranges: number; gems: number; donut_votes: number; poop_votes: number }>();

    if (!currency) {
      return new Response(JSON.stringify({ error: 'Currency not initialized' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check sufficient funds
    if (currency.oranges < totalOranges) {
      return new Response(JSON.stringify({
        error: 'Insufficient oranges',
        required: totalOranges,
        have: currency.oranges
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (currency.gems < totalGems) {
      return new Response(JSON.stringify({
        error: 'Insufficient gems',
        required: totalGems,
        have: currency.gems
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Process purchase atomically
    const purchaseId = crypto.randomUUID();
    const newOranges = currency.oranges - totalOranges;
    const newGems = currency.gems - totalGems;

    const statements = [];

    // Deduct currency
    statements.push(
      env.DB.prepare(`
        UPDATE user_currency
        SET oranges = ?, gems = ?, updated_at = datetime('now')
        WHERE user_id = ?
      `).bind(newOranges, newGems, userId)
    );

    // Log transaction(s)
    if (totalOranges > 0) {
      statements.push(
        env.DB.prepare(`
          INSERT INTO currency_transactions (id, user_id, transaction_type, currency, amount, balance_after, source, reference_id)
          VALUES (?, ?, 'purchase', 'oranges', ?, ?, 'shop', ?)
        `).bind(crypto.randomUUID(), userId, -totalOranges, newOranges, purchaseId)
      );
    }

    if (totalGems > 0) {
      statements.push(
        env.DB.prepare(`
          INSERT INTO currency_transactions (id, user_id, transaction_type, currency, amount, balance_after, source, reference_id)
          VALUES (?, ?, 'purchase', 'gems', ?, ?, 'shop', ?)
        `).bind(crypto.randomUUID(), userId, -totalGems, newGems, purchaseId)
      );
    }

    // Add to inventory or update votes
    if (item.category === 'voting_emoji') {
      // Vote packs add to balance directly
      const voteType = item_id.includes('donut') ? 'donut_votes' : 'poop_votes';
      const voteAmount = item_id.includes('_10') ? 10 : 50;
      const newVoteBalance = currency[voteType as keyof typeof currency] + (voteAmount * quantity);

      statements.push(
        env.DB.prepare(`
          UPDATE user_currency SET ${voteType} = ? WHERE user_id = ?
        `).bind(newVoteBalance, userId)
      );

      statements.push(
        env.DB.prepare(`
          INSERT INTO currency_transactions (id, user_id, transaction_type, currency, amount, balance_after, source, reference_id)
          VALUES (?, ?, 'vote_refill', ?, ?, ?, 'shop', ?)
        `).bind(crypto.randomUUID(), userId, voteType, voteAmount * quantity, newVoteBalance, purchaseId)
      );
    } else {
      // Add to inventory
      statements.push(
        env.DB.prepare(`
          INSERT INTO user_inventory (id, user_id, item_id, item_category, quantity)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(user_id, item_id) DO UPDATE SET quantity = quantity + ?
        `).bind(crypto.randomUUID(), userId, item_id, item.category, quantity, quantity)
      );
    }

    // Log purchase
    statements.push(
      env.DB.prepare(`
        INSERT INTO shop_purchases (id, user_id, item_id, item_name, item_category, price_oranges, price_gems, quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(purchaseId, userId, item_id, item.name, item.category, totalOranges, totalGems, quantity)
    );

    await env.DB.batch(statements);

    // Fetch updated balances
    const updated = await env.DB.prepare(
      'SELECT oranges, gems, donut_votes, poop_votes FROM user_currency WHERE user_id = ?'
    ).bind(userId).first();

    return new Response(JSON.stringify({
      success: true,
      data: {
        purchase_id: purchaseId,
        item: item.name,
        quantity,
        spent: { oranges: totalOranges, gems: totalGems },
        new_balance: updated
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Shop purchase error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### File: `functions/api/inventory.ts`

```typescript
/**
 * Inventory API
 *
 * GET /api/inventory - Get user's owned items
 * POST /api/inventory/equip - Equip/unequip an item
 */

import { verifyClerkJWT } from '../lib/auth';

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.slice(7);
    const payload = await verifyClerkJWT(token, env);
    const userId = payload.sub;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const inventory = await env.DB.prepare(`
      SELECT item_id, item_category, quantity, equipped, acquired_at, expires_at
      FROM user_inventory
      WHERE user_id = ?
      ORDER BY acquired_at DESC
    `).bind(userId).all();

    return new Response(JSON.stringify({
      success: true,
      data: inventory.results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Inventory fetch error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

---

## Phase 3: Frontend Migration

### File: `src/contexts/CurrencyContext.tsx` (REPLACE ENTIRELY)

```typescript
/**
 * Currency Context - Server-Side Version
 *
 * Fetches currency from API, never stores balances locally.
 * All mutations go through authenticated API calls.
 */

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';

interface CurrencyBalance {
  oranges: number;
  gems: number;
  donut_votes: number;
  poop_votes: number;
  lifetime_oranges: number;
  lifetime_gems: number;
}

interface CurrencyContextType {
  // Balances
  oranges: number;
  gems: number;
  donutVotes: number;
  poopVotes: number;
  lifetimeOranges: number;
  lifetimeGems: number;

  // State
  isLoading: boolean;
  isError: boolean;

  // Actions
  earnCurrency: (currency: 'oranges' | 'gems', amount: number, source: string, referenceId?: string) => Promise<void>;
  spendVote: (type: 'donut' | 'poop') => Promise<boolean>;
  refetch: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  // Fetch currency from server
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['currency'],
    queryFn: async (): Promise<CurrencyBalance> => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/currency', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch currency');
      }

      const result = await response.json();
      return result.data;
    },
    enabled: isSignedIn,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
  });

  // Earn currency mutation
  const earnMutation = useMutation({
    mutationFn: async (params: {
      currency: 'oranges' | 'gems';
      amount: number;
      source: string;
      reference_id?: string;
    }) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/currency/earn', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to earn currency');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currency'] });
    }
  });

  // Spend vote mutation (for voting system)
  const spendVoteMutation = useMutation({
    mutationFn: async (type: 'donut' | 'poop') => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/currency/spend-vote', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vote_type: type })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to spend vote');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currency'] });
    }
  });

  const earnCurrency = useCallback(async (
    currency: 'oranges' | 'gems',
    amount: number,
    source: string,
    referenceId?: string
  ) => {
    await earnMutation.mutateAsync({ currency, amount, source, reference_id: referenceId });
  }, [earnMutation]);

  const spendVote = useCallback(async (type: 'donut' | 'poop'): Promise<boolean> => {
    try {
      await spendVoteMutation.mutateAsync(type);
      return true;
    } catch {
      return false;
    }
  }, [spendVoteMutation]);

  // Default values when not signed in or loading
  const defaults: CurrencyBalance = {
    oranges: 0,
    gems: 0,
    donut_votes: 0,
    poop_votes: 0,
    lifetime_oranges: 0,
    lifetime_gems: 0
  };

  const balance = data || defaults;

  return (
    <CurrencyContext.Provider value={{
      oranges: balance.oranges,
      gems: balance.gems,
      donutVotes: balance.donut_votes,
      poopVotes: balance.poop_votes,
      lifetimeOranges: balance.lifetime_oranges,
      lifetimeGems: balance.lifetime_gems,
      isLoading,
      isError,
      earnCurrency,
      spendVote,
      refetch,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
```

### File: `functions/api/currency/spend-vote.ts`

```typescript
/**
 * Spend Vote API
 *
 * POST /api/currency/spend-vote - Deduct one vote when user flicks emoji
 */

import { verifyClerkJWT } from '../../lib/auth';

interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.slice(7);
    const payload = await verifyClerkJWT(token, env);
    const userId = payload.sub;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json() as { vote_type: 'donut' | 'poop' };
    const { vote_type } = body;

    if (!['donut', 'poop'].includes(vote_type)) {
      return new Response(JSON.stringify({ error: 'Invalid vote type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const column = vote_type === 'donut' ? 'donut_votes' : 'poop_votes';

    // Check current balance
    const current = await env.DB.prepare(
      `SELECT ${column} as balance FROM user_currency WHERE user_id = ?`
    ).bind(userId).first<{ balance: number }>();

    if (!current || current.balance <= 0) {
      return new Response(JSON.stringify({
        error: 'No votes remaining',
        balance: current?.balance || 0
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const newBalance = current.balance - 1;

    // Deduct vote
    await env.DB.batch([
      env.DB.prepare(`
        UPDATE user_currency SET ${column} = ?, updated_at = datetime('now') WHERE user_id = ?
      `).bind(newBalance, userId),

      env.DB.prepare(`
        INSERT INTO currency_transactions (id, user_id, transaction_type, currency, amount, balance_after, source)
        VALUES (?, ?, 'spend', ?, -1, ?, 'voting')
      `).bind(crypto.randomUUID(), userId, column, newBalance)
    ]);

    return new Response(JSON.stringify({
      success: true,
      data: {
        vote_type,
        new_balance: newBalance
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Spend vote error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

---

## Phase 4: Update GamesHub to Use Server Currency

### File: `src/pages/GamesHub.tsx` (MODIFICATIONS)

Replace local state with CurrencyContext:

```typescript
// REMOVE these lines:
// const [donutBalance, setDonutBalance] = useState(100);
// const [poopBalance, setPoopBalance] = useState(50);

// ADD this import:
import { useCurrency } from '@/contexts/CurrencyContext';

// Inside the component, ADD:
const { donutVotes, poopVotes, spendVote, isLoading: isCurrencyLoading } = useCurrency();

// UPDATE handleCardFlick to use server balance check:
const handleCardFlick = useCallback(async (
  gameId: string,
  clickX: number,
  clickY: number,
  cardRect: DOMRect
) => {
  if (!activeMode || flickState.flyingEmoji) return;

  // Check server balance
  const balance = activeMode === 'donut' ? donutVotes : poopVotes;
  if (balance <= 0) return;

  const startPos = getTogglePosition();
  const xPercent = ((clickX - cardRect.left) / cardRect.width) * 100;
  const yPercent = ((clickY - cardRect.top) / cardRect.height) * 100;

  SoundManager.play('vote-whoosh');

  setFlickState({
    flyingEmoji: {
      type: activeMode,
      start: startPos,
      end: { x: clickX, y: clickY },
      targetId: gameId,
      xPercent,
      yPercent,
    },
    splatter: null,
  });
}, [activeMode, flickState.flyingEmoji, getTogglePosition, donutVotes, poopVotes]);

// UPDATE handleEmojiLand to call server:
const handleEmojiLand = useCallback(async () => {
  if (!flickState.flyingEmoji) return;

  const { type, end, targetId, xPercent, yPercent } = flickState.flyingEmoji;

  // Spend vote on server (optimistic UI already shown)
  const success = await spendVote(type);

  if (!success) {
    // Revert animation if server rejected
    setFlickState({ flyingEmoji: null, splatter: null });
    return;
  }

  SoundManager.play(type === 'donut' ? 'vote-splat' : 'vote-plop');
  addVote(targetId, type, xPercent, yPercent);

  // ... rest of existing code
}, [flickState.flyingEmoji, addVote, spendVote]);

// UPDATE FlickModeToggle props:
<FlickModeToggle
  ref={toggleRef}
  activeMode={activeMode}
  onModeChange={setActiveMode}
  donutBalance={donutVotes}  // From server
  poopBalance={poopVotes}    // From server
  // ... rest unchanged
/>
```

---

## Phase 5: Shop Integration

### File: `src/hooks/useShop.ts` (NEW)

```typescript
/**
 * Shop Hook
 *
 * Handles shop purchases with server API
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';

interface PurchaseResult {
  success: boolean;
  purchase_id: string;
  item: string;
  quantity: number;
  spent: { oranges: number; gems: number };
  new_balance: {
    oranges: number;
    gems: number;
    donut_votes: number;
    poop_votes: number;
  };
}

export function useShop() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const purchaseMutation = useMutation({
    mutationFn: async (params: { item_id: string; quantity?: number }): Promise<PurchaseResult> => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Purchase failed');
      }

      return result.data;
    },
    onSuccess: () => {
      // Refresh currency and inventory
      queryClient.invalidateQueries({ queryKey: ['currency'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  return {
    purchase: purchaseMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    purchaseError: purchaseMutation.error?.message,
  };
}
```

---

## Testing Checklist

### Database
- [ ] Run migration 0006_user_economy.sql
- [ ] Verify tables created: user_currency, currency_transactions, user_inventory, shop_purchases
- [ ] Test foreign key constraints

### API Endpoints
- [ ] GET /api/currency returns balances (or creates default for new user)
- [ ] POST /api/currency/earn adds currency with transaction log
- [ ] POST /api/currency/spend-vote deducts vote balance
- [ ] POST /api/shop/purchase processes purchase atomically

### Frontend
- [ ] CurrencyContext fetches from server
- [ ] Balances update after actions
- [ ] Voting deducts from server balance
- [ ] Shop purchases work end-to-end

### Security
- [ ] All endpoints require valid JWT
- [ ] Cannot earn with invalid source
- [ ] Cannot spend more than balance
- [ ] Cannot buy items without funds

---

## Deployment Steps

1. **Deploy Migration**
   ```bash
   npx wrangler d1 execute wojak-users --file=./functions/migrations/0006_user_economy.sql --remote
   ```

2. **Deploy API Functions**
   ```bash
   npx wrangler pages deploy
   ```

3. **Test on Preview**
   - Create account, verify default currency
   - Play game, verify earning works
   - Buy shop item, verify deduction

4. **Deploy Frontend**
   ```bash
   npm run build && npx wrangler pages deploy dist
   ```

---

## Future Enhancements

- Daily login bonus (increment streak, award oranges)
- Achievement system (unlock badges, grant currency)
- Referral rewards
- Premium gem purchases (Stripe integration)
- Trading between users
- Guild treasury sharing
