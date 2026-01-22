# Claude CLI Fix: Purchase Failing & Drawer Redirect Issues

## Issue 1: Purchase Failing ("Purchase failed")

### Problem
When user tries to buy a font color for 100 oranges, it shows generic "Purchase failed" error.

### Root Cause
In `/functions/api/shop/purchase.ts`:

1. **Line 108-111**: The API queries `profiles` table for oranges:
```typescript
const profile = await env.DB
  .prepare('SELECT oranges FROM profiles WHERE user_id = ?')
  .bind(auth.userId)
  .first<{ oranges: number }>();
```

But the actual currency might be stored in a different table (`user_currency` or `user_stats`).

2. **Lines 179-185**: Generic error handling swallows the real error:
```typescript
catch (error) {
  console.error('[Shop Purchase] Error:', error);
  return new Response(JSON.stringify({ error: 'Internal server error' }), { ... });
}
```

### Fix Required

1. **Check where oranges are actually stored** - Look at `CurrencyContext.tsx` to see which table it reads from. The purchase API must use the SAME table.

2. **Return detailed error messages** so we can debug:
```typescript
catch (error) {
  console.error('[Shop Purchase] Error:', error);
  return new Response(JSON.stringify({
    error: 'Purchase failed',
    details: error instanceof Error ? error.message : 'Unknown error'
  }), {
    status: 500,
    headers: corsHeaders,
  });
}
```

3. **Add validation logging** to see what's failing:
```typescript
console.log('[Shop Purchase] User balance:', profile?.oranges);
console.log('[Shop Purchase] Item price:', item?.price_oranges);
console.log('[Shop Purchase] Can afford:', (profile?.oranges || 0) >= (item?.price_oranges || 0));
```

4. **Verify the table schema** - Make sure `profiles` table has an `oranges` column, or switch to the correct table.

---

## Issue 2: Drawer Redirects to Boot Sequence

### Problem
When clicking "View Drawer" or navigating to `/drawer/:userId`, the boot sequence starts and redirects to `/landing` instead of opening the drawer.

### Root Cause
In `/src/App.tsx`:

1. **Lines 100-102**: Boot sequence check:
```typescript
const [isStartupComplete, setIsStartupComplete] = useState(
  (import.meta.env.DEV && SKIP_BOOT_IN_DEV) || hasSeenBoot()
);
```

2. **Lines 128-129**: Boot shows for ALL non-landing routes:
```typescript
{!isStartupComplete && !isLandingPage && (
  <StartupSequence onComplete={handleStartupComplete} />
)}
```

3. **Lines 109-118**: Boot completion ALWAYS redirects to `/landing`:
```typescript
const handleStartupComplete = () => {
  markBootComplete();
  navigate('/landing', { replace: true }); // <-- PROBLEM: Always goes to landing!
  setTimeout(() => {
    setIsStartupComplete(true);
  }, 50);
};
```

### Fix Required

**Option A: Make drawer a public route (skip boot)**

Add drawer to the list of routes that skip boot sequence:

```typescript
const isPublicPage = location.pathname === '/landing' ||
                     location.pathname.startsWith('/drawer/');

// Then use isPublicPage instead of isLandingPage
{!isStartupComplete && !isPublicPage && (
  <StartupSequence onComplete={handleStartupComplete} />
)}
```

**Option B: Preserve intended destination after boot**

Store where user wanted to go, then navigate there after boot:

```typescript
const [intendedDestination, setIntendedDestination] = useState<string | null>(null);

useEffect(() => {
  // If boot not complete and not on landing, save destination
  if (!isStartupComplete && location.pathname !== '/landing') {
    setIntendedDestination(location.pathname);
  }
}, []);

const handleStartupComplete = () => {
  markBootComplete();
  // Go to intended destination or landing
  navigate(intendedDestination || '/landing', { replace: true });
  setTimeout(() => {
    setIsStartupComplete(true);
  }, 50);
};
```

**Option C (Recommended): Combine both**

Public shareable pages (drawer, profile) should skip boot entirely. Other pages preserve destination.

```typescript
// Routes that should be publicly accessible without boot
const PUBLIC_ROUTES = ['/landing', '/drawer/', '/profile/'];
const isPublicRoute = PUBLIC_ROUTES.some(route => location.pathname.startsWith(route));

// Skip boot for public routes
{!isStartupComplete && !isPublicRoute && (
  <StartupSequence onComplete={handleStartupComplete} />
)}

// For non-public routes, preserve destination
const handleStartupComplete = () => {
  markBootComplete();
  const destination = isPublicRoute ? location.pathname : (intendedDestination || '/landing');
  navigate(destination, { replace: true });
  setIsStartupComplete(true);
};
```

---

## Files to Modify

1. `/functions/api/shop/purchase.ts` - Fix purchase logic and error handling
2. `/src/App.tsx` - Fix boot sequence to allow drawer access
3. Possibly `/src/contexts/CurrencyContext.tsx` - Verify where oranges are stored

## Testing

After fix:
1. ✅ Purchase font color for 100 oranges - should succeed (or show real error)
2. ✅ Click "View Drawer" - should go directly to drawer, no boot sequence
3. ✅ Direct URL to `/drawer/username` - should open drawer immediately
4. ✅ New user on other pages - should still see boot sequence

---

**Fix these issues so users can buy things and share their drawers!** 🍊
