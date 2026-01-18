# ADR-0003: Server-Side Currency

## Status
ACCEPTED

## Context
The games hub has a currency system (donuts and poops) that users earn from games and spend on features. Initially implemented client-side with localStorage.

**Problem**: Client-side currency is trivially exploitable:
- Users can modify localStorage directly
- Browser DevTools can change balance
- No audit trail for transactions

## Decision
Move all currency mutations to server-side API routes:

1. **Balance stored in D1 database**, not localStorage
2. **All mutations through authenticated API endpoints**
3. **Atomic transactions** using D1 `batch()`
4. **Transaction log** for audit trail

## Consequences

### Positive
- Secure against client manipulation
- Full transaction history
- Can implement server-side validation
- Enables future features (trading, marketplace)

### Negative
- Requires API call for every balance change
- Added latency for currency operations
- More complex implementation
- Requires authentication for all currency features

### Neutral
- Read-only balance can be cached client-side
- Must handle offline gracefully

## Implementation

```typescript
// API: functions/api/currency/spend.ts
export async function onRequestPost(context) {
  const { userId } = await verifyAuth(context);
  const { amount, reason } = await context.request.json();

  // Atomic deduction + logging
  await context.env.DB.batch([
    db.prepare('UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?')
      .bind(amount, userId, amount),
    db.prepare('INSERT INTO transactions (user_id, amount, type, reason) VALUES (?, ?, ?, ?)')
      .bind(userId, -amount, 'spend', reason),
  ]);
}
```

## References
- ADR-0001: Cloudflare D1 Database
- ADR-0002: Clerk Authentication
- `.claude/patterns/database-patterns.md`
