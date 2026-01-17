# Wojak.ink Automated Audit Check

Run these checks and report back the status of each fix.

## Run These Commands

Execute each command and note the result:

```bash
# 1. Check for React duplicates
echo "=== 1. REACT DUPLICATES ===" && bun pm ls react 2>/dev/null || npm ls react 2>/dev/null

# 2. Check vite.config for React alias
echo "=== 2. VITE REACT ALIAS ===" && grep -n "react.*resolve\|alias.*react" vite.config.ts 2>/dev/null || echo "No alias found"

# 3. Check ErrorBoundary exists
echo "=== 3. ERROR BOUNDARY ===" && ls -la src/components/ErrorBoundary.tsx 2>/dev/null && echo "EXISTS" || echo "MISSING"

# 4. Check GameLoading exists
echo "=== 4. GAME LOADING ===" && ls -la src/components/games/GameLoading.tsx 2>/dev/null && echo "EXISTS" || echo "MISSING"

# 5. Check GameError exists
echo "=== 5. GAME ERROR ===" && ls -la src/components/games/GameError.tsx 2>/dev/null && echo "EXISTS" || echo "MISSING"

# 6. Check GallerySkeleton exists
echo "=== 6. GALLERY SKELETON ===" && ls -la src/components/skeletons/GallerySkeleton.tsx 2>/dev/null && echo "EXISTS" || echo "MISSING"

# 7. Check AbortError handling
echo "=== 7. ABORT ERROR HANDLING ===" && grep -c "AbortError" src/contexts/UserProfileContext.tsx 2>/dev/null || echo "0"

# 8. Check Landing page for issues
echo "=== 8. LANDING PAGE ===" && head -30 src/pages/Landing.tsx 2>/dev/null | grep -E "return|render|opacity|visible"

# 9. Check if pages exist
echo "=== 9. PAGE FILES ===" && ls -la src/pages/{Leaderboard,Shop,Guild,Account,Media}*.tsx 2>/dev/null
```

## Then Check Browser

Open browser to localhost:5173 and test these URLs:

| URL | Expected | Check |
|-----|----------|-------|
| /games/orange-stack | Game loads, no black screen | [ ] Pass [ ] Fail |
| /landing | Content visible | [ ] Pass [ ] Fail |
| /leaderboard | Rankings show | [ ] Pass [ ] Fail |
| /shop | Shop displays | [ ] Pass [ ] Fail |
| /guild | Guild info shows | [ ] Pass [ ] Fail |
| /account | Account page loads | [ ] Pass [ ] Fail |
| /media | Media content shows | [ ] Pass [ ] Fail |
| /gallery | Loads without 3-5s black screen | [ ] Pass [ ] Fail |

## Report Format

After running checks, report like this:

```
## Audit Report - [DATE/TIME]

### Code Checks:
1. React Duplicates: [YES/NO/FIXED]
2. Vite Alias: [EXISTS/MISSING]
3. ErrorBoundary: [EXISTS/MISSING]
4. GameLoading: [EXISTS/MISSING]
5. GameError: [EXISTS/MISSING]
6. GallerySkeleton: [EXISTS/MISSING]
7. AbortError Handled: [YES/NO]
8. Landing Page: [OK/ISSUE FOUND]
9. Page Files: [ALL EXIST/MISSING: list]

### Browser Tests:
- /games/orange-stack: [PASS/FAIL - description]
- /landing: [PASS/FAIL - description]
- /leaderboard: [PASS/FAIL - description]
- /shop: [PASS/FAIL - description]
- /guild: [PASS/FAIL - description]
- /account: [PASS/FAIL - description]
- /media: [PASS/FAIL - description]
- /gallery: [PASS/FAIL - description]

### Console Errors:
[List any errors seen in browser console]

### Summary:
- Fixed: X/15
- Needs Work: X/15
- Needs Testing: X/15

### Recommended Next Fix:
[Which fix file to run next]
```
