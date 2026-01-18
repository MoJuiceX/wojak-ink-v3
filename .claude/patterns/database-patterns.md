# Database Patterns

> Patterns for Cloudflare D1 database operations, migrations, and data integrity.

## D1 Fundamentals

### No RETURNING Clause
D1 doesn't support `RETURNING` - use `batch()` for atomic operations:

```typescript
// WRONG
const result = await db.prepare('INSERT INTO users ... RETURNING *').run();

// RIGHT
const results = await db.batch([
  db.prepare('INSERT INTO users (id, name) VALUES (?, ?)').bind(userId, name),
  db.prepare('SELECT * FROM users WHERE id = ?').bind(userId),
]);
const newUser = results[1].results[0];
```

### Batch for Transactions

```typescript
// Atomic multi-table update
const results = await db.batch([
  db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').bind(amount, userId),
  db.prepare('INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, ?)').bind(userId, amount, 'purchase'),
  db.prepare('SELECT balance FROM users WHERE id = ?').bind(userId),
]);
```

## Migration Commands

```bash
# Execute migration
npx wrangler d1 execute wojak-users --file=./functions/migrations/XXX.sql

# Execute with local database (for testing)
npx wrangler d1 execute wojak-users --local --file=./functions/migrations/XXX.sql
```

## Schema Conventions

```sql
-- Always include timestamps
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index foreign keys
CREATE INDEX idx_items_user_id ON items(user_id);
```

## Currency Handling

### Server-Side Only (Critical)

**Never trust client for currency mutations.** All balance changes must go through API:

```typescript
// API route: functions/api/currency/spend.ts
export async function onRequestPost(context) {
  const { userId } = await verifyAuth(context);
  const { amount } = await context.request.json();

  // Validate on server
  const user = await getUser(context.env.DB, userId);
  if (user.balance < amount) {
    return new Response('Insufficient balance', { status: 400 });
  }

  // Atomic update
  await context.env.DB.batch([
    db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').bind(amount, userId),
    db.prepare('INSERT INTO transactions ...'),
  ]);
}
```

## Query Patterns

### Pagination
```typescript
const { results } = await db
  .prepare('SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
  .bind(userId, limit, offset)
  .all();
```

### Aggregations
```typescript
const { results } = await db
  .prepare('SELECT COUNT(*) as count, SUM(amount) as total FROM transactions WHERE user_id = ?')
  .bind(userId)
  .all();
const { count, total } = results[0];
```

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "RETURNING not supported" | D1 limitation | Use batch() with SELECT |
| Transaction not atomic | Multiple separate queries | Use batch() |
| Slow queries | Missing index | Add index on foreign keys |
