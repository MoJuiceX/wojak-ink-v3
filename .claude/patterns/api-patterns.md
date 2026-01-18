# API Patterns

> Consolidated patterns for external API integrations, rate limits, and data handling.

## Rate Limits (Critical)

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

## Caching Strategy

| Data | Cache Location | TTL |
|------|---------------|-----|
| Sales history | localStorage | 6 hours (auto-sync) |
| NFT metadata | Static JSON | Immutable |
| Market listings | TanStack Query | 1-10 min |
| XCH price | TanStack Query | 6 hours |
| Treasury data | localStorage + Query | 30 min |

## Dev Proxies (vite.config.ts)

```typescript
// Avoid CORS in development
'/mintgarden-api' → 'https://api.mintgarden.io'
'/dexie-api' → 'https://api.dexie.space'
'/spacescan-api' → 'https://api.spacescan.io'
'/coingecko-api' → 'https://api.coingecko.com'
```

## CAT Token Rates

Defined in `src/services/historicalPriceService.ts`:

| Token | Rate (XCH per 1 token) | Example |
|-------|------------------------|---------|
| PIZZA | 0.00000286 | 550,000 PIZZA = ~1.57 XCH |
| SPROUT | 0.00000932 | 110,000 SPROUT = ~1.02 XCH |
| G4M | 0.00000175 | 366,666 G4M = ~0.64 XCH |
| BEPE | 0.0000204 | 70,000 BEPE = ~1.43 XCH |
| HOA | 0.000318 | 6,300 HOA = ~2 XCH |
| NeckCoin | 3.006 | High-value token |

### Adding New Token Rate

1. Look up current rate on Dexie.space
2. Add to `TOKEN_RATES` in `src/services/historicalPriceService.ts`
3. Run `fixSuspiciousSales()` to correct historical sales

## Sales Data Gotchas

### CAT Token Sales
- Dexie API returns raw token amounts without conversion rates
- Sales with large token amounts (>50k) and high XCH values (>2) are likely miscalculated
- `fixSuspiciousSales()` in `salesDatabank.ts` auto-corrects bad conversions
- **Must run AFTER sync completes, not before**

### Top 10 Highest Sales
```typescript
// WRONG: Only gets recent 20
const sales = getRecentSales(20);

// RIGHT: Get ALL sales, then sort
const sales = getRecentSales(10000);
sales.sort((a, b) => b.xchEquivalent - a.xchEquivalent).slice(0, 10);
```

### Query Invalidation After Async Load
When sales sync completes after TanStack Query has cached empty results:
```typescript
// In SalesProvider.tsx after sync
queryClient.invalidateQueries({ queryKey: ['bigPulp'] });
```

## NFT Naming

- NFTs have a "Base" attribute in metadata (Alien Wojak, Papa Tang, Soyjak, etc.)
- Use `getNftName()` helper in `bigpulpService.ts`
- Display as "Alien Wojak #3666" not "Wojak #3666"

## XCH Price

- **Never hardcode XCH price** - it changes daily
- Use `useXchPrice()` hook for real-time price from CoinGecko
- The title bar already shows current XCH price

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Sales showing wrong XCH values | CAT token rate missing | Add rate to `TOKEN_RATES` |
| "No sales data available" | localStorage cleared | Wait for auto-sync or run `syncDexieSales()` |
| BigPulp shows empty after reload | Query cached before sync | Invalidate queries after sync |
| NFT shows "Wojak #XXXX" | Not using metadata | Use `getNftName()` |
| fixSuspiciousSales not working | Ran before sync | Ensure it runs AFTER sync completes |
