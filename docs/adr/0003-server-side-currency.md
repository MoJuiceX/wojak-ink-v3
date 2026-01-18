# ADR-0003: Move Currency from localStorage to Server

**Status**: Accepted
**Date**: 2026-01-18
**Author**: MoJuiceX

## Context
The game economy (Ink currency, Donuts, Poops) was initially stored in localStorage for simplicity. This created several problems:
1. Users could manipulate balances via browser DevTools
2. Balances didn't sync across devices
3. Clearing browser data lost all progress
4. No audit trail for transactions

This was tracked as FIX-20 in the project.

## Decision
Migrate all currency and transaction data to Cloudflare D1 with server-side validation:

1. **All mutations through API** - No direct localStorage writes for currency
2. **Server validates every transaction** - Check balance before deducting
3. **Transaction log** - Every change recorded with timestamp and source
4. **Optimistic UI with rollback** - Show immediate feedback, rollback on server error

## Consequences
### Positive
- Cheating prevention (server authority)
- Cross-device persistence
- Audit trail for debugging
- Foundation for future features (trading, leaderboards)
- Can implement rate limiting per user

### Negative
- Added latency for every currency action
- Requires authentication (Clerk JWT)
- More complex error handling
- Network dependency (offline play limited)

## Implementation
- Database: Cloudflare D1 (see ADR-0001)
- Auth: Clerk JWT (see ADR-0002)
- API routes: `/functions/api/economy/*`
- Patterns: `.claude/patterns/database-patterns.md`

## References
- FIX-20-server-side-user-economy.md
- Related: ADR-0001 (D1 Database), ADR-0002 (Clerk Auth)
