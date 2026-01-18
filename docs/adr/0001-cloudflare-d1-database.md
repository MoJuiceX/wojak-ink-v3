# ADR-0001: Cloudflare D1 Database

## Status
ACCEPTED

## Context
The application needed a database for:
- User accounts and authentication state
- Game leaderboards and high scores
- Currency balances (donuts/poops)
- Transaction history

Options considered:
1. **Cloudflare D1** - SQLite at the edge
2. **Supabase** - PostgreSQL with real-time
3. **PlanetScale** - MySQL serverless
4. **Turso** - Distributed SQLite

## Decision
Use Cloudflare D1 because:
- Already using Cloudflare Pages for hosting
- Zero additional latency (same edge network)
- Generous free tier
- SQLite syntax is simple and well-documented
- Native integration with Wrangler CLI

## Consequences

### Positive
- Single vendor (Cloudflare) for hosting + database
- Low latency for API routes
- Simple deployment with `wrangler d1 execute`
- No connection pooling needed

### Negative
- No `RETURNING` clause - must use `batch()` pattern
- Limited SQL features compared to PostgreSQL
- Migrations are manual (no ORM migration tool)
- Beta product with occasional stability issues

### Neutral
- Learning curve for D1-specific patterns
- Must use `batch()` for transactions

## References
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- `.claude/patterns/database-patterns.md` for D1-specific code patterns
