# Database Patterns (Cloudflare D1)

<!-- Last updated: 2026-01-18 -->
<!-- Source: Consolidated from LEARNINGS.md and CLAUDE.md -->

## Schema Conventions

### User Economy Tables
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- Clerk user_id from JWT sub claim
  ink_balance INTEGER DEFAULT 0,
  donuts INTEGER DEFAULT 0,
  poops INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,            -- 'game_reward', 'vote', 'purchase', etc.
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,        -- 'ink', 'donuts', 'poops'
  source TEXT,                   -- 'emoji_flick', 'pong', etc.
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Timestamps
- Always use TEXT for timestamps (D1/SQLite compatible)
- Default to CURRENT_TIMESTAMP
- Update `updated_at` on modifications

## Query Patterns

### Atomic Operations with batch()
D1 requires batch() for multiple related operations:

```typescript
const results = await env.DB.batch([
  env.DB.prepare('UPDATE users SET ink_balance = ink_balance + ? WHERE id = ?')
    .bind(amount, userId),
  env.DB.prepare('INSERT INTO transactions (user_id, type, amount, currency) VALUES (?, ?, ?, ?)')
    .bind(userId, 'game_reward', amount, 'ink'),
]);
```

### No RETURNING Clause
D1 doesn't support `RETURNING *`. Use separate SELECT:

```typescript
// Wrong
const result = await env.DB.prepare('INSERT INTO users ... RETURNING *').run();

// Correct
await env.DB.prepare('INSERT INTO users ...').run();
const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
```

### Get-or-Create Pattern
```typescript
async function getOrCreateUser(db: D1Database, userId: string) {
  let user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
  if (!user) {
    await db.prepare('INSERT INTO users (id) VALUES (?)').bind(userId).run();
    user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
  }
  return user;
}
```

## Migration Patterns

### File Naming
```
functions/migrations/
├── 001_create_users.sql
├── 002_create_transactions.sql
└── 003_add_voting_tables.sql
```

### Running Migrations
```bash
# Local development
npx wrangler d1 execute wojak-users --local --file=./functions/migrations/XXX.sql

# Production
npx wrangler d1 execute wojak-users --file=./functions/migrations/XXX.sql
```

### Migration Content
```sql
-- 001_create_users.sql
-- Description: Create users table for economy system
-- Date: 2026-01-18

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  ink_balance INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Always use IF NOT EXISTS for safety
-- Include description comment at top
```

## Caching Strategy

| Data | Cache Location | TTL |
|------|---------------|-----|
| User balances | TanStack Query | 30 seconds |
| Transaction history | TanStack Query | 1 minute |
| Leaderboards | TanStack Query | 5 minutes |

## Common Gotchas

1. **No JOINs in batch()** - Run separate queries
2. **TEXT for all IDs** - Clerk IDs are strings
3. **No AUTO_INCREMENT on TEXT** - Use INTEGER for auto-increment
4. **Wrangler D1 local vs remote** - Add `--local` flag for dev
