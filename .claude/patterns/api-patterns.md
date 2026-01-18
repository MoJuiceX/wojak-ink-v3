# API Patterns

<!-- Last updated: 2026-01-18 -->
<!-- Source: Consolidated from LEARNINGS.md and CLAUDE.md -->

## Authentication
- All API routes require JWT verification via Clerk
- Extract user_id from `payload.sub` claim
- Use `verifyClerkJWT(token, env)` helper
- Clerk tokens expire after 60 seconds

## Database (Cloudflare D1)
- Use `env.DB.batch([...])` for atomic operations
- D1 doesn't support `RETURNING *` - use separate SELECT after INSERT/UPDATE
- Always log transactions for audit trail
- Cache collection stats for 2 minutes

## Rate Limits (CRITICAL)
| API | Rate Limit | Notes |
|-----|------------|-------|
| MintGarden | 2 req/s | NFT listings |
| Dexie | 2 req/s | Sales history |
| SpaceScan | **1 req/20s** | VERY strict! 30s backoff on 429 |
| CoinGecko | 1 req/2s | XCH price |
| Parse.bot | Paid | Fallback when Dexie fails |

## 3-Tier API Fallback
1. **Primary:** Free Dexie.space API
2. **Cache:** localStorage backup (24h valid)
3. **Fallback:** Parse.bot paid API (if cache stale)

## Error Handling
- Return `{ error: string }` with appropriate status code
- Log errors with `console.error('Context:', error)`
- Never expose internal error details to client

## Common Gotchas
- MintGarden API rate limits at 60 req/min
- SpaceScan returns 429 with 30s required backoff
- Always use proxy in dev mode for CORS (`/mintgarden-api`, `/dexie-api`)

## CAT Token Handling
- Dexie API returns raw token amounts without conversion rates
- Sales with large token amounts (>50k) and high XCH values (>2) are likely miscalculated
- Token rates defined in `historicalPriceService.ts`
- `fixSuspiciousSales()` auto-corrects bad conversions (run AFTER sync)

| Token | Rate (XCH/token) |
|-------|------------------|
| PIZZA | 0.00000286 |
| SPROUT | 0.00000932 |
| G4M | 0.00000175 |
| BEPE | 0.0000204 |
| HOA | 0.000318 |
| NeckCoin | 3.006 |
