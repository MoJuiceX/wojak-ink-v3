# Inventory System Fix Required

**Date:** January 22, 2026
**Priority:** CRITICAL
**Blocking:** Multiple features depend on this fix

---

## Test Results Summary

| Test | Result | Notes |
|------|--------|-------|
| Test 1: Inventory Display | ❌ FAIL | Shows "No items purchased yet" despite having purchased items |
| Test 2: Purchase Updates Card State | ❌ FAIL | Card still shows "Buy" button after successful purchase |
| Test 3: Equip from Inventory | ❌ CANNOT TEST | Blocked by Test 1 failure - no items to equip |
| Test 4: Drawer Style Category | ✅ PASS | Shows font colors, layouts, backgrounds |

---

## What's Working ✅

1. **Shop loads all categories** - All 10 tabs display items correctly
2. **Tier badges display** - FREE (gray), BASIC (green), PREMIUM (purple)
3. **Purchase API works** - Balance decreases correctly after purchase
4. **Drawer Style tab populated** - No longer empty
5. **Toast notifications** - Appear on purchase (sometimes)

---

## What's Broken ❌

### Issue 1: Inventory Display (CRITICAL)

**Location:** Account page → Inventory section

**Expected Behavior:**
- Show all items the user has purchased
- Display "Inventory (X items)" header
- Group items by category
- Show Equip/Equipped status
- Show Gift button for non-equipped items

**Actual Behavior:**
- Shows "No items purchased yet"
- Empty shopping cart icon

**User's Purchased Items (confirmed via balance decreasing):**
- Ocean Mist frame (3,750 🍊)
- Grove Keeper title (1,250 🍊)
- Red font color (100 🍊)
- Tang Orange font color (free)
- WAGMI title (2,500 🍊) - from earlier session
- Seedling frame (1,250 🍊) - from earlier session
- Orange emoji (250 🍊) - from earlier session
- Shimmer effect (1,250 🍊) - from earlier session
- Glaze consumable (50 🍊) - from earlier session

---

### Issue 2: Shop Card State Not Updating

**Location:** Shop page → Any item card after purchase

**Expected Behavior:**
- After purchase, "Buy" button changes to "Equip" button
- Or shows "Owned" badge
- Prevents duplicate purchases

**Actual Behavior:**
- "Buy" button remains after purchase
- User can potentially buy same item multiple times

---

## How to Fix

### Fix 1: Inventory Display

**Step 1: Check the API endpoint**

File: `/functions/api/shop/inventory.ts`

The endpoint should:
```typescript
// Query user_items table joined with items table
const items = await db.prepare(`
  SELECT
    ui.id as user_item_id,
    ui.item_id,
    ui.state,
    ui.acquired_at,
    i.name,
    i.description,
    i.category,
    i.image_url,
    i.tier
  FROM user_items ui
  JOIN items i ON ui.item_id = i.id
  WHERE ui.user_id = ?
  AND ui.state IN ('owned', 'equipped')
  ORDER BY i.category, ui.acquired_at DESC
`).bind(userId).all();

return Response.json({ items: items.results });
```

**Step 2: Check the frontend component**

File: `/src/components/Account/Inventory.tsx` (or similar)

Verify:
1. Component calls `/api/shop/inventory` endpoint
2. Response is being parsed correctly
3. Items are being rendered (check for conditional rendering bugs)
4. Check if there's an auth issue (userId not being passed)

**Common bugs to look for:**
```typescript
// Bug: Empty array check wrong way
if (!items) return <Empty />  // Should be: if (!items?.length)

// Bug: Not awaiting async call
const items = fetchInventory()  // Should be: await fetchInventory()

// Bug: Wrong response structure
const items = response.items  // Check: is it response.data.items?
```

**Step 3: Check database**

Run this query to verify items exist:
```sql
SELECT * FROM user_items WHERE user_id = 'USER_ID_HERE';
```

If empty, the purchase API isn't writing to `user_items` table correctly.

---

### Fix 2: Shop Card State Update

**Step 1: Track owned items in shop**

File: `/src/pages/Shop.tsx` or `/src/components/Shop/ShopCard.tsx`

The shop should:
1. Fetch user's inventory on load
2. Create a Set of owned item IDs
3. Pass `isOwned` prop to each card

```typescript
// In Shop.tsx
const { data: inventory } = useQuery(['inventory'], fetchInventory);
const ownedItemIds = new Set(inventory?.items?.map(i => i.item_id) || []);

// In ShopCard
<ShopCard
  item={item}
  isOwned={ownedItemIds.has(item.id)}
/>
```

**Step 2: Update card rendering**

File: `/src/components/Shop/ShopCard.tsx`

```typescript
// Replace Buy button logic
{isOwned ? (
  <Button disabled className="bg-gray-600">
    Owned ✓
  </Button>
) : (
  <Button onClick={handlePurchase}>
    Buy
  </Button>
)}
```

**Step 3: Invalidate cache after purchase**

```typescript
// After successful purchase
queryClient.invalidateQueries(['inventory']);
queryClient.invalidateQueries(['shop-items']);
```

---

## Files to Check

1. `/functions/api/shop/inventory.ts` - API endpoint
2. `/functions/api/shop/purchase.ts` - Verify it writes to user_items
3. `/src/components/Account/Inventory.tsx` - Frontend component
4. `/src/pages/Shop.tsx` - Shop page logic
5. `/src/components/Shop/ShopCard.tsx` - Individual card component

---

## Debug Steps

### 1. Check Network Tab

Open browser DevTools → Network tab → Look for:
- `GET /api/shop/inventory` - Is it being called?
- What's the response? Empty array? Error? Correct data?

### 2. Check Console

Look for:
- JavaScript errors
- Failed API calls
- Auth/token issues

### 3. Check Database Directly

```bash
# Using wrangler
wrangler d1 execute wojak-db --command "SELECT * FROM user_items LIMIT 10;"
```

### 4. Add Logging

```typescript
// In inventory.ts
console.log('User ID:', userId);
console.log('Query result:', items);

// In Inventory.tsx
console.log('Inventory data:', data);
console.log('Items to render:', data?.items);
```

---

## Test After Fix

Once fixed, verify:

1. **Account → Inventory shows items**
   - Items grouped by category
   - "Equipped" badge on equipped items
   - "Equip" button on non-equipped items

2. **Shop cards show correct state**
   - Owned items show "Owned ✓" or "Equip"
   - Can't buy same item twice

3. **Equip functionality works**
   - Click "Equip" → item becomes equipped
   - Previously equipped item becomes unequipped

---

## Current User State

**User:** mojuice (@mojuicex)
**Balance:** 9,700 🍊 (started at 20,100 🍊)
**Total Spent:** ~10,400 🍊 on multiple items
**Inventory Shows:** "No items purchased yet" (BUG)
