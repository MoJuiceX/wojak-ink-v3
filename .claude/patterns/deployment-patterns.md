# Deployment Patterns (Cloudflare)

<!-- Last updated: 2026-01-18 -->
<!-- Source: Consolidated from LEARNINGS.md and CLAUDE.md -->

## Build & Deploy

### Standard Deploy
```bash
npm run build
npx wrangler pages deploy dist --project-name=wojak-ink
```

### Development Server
```bash
npm run dev -- --host     # Accessible on network for phone testing
```

### Custom Skill
Use `/deploy` skill for guided deployment with checks.

## Environment Configuration

### Vite Proxies (vite.config.ts)
Required for CORS in development:

```typescript
proxy: {
  '/mintgarden-api': {
    target: 'https://api.mintgarden.io',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/mintgarden-api/, ''),
  },
  '/dexie-api': {
    target: 'https://api.dexie.space',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/dexie-api/, ''),
  },
  '/spacescan-api': {
    target: 'https://api.spacescan.io',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/spacescan-api/, ''),
  },
  '/coingecko-api': {
    target: 'https://api.coingecko.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/coingecko-api/, ''),
  },
}
```

### Cloudflare Workers
```typescript
// Worker bindings in wrangler.toml
[vars]
CLERK_PUBLISHABLE_KEY = "pk_..."

[[d1_databases]]
binding = "DB"
database_name = "wojak-users"
database_id = "..."
```

## Troubleshooting

### Vite Cache Corruption
When pages randomly stop loading with hook errors:
```bash
rm -rf node_modules/.vite && npm run dev -- --host
```

**Symptoms:**
- "Cannot read properties of null (reading 'useContext')"
- Multiple pages break after HMR
- Hook-related errors after hot reload

### Build Failures
1. Check for TypeScript errors: `npm run build 2>&1 | head -50`
2. Check for missing imports
3. Verify environment variables are set

### Deploy Failures
1. Check Cloudflare dashboard for worker errors
2. Verify D1 database bindings
3. Check function routes in `/functions/`

## Cloudflare-Specific

### Pages Functions
Location: `/functions/api/*.ts`
```typescript
export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  // Access D1: env.DB
  // Access KV: env.KV
};
```

### D1 Database Commands
```bash
# List databases
npx wrangler d1 list

# Execute SQL
npx wrangler d1 execute wojak-users --file=./migrations/001.sql

# Interactive shell
npx wrangler d1 execute wojak-users --command="SELECT * FROM users LIMIT 5"
```

### Workers Cron (fetch-sales.ts)
Runs every 30 minutes to aggregate trade data:
```typescript
// workers/fetch-sales.ts
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    // Fetch from Dexie API
    // Store aggregated data
  },
};
```

## Git Workflow

### Branch Strategy
```bash
git checkout -b feature-name   # Create feature branch
git checkout main              # Return to stable
git merge feature-name         # Merge when ready
git branch -d feature-name     # Clean up
```

### Never Do
- Push without explicit permission
- Deploy without explicit permission
- Create folders for "redesigns" - use branches
- Duplicate the repo folder
