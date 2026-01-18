# Deployment Patterns

> Patterns for Cloudflare Pages, Vite builds, and git workflow.

## Quick Commands

```bash
# Development
npm run dev -- --host     # Dev server (network accessible for phone testing)

# Build
npm run build             # Production build

# Deploy
npx wrangler pages deploy dist --project-name=wojak-ink

# Database migration
npx wrangler d1 execute wojak-users --file=./functions/migrations/XXX.sql
```

## Vite Cache Issues

### Hook Errors After HMR

**Problem**: Pages randomly stop loading with "Cannot read properties of null (reading 'useContext')"

**Cause**: Vite's dependency pre-bundling cache gets corrupted during hot reload

**Fix**:
```bash
rm -rf node_modules/.vite && npm run dev -- --host
```

**When to suspect**: Multiple pages suddenly break with hook errors after making changes

## Git Workflow

### The Rule
**Everything stays local until explicitly told to push.**

### Process
1. Make changes locally
2. User tests on their device (http://192.168.x.x:port)
3. Iterate until user is satisfied
4. User says "push to GitHub" → commit, push, deploy

### Do NOT
- Push to GitHub without explicit permission
- Deploy to production without explicit permission
- Auto-commit changes
- Create new folders for "redesigns" or "versions"

### Branches, Not Folders
```bash
# For experiments/redesigns:
git checkout -b experiment-name    # Create branch
git checkout main                  # Go back to stable
git merge experiment-name          # Merge when ready
git branch -d experiment-name      # Delete after merge
```

One folder (`~/wojak-ink`), multiple branches. Never duplicate the repo folder.

## Cloudflare Pages

### Environment Variables
Set in Cloudflare Dashboard → Pages → Settings → Environment variables

Required:
- `CLERK_SECRET_KEY` - Clerk authentication
- `ANTHROPIC_API_KEY` - BigPulp AI (Claude)

### API Routes
Place in `functions/api/` directory. Cloudflare automatically deploys as Workers.

```
functions/
├── api/
│   ├── auth/
│   │   └── verify.ts
│   ├── currency/
│   │   ├── balance.ts
│   │   └── spend.ts
│   └── leaderboard/
│       └── [gameId].ts
```

### Build Output
- Output directory: `dist/`
- Build command: `npm run build`
- Node version: 18+

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Hook errors after changes | Vite cache corruption | `rm -rf node_modules/.vite` |
| API route 404 | Wrong file location | Must be in `functions/api/` |
| Env var not found | Not set in Cloudflare | Set in Pages settings |
| Deploy fails | Build error | Run `npm run build` locally first |
| CORS errors in dev | Missing proxy | Add to vite.config.ts |
