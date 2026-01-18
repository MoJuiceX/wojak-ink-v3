# ADR-0001: Use Cloudflare D1 for User Data

**Status**: Accepted
**Date**: 2026-01-18
**Author**: MoJuiceX

## Context
The wojak.ink platform needs persistent storage for user data including currency balances (Ink, Donuts, Poops), transaction history, and game scores. Previously, this data was stored in localStorage which was vulnerable to manipulation and didn't persist across devices.

## Decision
Use Cloudflare D1 (SQLite at the edge) for all user data storage, accessed via Cloudflare Workers/Pages Functions with JWT authentication via Clerk.

## Consequences
### Positive
- Data persists across devices and sessions
- Server-side validation prevents client manipulation
- Zero cold-start latency (edge deployment)
- Integrated with existing Cloudflare Pages hosting
- SQLite is well-understood and easy to query
- Atomic transactions via batch() API

### Negative
- D1 has limitations (no RETURNING clause, limited JOIN support in batch)
- Requires JWT verification on every API call (adds latency)
- Need to manage database migrations manually
- Storage costs (though minimal for our scale)

## References
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- FIX-20: Server-Side User Economy implementation
- `.claude/patterns/database-patterns.md`
