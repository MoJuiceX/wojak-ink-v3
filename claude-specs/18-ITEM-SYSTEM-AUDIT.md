# Claude CLI: Complete Item System Audit & Fix

## 🚨 CRITICAL PROBLEM IDENTIFIED

There are **TWO SEPARATE, DISCONNECTED ITEM SYSTEMS** that don't talk to each other:

### System 1: Shop System (SPEC 12)
- **Tables:** `shop_items`, `user_inventory`, `user_equipped`
- **API:** `/api/shop/items`, `/api/shop/purchase`, `/api/shop/equip`, `/api/shop/inventory`
- **Frontend:** `Shop.tsx`, `InventorySection.tsx`
- **Items:** Emojis, Frames, Name Effects, Titles, Backgrounds, Celebrations, BigPulp items

### System 2: Drawer Customization System (SPEC 12B)
- **Tables:** `customization_catalog`, `user_customization_items`, `drawer_customization`
- **API:** `/api/drawer/customization`, `/api/drawer/customization/purchase`
- **Frontend:** `DrawerEditor.tsx`
- **Items:** Font colors, Font styles, Font families, Page backgrounds, Avatar effects, Layout options

**THE USER BOUGHT ITEMS FROM DRAWER EDITOR BUT:**
1. Items are stored in `user_customization_items` table
2. BUT the `Drawer.tsx` page reads from `user_inventory` and `user_equipped` tables!
3. The drawer customization settings are stored in `drawer_customization` table but the Drawer page doesn't read all of them correctly

---

## COMPLETE ITEM LIFECYCLE AUDIT

For each item type, verify:
1. ✅ Item can be viewed in shop/catalog
2. ✅ Item can be purchased (deducts currency)
3. ✅ Purchase is recorded in correct table
4. ✅ Item appears in user's inventory/collection
5. ✅ Item can be selected/equipped
6. ✅ Equipped item is saved to database
7. ✅ Equipped item shows on drawer/profile
8. ✅ CSS/styling is applied correctly

---

## ISSUES TO FIX

### Issue 1: Two Separate Purchase Systems

**Problem:**
- `DrawerEditor.tsx` buys from `customization_catalog` → saves to `user_customization_items`
- `Shop.tsx` buys from `shop_items` → saves to `user_inventory`
- `Drawer.tsx` reads from `user_inventory` and `user_equipped` - IGNORES `user_customization_items`!

**Fix Options:**

**Option A: Unify Systems (Recommended)**
Merge both catalogs into one `shop_items` table and one `user_inventory` table.

**Option B: Make Drawer Read Both Systems**
Update `Drawer.tsx` and `/api/drawer/[userId]` to read from BOTH `user_inventory` AND `user_customization_items`.

### Issue 2: Drawer Customizations Not Applied

**Problem:**
`Drawer.tsx` does read `customization` from the API, but the CSS classes may not exist or may not be applied correctly.

**Fix:**
1. Verify all CSS classes in `drawer-customization.css` exist
2. Verify `Drawer.tsx` applies ALL customization classes
3. Verify the classes produce visible changes

### Issue 3: InventorySection Shows Nothing

**Problem:**
`Account.tsx` passes `inventoryItems` to `InventorySection` but it's always an empty array:
```tsx
const [inventoryItems] = useState<any[]>([]); // NEVER POPULATED!
```

**Fix:**
Fetch actual inventory from `/api/shop/inventory` and pass to `InventorySection`.

### Issue 4: Missing Equip Functionality for Customization Items

**Problem:**
When you buy a font color from `DrawerEditor`, it auto-equips via `/api/drawer/customization` PUT.
BUT there's no UI to change it later without buying something new.

**Fix:**
The `DrawerEditor` should show ALL owned items (not just purchasable) and let user select any owned item.

---

## DETAILED FIX CHECKLIST

### 1. Fix /api/drawer/[userId].ts

Update to read from BOTH systems:

```typescript
// Current: Only reads from user_inventory
const { results: frames } = await env.DB
  .prepare('SELECT ... FROM user_inventory ui JOIN shop_items si ...')
  .bind(userId)
  .all();

// ADD: Also read drawer customization
const customization = await env.DB
  .prepare('SELECT * FROM drawer_customization WHERE user_id = ?')
  .bind(userId)
  .first<DrawerCustomization>();

// ADD: Read user_customization_items for purchased customization options
const { results: customItems } = await env.DB
  .prepare('SELECT * FROM user_customization_items WHERE user_id = ?')
  .bind(userId)
  .all();
```

### 2. Fix Drawer.tsx to Apply All Customizations

Verify these customizations are applied:

| Field | Current Status | CSS Class Format |
|-------|---------------|------------------|
| font_color | ⚠️ Partial | `font-color-{id}` or inline style |
| font_style | ⚠️ Partial | `font-style-{id}` |
| font_family | ❌ Missing | `font-family-{id}` |
| page_background | ✅ Works | `drawer-bg-{id}` |
| avatar_glow | ⚠️ Partial | `avatar-glow-{id}` |
| avatar_size | ⚠️ Partial | `avatar-size-{id}` |
| bigpulp_position | ✅ Works | `bigpulp-{id}` |
| dialogue_style | ❌ Not Applied | `dialogue-{id}` |
| collection_layout | ✅ Works | `layout-{id}` |
| card_style | ✅ Works | `card-{id}` |
| entrance_animation | ⚠️ Partial | `entrance-{id}` |
| stats_style | ✅ Works | `stats-{id}` |
| category_tabs_style | ✅ Works | `tabs-{id}` |
| visitor_counter_style | ❌ Not Shown | `visitor-{id}` |

### 3. Create Missing CSS Classes

File: `/src/styles/drawer-customization.css`

Ensure ALL these classes exist and produce VISIBLE changes:

```css
/* Font Colors */
.font-color-orange { color: #F97316; }
.font-color-white { color: #FFFFFF; }
.font-color-red { color: #EF4444; }
/* ... etc ... */

/* Gradient Font Colors */
.font-color-gradient-sunset {
  background: linear-gradient(90deg, #F97316, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
/* ... etc ... */

/* Font Styles */
.font-style-normal { font-weight: normal; }
.font-style-bold { font-weight: 700; }
.font-style-italic { font-style: italic; }
.font-style-bold-italic { font-weight: 700; font-style: italic; }
.font-style-outline {
  -webkit-text-stroke: 1px currentColor;
  -webkit-text-fill-color: transparent;
}
.font-style-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
.font-style-glow { text-shadow: 0 0 10px currentColor; }
.font-style-3d {
  text-shadow:
    1px 1px 0 rgba(0,0,0,0.2),
    2px 2px 0 rgba(0,0,0,0.15),
    3px 3px 0 rgba(0,0,0,0.1);
}

/* Font Families */
.font-family-default { font-family: system-ui, -apple-system, sans-serif; }
.font-family-impact { font-family: Impact, sans-serif; }
.font-family-monospace { font-family: "Fira Code", "Courier New", monospace; }
.font-family-rounded { font-family: "Nunito", "Comic Sans MS", sans-serif; }
.font-family-retro { font-family: "Press Start 2P", monospace; font-size: 0.8em; }
.font-family-elegant { font-family: "Playfair Display", Georgia, serif; }
.font-family-handwritten { font-family: "Dancing Script", cursive; }
.font-family-graffiti { font-family: "Permanent Marker", cursive; }

/* Page Backgrounds */
.drawer-bg-midnight-black { background: #0a0a0f; }
.drawer-bg-deep-navy { background: #0d1b2a; }
.drawer-bg-forest-green { background: #1a2e1a; }
.drawer-bg-wine-red { background: #2e1a1a; }
.drawer-bg-royal-purple { background: #1a1a2e; }
.drawer-bg-charcoal { background: #1f1f1f; }

/* Gradient Backgrounds */
.drawer-bg-gradient-sunset {
  background: linear-gradient(135deg, #0a0a0f 0%, #2e1a1a 50%, #2e2a1a 100%);
}
.drawer-bg-gradient-ocean {
  background: linear-gradient(135deg, #0d1b2a 0%, #1a2e2e 50%, #0a1520 100%);
}
.drawer-bg-gradient-aurora {
  background: linear-gradient(135deg, #0a1520 0%, #1a2e1a 25%, #1a1a2e 50%, #2e1a2e 75%, #0a1520 100%);
}
/* ... etc ... */

/* Avatar Glow Effects */
.avatar-glow-soft { filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.3)); }
.avatar-glow-medium { filter: drop-shadow(0 0 15px rgba(249, 115, 22, 0.5)); }
.avatar-glow-strong { filter: drop-shadow(0 0 25px rgba(249, 115, 22, 0.7)); }
.avatar-glow-pulsing {
  animation: pulseGlow 2s ease-in-out infinite;
}
@keyframes pulseGlow {
  0%, 100% { filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.4)); }
  50% { filter: drop-shadow(0 0 25px rgba(249, 115, 22, 0.8)); }
}
.avatar-glow-rainbow {
  animation: rainbowGlow 3s linear infinite;
}
@keyframes rainbowGlow {
  0% { filter: drop-shadow(0 0 15px rgba(255, 0, 0, 0.6)); }
  17% { filter: drop-shadow(0 0 15px rgba(255, 165, 0, 0.6)); }
  33% { filter: drop-shadow(0 0 15px rgba(255, 255, 0, 0.6)); }
  50% { filter: drop-shadow(0 0 15px rgba(0, 255, 0, 0.6)); }
  67% { filter: drop-shadow(0 0 15px rgba(0, 0, 255, 0.6)); }
  83% { filter: drop-shadow(0 0 15px rgba(128, 0, 128, 0.6)); }
  100% { filter: drop-shadow(0 0 15px rgba(255, 0, 0, 0.6)); }
}

/* Avatar Sizes */
.avatar-size-normal { transform: scale(1); }
.avatar-size-large { transform: scale(1.2); }
.avatar-size-xlarge { transform: scale(1.5); }
.avatar-size-massive { transform: scale(2); }

/* Entrance Animations */
.entrance-fade { animation: fadeIn 0.8s ease-out; }
.entrance-slide { animation: slideUp 0.8s ease-out; }
.entrance-zoom { animation: zoomIn 0.8s ease-out; }
.entrance-bounce { animation: bounceIn 1s ease-out; }
.entrance-dramatic { animation: dramaticEntrance 1.5s ease-out; }
.entrance-glitch { animation: glitchIn 0.8s ease-out; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.1); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); }
}
/* ... etc ... */
```

### 4. Fix Account.tsx Inventory

```tsx
// Current (broken):
const [inventoryItems] = useState<any[]>([]);

// Fix:
const [inventoryItems, setInventoryItems] = useState<any[]>([]);

useEffect(() => {
  const fetchInventory = async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      const res = await fetch('/api/shop/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Merge both inventory systems
        const shopItems = data.items || [];
        // Also mark which items are equipped
        const equipped = data.equipped || {};
        const itemsWithEquipped = shopItems.map(item => ({
          ...item,
          equipped:
            (item.category === 'frame' && equipped.frame_id === item.item_id) ||
            (item.category === 'title' && equipped.title_id === item.item_id) ||
            (item.category === 'name_effect' && equipped.name_effect_id === item.item_id) ||
            (item.category === 'background' && equipped.background_id === item.item_id) ||
            (item.category === 'celebration' && equipped.celebration_id === item.item_id),
        }));
        setInventoryItems(itemsWithEquipped);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    }
  };
  fetchInventory();
}, [isSignedIn, getToken]);
```

### 5. Add Equip Handlers to InventorySection

```tsx
// In Account.tsx
const handleEquip = async (itemId: string, category: ShopCategory) => {
  const slotMap: Record<string, string> = {
    frame: 'frame',
    title: 'title',
    name_effect: 'name_effect',
    background: 'background',
    celebration: 'celebration',
  };

  try {
    const token = await getToken();
    const res = await fetch('/api/shop/equip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ slot: slotMap[category], itemId }),
    });

    if (res.ok) {
      // Refresh inventory to update equipped state
      fetchInventory();
    }
  } catch (err) {
    console.error('Failed to equip:', err);
  }
};

const handleUnequip = async (category: ShopCategory) => {
  // Same as equip but with itemId: null
};

// Pass to InventorySection
<InventorySection
  items={inventoryItems}
  isOwnProfile={true}
  onEquip={handleEquip}
  onUnequip={handleUnequip}
/>
```

### 6. Verify Drawer API Returns All Data

File: `/functions/api/drawer/[userId].ts`

The API should return:
```typescript
{
  userId: string,
  username: string,
  totalItems: number,
  totalSpent: number,

  // From user_inventory + shop_items (SPEC 12)
  frames: InventoryItem[],
  titles: InventoryItem[],
  nameEffects: InventoryItem[],
  backgrounds: InventoryItem[],
  celebrations: InventoryItem[],

  // From user_equipped (SPEC 12)
  equipped: {
    frame: { id, name, css_class } | null,
    title: { id, name } | null,
    nameEffect: { id, name, css_class } | null,
    background: { id, name, css_class } | null,
  },

  // From drawer_customization (SPEC 12B)
  customization: {
    font_color: string,
    font_style: string,
    font_family: string,
    page_background: string,
    avatar_glow: string,
    avatar_size: string,
    bigpulp_position: string,
    dialogue_style: string,
    collection_layout: string,
    card_style: string,
    entrance_animation: string,
    stats_style: string,
    category_tabs_style: string,
    visitor_counter_style: string,
  },

  // BigPulp
  bigpulp: { current_hat, current_mood, current_accessory },
  bigpulpItems: { hats, moods, accessories },
  bigpulpComment: string,
  bigpulpMood: string,

  // Emojis
  ownedEmojis: string[],
  emojiRing: Record<string, string>,
}
```

---

## TESTING CHECKLIST

After implementing fixes:

### Shop System (SPEC 12)
- [ ] Can view all items in Shop
- [ ] Can purchase emoji badge → appears in inventory
- [ ] Can purchase frame → appears in inventory → can equip → shows on drawer
- [ ] Can purchase title → appears in inventory → can equip → shows on drawer
- [ ] Can purchase name effect → appears in inventory → can equip → shows on drawer
- [ ] Can purchase background → appears in inventory → can equip → shows on drawer
- [ ] Can purchase celebration → appears in inventory → can equip
- [ ] Can purchase BigPulp hat → appears in inventory → can equip → shows on drawer
- [ ] Can purchase BigPulp mood → appears in inventory → can equip → shows on drawer
- [ ] Can purchase BigPulp accessory → appears in inventory → can equip → shows on drawer
- [ ] Account page shows all owned items in InventorySection
- [ ] Can equip/unequip items from Account page

### Drawer Customization System (SPEC 12B)
- [ ] Can view all customization options in DrawerEditor
- [ ] Can purchase font color → owned state updates → can select → drawer text changes color
- [ ] Can purchase font style → owned state updates → can select → drawer text style changes
- [ ] Can purchase font family → owned state updates → can select → drawer font changes
- [ ] Can purchase page background → owned state updates → can select → drawer background changes
- [ ] Can purchase avatar glow → owned state updates → can select → avatar has glow effect
- [ ] Can purchase avatar size → owned state updates → can select → avatar size changes
- [ ] Can change BigPulp position → drawer BigPulp moves
- [ ] Can purchase dialogue style → drawer dialogue bubble style changes
- [ ] Can purchase collection layout → drawer item grid layout changes
- [ ] Can purchase card style → drawer item cards style changes
- [ ] Can purchase entrance animation → drawer has entrance animation
- [ ] Can purchase stats style → drawer stats panel style changes
- [ ] Can purchase category tabs style → drawer tabs style changes
- [ ] Can purchase visitor counter style → visitor counter appears

### Integration
- [ ] Both shop items AND drawer customizations show on drawer
- [ ] Purchased drawer customizations persist across sessions
- [ ] Currency deduction works for both systems
- [ ] Currency balance is consistent between both systems

---

## PRIORITY ORDER

1. **HIGH:** Fix `/api/drawer/[userId].ts` to return customization data correctly
2. **HIGH:** Fix `Drawer.tsx` to apply all CSS classes from customization
3. **HIGH:** Create all missing CSS classes in `drawer-customization.css`
4. **MEDIUM:** Fix `Account.tsx` to fetch and display inventory
5. **MEDIUM:** Add equip/unequip handlers to `InventorySection`
6. **LOW:** Consider unifying the two systems in the future

---

## FILES TO MODIFY

| File | Changes |
|------|---------|
| `/functions/api/drawer/[userId].ts` | Return full customization object |
| `/src/pages/Drawer.tsx` | Apply ALL customization CSS classes |
| `/src/styles/drawer-customization.css` | Add ALL missing CSS classes |
| `/src/pages/Account.tsx` | Fetch inventory, add equip handlers |
| `/src/components/Account/InventorySection.tsx` | May need styling updates |

---

**Make the item system work end-to-end!** 🍊
