# SPEC 19: Complete Item System - Design & Implementation

> **Based on industry research from [Game Developer](https://www.gamedeveloper.com/production/i-designed-economies-for-150m-games-here-s-my-ultimate-handbook), [Helika](https://www.helika.io/10-game-economy-management-design-tips-with-examples/), [The Acagamic](https://acagamic.com/newsletter/2023/03/21/how-to-unlock-the-secrets-of-video-game-inventory-ux-design/), and [Game Programming Patterns](https://gameprogrammingpatterns.com/state.html)**

---

## 🎯 Executive Summary

This spec defines the **complete item lifecycle** for wojak.ink, covering:
- Item states and transitions
- Database schema (unified)
- Purchase flow
- Inventory management
- Equip/unequip system
- Gifting system
- Limited edition items
- Bundles
- UI/UX requirements

**Key Decisions (from user):**
- Items are permanent OR consumable (no time-limited rentals)
- One-way gifting (transfer ownership, you lose the item)
- No refunds - all sales final
- One item per equip slot
- No presets/loadouts
- Auto-equip after purchase
- Tabbed inventory by category
- Live preview on hover
- Toast notifications
- Limited editions (quantity-based AND time-based)
- Simple tiers: Free / Basic / Premium
- Bundles with discounts
- Gift stats tracked (oranges gifted, gems gifted)

---

## 📊 Item State Machine

Every item has a **lifecycle state**:

```
                    ┌─────────────┐
                    │   CATALOG   │  (Available in shop)
                    └──────┬──────┘
                           │ purchase()
                           ▼
                    ┌─────────────┐
        ┌──────────│    OWNED    │──────────┐
        │          └──────┬──────┘          │
        │                 │                 │
        │ gift()          │ equip()         │ consume() [consumables only]
        │                 ▼                 │
        │          ┌─────────────┐          │
        │          │  EQUIPPED   │          │
        │          └──────┬──────┘          │
        │                 │                 │
        │                 │ unequip()       │
        │                 ▼                 ▼
        │          ┌─────────────┐   ┌─────────────┐
        │          │    OWNED    │   │   CONSUMED  │
        │          └─────────────┘   └─────────────┘
        │
        ▼
  ┌─────────────┐
  │   GIFTED    │  (Transferred to another user)
  └─────────────┘
```

### Item States

| State | Description | Can Equip | Can Gift | Can Consume |
|-------|-------------|-----------|----------|-------------|
| `catalog` | In shop, not purchased | ❌ | ❌ | ❌ |
| `owned` | Purchased, in inventory | ✅ | ✅ | ✅ (if consumable) |
| `equipped` | Currently active | ❌ (already) | ❌ | ❌ |
| `gifted` | Transferred to another user | ❌ | ❌ | ❌ |
| `consumed` | Used up (consumables only) | ❌ | ❌ | ❌ |

---

## 🗄️ Database Schema (Unified)

### PROBLEM: Two Disconnected Systems
Currently there are TWO separate systems:
1. `shop_items` + `user_inventory` + `user_equipped` (Shop)
2. `customization_catalog` + `user_customization_items` + `drawer_customization` (Drawer Editor)

### SOLUTION: Unified Schema

**Merge everything into ONE system:**

```sql
-- =====================================================
-- MIGRATION: Unified Item System
-- =====================================================

-- 1. MASTER ITEM CATALOG
-- All purchasable items in one table
-- =====================================================
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,  -- 'frame', 'title', 'background', 'name_effect',
                           -- 'celebration', 'emoji_badge', 'bigpulp_hat',
                           -- 'bigpulp_mood', 'bigpulp_accessory', 'consumable',
                           -- 'font_color', 'font_style', 'font_family',
                           -- 'avatar_glow', 'avatar_size', 'page_background',
                           -- 'dialogue_style', 'collection_layout', 'card_style',
                           -- 'entrance_animation', 'stats_style', 'tabs_style',
                           -- 'visitor_counter', 'bundle'

  -- Pricing
  tier TEXT DEFAULT 'basic',  -- 'free', 'basic', 'premium'
  price_oranges INTEGER DEFAULT 0,
  price_gems INTEGER DEFAULT 0,

  -- Visual
  emoji TEXT,               -- For emoji badges and previews
  css_class TEXT,           -- CSS class to apply
  css_value TEXT,           -- CSS value (for colors, fonts)
  preview_type TEXT,        -- 'color', 'text', 'icon', 'animation'

  -- Availability
  is_active INTEGER DEFAULT 1,
  is_limited INTEGER DEFAULT 0,
  stock_limit INTEGER,          -- NULL = unlimited, number = max available
  stock_remaining INTEGER,      -- Current stock (decremented on purchase)
  available_from TEXT,          -- ISO date - when item becomes available
  available_until TEXT,         -- ISO date - when item stops being available

  -- Bundle info (for bundles)
  bundle_items TEXT,            -- JSON array of item IDs included in bundle
  bundle_discount INTEGER,      -- Percentage discount (e.g., 20 for 20% off)

  -- Consumable info
  is_consumable INTEGER DEFAULT 0,
  consumable_quantity INTEGER,  -- How many uses per purchase

  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_category ON items(category, is_active);
CREATE INDEX idx_items_tier ON items(tier, is_active);
CREATE INDEX idx_items_limited ON items(is_limited, available_until);

-- 2. USER INVENTORY
-- Tracks all items owned by users
-- =====================================================
CREATE TABLE IF NOT EXISTS user_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,

  -- State
  state TEXT DEFAULT 'owned',  -- 'owned', 'equipped', 'gifted', 'consumed'

  -- Acquisition
  acquisition_type TEXT DEFAULT 'purchase',  -- 'purchase', 'gift', 'achievement', 'admin'
  acquired_from TEXT,          -- user_id if gifted, achievement_id if unlocked
  acquired_at TEXT DEFAULT CURRENT_TIMESTAMP,
  price_paid INTEGER DEFAULT 0,

  -- Consumable tracking
  uses_remaining INTEGER,      -- For consumables: how many uses left

  -- Gifting
  gifted_to TEXT,              -- user_id if gifted away
  gifted_at TEXT,

  UNIQUE(user_id, item_id, acquired_at),  -- Allow multiple of same consumable
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE INDEX idx_user_items_user ON user_items(user_id, state);
CREATE INDEX idx_user_items_item ON user_items(item_id);

-- 3. USER EQUIPPED ITEMS
-- Current equipment per slot (one row per user)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_equipment (
  user_id TEXT PRIMARY KEY,

  -- Equip Slots (one item per slot)
  frame_id TEXT,
  title_id TEXT,
  background_id TEXT,
  name_effect_id TEXT,
  celebration_id TEXT,

  -- BigPulp
  bigpulp_hat_id TEXT,
  bigpulp_mood_id TEXT,
  bigpulp_accessory_id TEXT,

  -- Drawer Customization
  font_color_id TEXT DEFAULT 'font-color-orange',
  font_style_id TEXT DEFAULT 'font-style-normal',
  font_family_id TEXT DEFAULT 'font-family-default',
  page_background_id TEXT DEFAULT 'bg-midnight-black',
  avatar_glow_id TEXT DEFAULT 'avatar-glow-none',
  avatar_size_id TEXT DEFAULT 'avatar-size-normal',
  bigpulp_position_id TEXT DEFAULT 'bigpulp-pos-right',
  dialogue_style_id TEXT DEFAULT 'dialogue-style-default',
  collection_layout_id TEXT DEFAULT 'layout-grid',
  card_style_id TEXT DEFAULT 'card-style-default',
  entrance_animation_id TEXT DEFAULT 'entrance-none',
  stats_style_id TEXT DEFAULT 'stats-style-default',
  tabs_style_id TEXT DEFAULT 'tabs-style-default',
  visitor_counter_id TEXT DEFAULT 'visitor-counter-hidden',

  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. USER GIFT STATS
-- Tracks total gifting activity
-- =====================================================
CREATE TABLE IF NOT EXISTS user_gift_stats (
  user_id TEXT PRIMARY KEY,

  total_oranges_gifted INTEGER DEFAULT 0,
  total_gems_gifted INTEGER DEFAULT 0,
  total_items_gifted INTEGER DEFAULT 0,

  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5. GIFT HISTORY
-- Record of all gifts sent/received
-- =====================================================
CREATE TABLE IF NOT EXISTS gift_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,

  gift_type TEXT NOT NULL,  -- 'item', 'oranges', 'gems'
  item_id TEXT,             -- If gift_type = 'item'
  amount INTEGER,           -- If gift_type = 'oranges' or 'gems'

  message TEXT,             -- Optional gift message

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
);

CREATE INDEX idx_gift_history_sender ON gift_history(sender_id, created_at);
CREATE INDEX idx_gift_history_recipient ON gift_history(recipient_id, created_at);

-- 6. CONSUMABLES (Simplified tracking)
-- Fast lookup for consumable counts
-- =====================================================
CREATE TABLE IF NOT EXISTS user_consumables (
  user_id TEXT NOT NULL,
  consumable_type TEXT NOT NULL,  -- 'donut', 'poop', etc.
  quantity INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, consumable_type),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🛒 Purchase Flow

### Standard Purchase

```typescript
async function purchaseItem(userId: string, itemId: string): Promise<PurchaseResult> {
  // 1. Get item from catalog
  const item = await db.items.findById(itemId);
  if (!item || !item.is_active) throw new Error('Item not available');

  // 2. Check availability (limited edition)
  if (item.is_limited) {
    if (item.stock_remaining !== null && item.stock_remaining <= 0) {
      throw new Error('Item is sold out');
    }
    if (item.available_until && new Date() > new Date(item.available_until)) {
      throw new Error('Item is no longer available');
    }
    if (item.available_from && new Date() < new Date(item.available_from)) {
      throw new Error('Item is not yet available');
    }
  }

  // 3. Check if already owned (non-consumables only)
  if (!item.is_consumable) {
    const existing = await db.user_items.findOne({ userId, itemId, state: ['owned', 'equipped'] });
    if (existing) throw new Error('You already own this item');
  }

  // 4. Check balance
  const balance = await db.user_currency.findById(userId);
  if (balance.oranges < item.price_oranges) {
    return {
      success: false,
      error: 'insufficient_funds',
      required: item.price_oranges,
      current: balance.oranges,
      deficit: item.price_oranges - balance.oranges,
      message: `You need ${item.price_oranges - balance.oranges} more oranges! Play games to earn.`
    };
  }

  // 5. Process purchase (atomic transaction)
  await db.transaction(async (tx) => {
    // Deduct currency
    const newBalance = balance.oranges - item.price_oranges;
    await tx.user_currency.update(userId, { oranges: newBalance });
    await tx.profiles.update(userId, { oranges: newBalance });

    // Add to inventory
    await tx.user_items.insert({
      user_id: userId,
      item_id: itemId,
      state: 'owned',
      acquisition_type: 'purchase',
      price_paid: item.price_oranges,
      uses_remaining: item.is_consumable ? item.consumable_quantity : null,
    });

    // Decrement stock (limited items)
    if (item.is_limited && item.stock_remaining !== null) {
      await tx.items.update(itemId, {
        stock_remaining: item.stock_remaining - 1
      });
    }

    // Record transaction
    await tx.currency_transactions.insert({
      user_id: userId,
      currency_type: 'oranges',
      amount: -item.price_oranges,
      balance_after: newBalance,
      source: 'shop_purchase',
      source_details: JSON.stringify({ itemId, itemName: item.name }),
    });
  });

  // 6. Auto-equip
  await equipItem(userId, itemId);

  // 7. Return success with toast data
  return {
    success: true,
    item: { id: item.id, name: item.name, category: item.category },
    newBalance: balance.oranges - item.price_oranges,
    toast: {
      type: 'success',
      title: 'Purchase Successful!',
      message: `${item.name} has been added to your inventory and equipped.`,
      icon: item.emoji || '🛒',
    }
  };
}
```

### Bundle Purchase

```typescript
async function purchaseBundle(userId: string, bundleId: string): Promise<PurchaseResult> {
  const bundle = await db.items.findById(bundleId);
  if (bundle.category !== 'bundle') throw new Error('Not a bundle');

  const bundleItems = JSON.parse(bundle.bundle_items);

  // Calculate price (with discount)
  const originalPrice = await calculateBundlePrice(bundleItems);
  const discountedPrice = Math.floor(originalPrice * (1 - bundle.bundle_discount / 100));

  // Check balance
  const balance = await db.user_currency.findById(userId);
  if (balance.oranges < discountedPrice) {
    return { success: false, error: 'insufficient_funds', /* ... */ };
  }

  // Purchase all items in bundle
  await db.transaction(async (tx) => {
    for (const itemId of bundleItems) {
      await tx.user_items.insert({
        user_id: userId,
        item_id: itemId,
        state: 'owned',
        acquisition_type: 'purchase',
        price_paid: 0, // Individual items show 0, bundle shows full price
      });
    }

    // Deduct currency (bundle price)
    const newBalance = balance.oranges - discountedPrice;
    await tx.user_currency.update(userId, { oranges: newBalance });

    // Record transaction
    await tx.currency_transactions.insert({
      user_id: userId,
      currency_type: 'oranges',
      amount: -discountedPrice,
      balance_after: newBalance,
      source: 'bundle_purchase',
      source_details: JSON.stringify({ bundleId, items: bundleItems }),
    });
  });

  return {
    success: true,
    toast: {
      type: 'success',
      title: 'Bundle Purchased!',
      message: `You saved ${originalPrice - discountedPrice} oranges!`,
      icon: '🎁',
    }
  };
}
```

---

## 🎒 Inventory System

### API Endpoints

```typescript
// GET /api/inventory
// Returns all owned items grouped by category
{
  categories: {
    frame: [
      { id: 'frame-orange', name: 'Orange Border', equipped: true, ... },
      { id: 'frame-gold', name: 'Gold Border', equipped: false, ... },
    ],
    title: [...],
    background: [...],
    // ... all categories
  },
  equipped: {
    frame: 'frame-orange',
    title: null,
    background: 'bg-midnight-black',
    // ... all slots
  },
  consumables: {
    donut: 15,
    poop: 8,
  },
  stats: {
    totalItems: 23,
    totalSpent: 12500,
  }
}
```

### Frontend Component

```tsx
// src/components/Account/InventoryWidget.tsx

const INVENTORY_TABS = [
  { id: 'frames', label: 'Frames', icon: Square },
  { id: 'titles', label: 'Titles', icon: Crown },
  { id: 'backgrounds', label: 'Backgrounds', icon: Image },
  { id: 'effects', label: 'Effects', icon: Sparkles },
  { id: 'bigpulp', label: 'BigPulp', icon: MessageSquare },
  { id: 'drawer', label: 'Drawer Style', icon: Palette },
  { id: 'consumables', label: 'Consumables', icon: Target },
];

function InventoryWidget() {
  const [activeTab, setActiveTab] = useState('frames');
  const [inventory, setInventory] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div className="inventory-widget">
      {/* Preview Panel - Shows live preview on hover */}
      {hoveredItem && (
        <div className="preview-panel">
          <div className="preview-name" style={getPreviewStyle(hoveredItem)}>
            {effectiveDisplayName}
          </div>
          <div className="preview-label">
            Preview: {hoveredItem.name}
          </div>
        </div>
      )}

      {/* Tabs */}
      <nav className="inventory-tabs">
        {INVENTORY_TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Items Grid */}
      <div className="inventory-grid">
        {inventory?.categories[activeTab]?.map(item => (
          <InventoryItem
            key={item.id}
            item={item}
            equipped={inventory.equipped[item.category] === item.id}
            onEquip={() => handleEquip(item)}
            onHover={() => setHoveredItem(item)}
            onLeave={() => setHoveredItem(null)}
          />
        ))}
      </div>
    </div>
  );
}

function InventoryItem({ item, equipped, onEquip, onHover, onLeave }) {
  return (
    <button
      className={`inventory-item ${equipped ? 'equipped' : ''}`}
      onClick={onEquip}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="item-preview">
        {renderItemPreview(item)}
      </div>
      <div className="item-name">{item.name}</div>
      {equipped && (
        <div className="equipped-badge">
          <Check size={12} />
          Equipped
        </div>
      )}
    </button>
  );
}
```

---

## 🎁 Gifting System

### Gift Flow

```typescript
// POST /api/gift
async function sendGift(senderId: string, recipientId: string, giftData: GiftData) {
  // 1. Validate recipient exists and is a friend
  const recipient = await db.users.findById(recipientId);
  if (!recipient) throw new Error('Recipient not found');

  const friendship = await db.friends.findOne({ userId: senderId, friendId: recipientId });
  if (!friendship) throw new Error('You can only gift to friends');

  // 2. Handle different gift types
  if (giftData.type === 'item') {
    // Check sender owns the item
    const ownedItem = await db.user_items.findOne({
      user_id: senderId,
      item_id: giftData.itemId,
      state: 'owned',
    });
    if (!ownedItem) throw new Error('You do not own this item');

    // Transfer ownership
    await db.transaction(async (tx) => {
      // Mark as gifted in sender's inventory
      await tx.user_items.update(ownedItem.id, {
        state: 'gifted',
        gifted_to: recipientId,
        gifted_at: new Date().toISOString(),
      });

      // Add to recipient's inventory
      await tx.user_items.insert({
        user_id: recipientId,
        item_id: giftData.itemId,
        state: 'owned',
        acquisition_type: 'gift',
        acquired_from: senderId,
      });

      // Update gift stats
      await tx.user_gift_stats.upsert(senderId, {
        total_items_gifted: sql`total_items_gifted + 1`,
      });

      // Record gift history
      await tx.gift_history.insert({
        sender_id: senderId,
        recipient_id: recipientId,
        gift_type: 'item',
        item_id: giftData.itemId,
        message: giftData.message,
      });
    });
  }

  if (giftData.type === 'oranges') {
    const amount = giftData.amount;

    // Check sender balance
    const senderBalance = await db.user_currency.findById(senderId);
    if (senderBalance.oranges < amount) {
      throw new Error('Insufficient oranges');
    }

    await db.transaction(async (tx) => {
      // Deduct from sender
      await tx.user_currency.update(senderId, {
        oranges: senderBalance.oranges - amount,
      });

      // Add to recipient
      const recipientBalance = await tx.user_currency.findById(recipientId);
      await tx.user_currency.update(recipientId, {
        oranges: (recipientBalance?.oranges || 0) + amount,
      });

      // Update gift stats
      await tx.user_gift_stats.upsert(senderId, {
        total_oranges_gifted: sql`total_oranges_gifted + ${amount}`,
      });

      // Record transactions
      await tx.currency_transactions.insert({
        user_id: senderId,
        currency_type: 'oranges',
        amount: -amount,
        source: 'gift_sent',
        source_details: JSON.stringify({ to: recipientId }),
      });
      await tx.currency_transactions.insert({
        user_id: recipientId,
        currency_type: 'oranges',
        amount: amount,
        source: 'gift_received',
        source_details: JSON.stringify({ from: senderId }),
      });

      // Record gift history
      await tx.gift_history.insert({
        sender_id: senderId,
        recipient_id: recipientId,
        gift_type: 'oranges',
        amount: amount,
        message: giftData.message,
      });
    });
  }

  // 3. Send notification to recipient
  await sendNotification(recipientId, {
    type: 'gift_received',
    title: 'You received a gift!',
    message: giftData.type === 'item'
      ? `${senderName} sent you ${itemName}!`
      : `${senderName} sent you ${amount} 🍊!`,
    icon: giftData.type === 'item' ? '🎁' : '🍊',
  });

  return { success: true };
}
```

### Gift Stats Display

```tsx
// In ProfileHeader or Account page
function GiftStats({ stats }) {
  return (
    <div className="gift-stats">
      <div className="stat">
        <span className="label">Gifted</span>
        <span className="value">
          {stats.totalOrangesGifted.toLocaleString()} 🍊
        </span>
      </div>
      <div className="stat">
        <span className="label">Gifted</span>
        <span className="value">
          {stats.totalGemsGifted.toLocaleString()} 💎
        </span>
      </div>
    </div>
  );
}
```

---

## 🏷️ Limited Edition Items

### Types of Limited Items

1. **Quantity-Limited**: "Only 100 exist!"
2. **Time-Limited**: "Available until Dec 31!"
3. **Both**: "Only 50 available until Friday!"

### Shop Display

```tsx
function ShopItem({ item }) {
  const isLimited = item.is_limited;
  const isSoldOut = item.stock_remaining === 0;
  const isExpired = item.available_until && new Date() > new Date(item.available_until);
  const isNotYetAvailable = item.available_from && new Date() < new Date(item.available_from);

  return (
    <div className={`shop-item ${isSoldOut || isExpired ? 'unavailable' : ''}`}>
      {/* Limited Badge */}
      {isLimited && (
        <div className="limited-badge">
          {item.stock_limit && (
            <span className="stock">
              {item.stock_remaining}/{item.stock_limit} left
            </span>
          )}
          {item.available_until && (
            <span className="countdown">
              <Clock size={12} />
              {formatTimeRemaining(item.available_until)}
            </span>
          )}
        </div>
      )}

      {/* Item content */}
      <div className="item-preview">{renderPreview(item)}</div>
      <div className="item-name">{item.name}</div>

      {/* Price / Status */}
      {isSoldOut ? (
        <div className="sold-out">SOLD OUT</div>
      ) : isExpired ? (
        <div className="expired">NO LONGER AVAILABLE</div>
      ) : isNotYetAvailable ? (
        <div className="coming-soon">
          Available {formatDate(item.available_from)}
        </div>
      ) : (
        <button className="buy-btn" onClick={() => handlePurchase(item)}>
          <span className="price">🍊 {item.price_oranges.toLocaleString()}</span>
        </button>
      )}
    </div>
  );
}
```

---

## 📦 Bundles

### Bundle Structure

```typescript
// Example bundle in items table
{
  id: 'bundle-starter-pack',
  name: 'Starter Pack',
  description: 'Everything you need to get started!',
  category: 'bundle',
  tier: 'premium',
  price_oranges: 2000,  // After discount
  bundle_items: JSON.stringify([
    'frame-orange',
    'title-newcomer',
    'bg-deep-navy',
    'font-color-gold',
  ]),
  bundle_discount: 25,  // 25% off
  emoji: '🎁',
}
```

### Bundle Display

```tsx
function BundleCard({ bundle }) {
  const bundleItems = JSON.parse(bundle.bundle_items);
  const originalPrice = calculateOriginalPrice(bundleItems);
  const savings = originalPrice - bundle.price_oranges;

  return (
    <div className="bundle-card">
      <div className="bundle-header">
        <span className="bundle-emoji">{bundle.emoji}</span>
        <h3>{bundle.name}</h3>
        <div className="savings-badge">
          Save {bundle.bundle_discount}% ({savings.toLocaleString()} 🍊)
        </div>
      </div>

      <div className="bundle-items">
        <span className="includes-label">Includes:</span>
        {bundleItems.map(itemId => (
          <BundleItemPreview key={itemId} itemId={itemId} />
        ))}
      </div>

      <div className="bundle-footer">
        <div className="price-comparison">
          <span className="original-price">
            🍊 {originalPrice.toLocaleString()}
          </span>
          <span className="bundle-price">
            🍊 {bundle.price_oranges.toLocaleString()}
          </span>
        </div>
        <button className="buy-bundle-btn">
          Buy Bundle
        </button>
      </div>
    </div>
  );
}
```

---

## 🔔 Toast Notifications

### Notification Types

```typescript
interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'gift';
  title: string;
  message: string;
  icon?: string;
  duration?: number;  // ms, default 4000
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Usage examples:
showToast({
  type: 'success',
  title: 'Item Equipped!',
  message: 'Gold Border is now active.',
  icon: '✨',
});

showToast({
  type: 'gift',
  title: 'Gift Received!',
  message: '@TangMaster sent you Rainbow Glow!',
  icon: '🎁',
  action: {
    label: 'View',
    onClick: () => navigate('/account'),
  },
});

showToast({
  type: 'info',
  title: 'Need More Oranges?',
  message: 'You need 500 more oranges! Play games to earn.',
  icon: '🍊',
  action: {
    label: 'Play Now',
    onClick: () => navigate('/games'),
  },
});
```

### Toast Component

```tsx
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            <span className="toast-icon">{toast.icon}</span>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            {toast.action && (
              <button
                className="toast-action"
                onClick={toast.action.onClick}
              >
                {toast.action.label}
              </button>
            )}
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

---

## 🎨 Live Preview on Hover

When user hovers over an item in shop or inventory, show a live preview of how it would look:

```tsx
function ItemWithPreview({ item, children }) {
  const [showPreview, setShowPreview] = useState(false);
  const { effectiveDisplayName } = useUserProfile();

  return (
    <div
      className="item-with-preview"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      {children}

      {showPreview && (
        <div className="live-preview-tooltip">
          <div className="preview-label">Preview</div>

          {/* Name preview for text effects */}
          {['font_color', 'font_style', 'font_family', 'name_effect'].includes(item.category) && (
            <div
              className={`preview-name ${item.css_class || ''}`}
              style={item.css_value ? { color: item.css_value } : undefined}
            >
              {effectiveDisplayName}
            </div>
          )}

          {/* Avatar preview for glow effects */}
          {item.category === 'avatar_glow' && (
            <div className={`preview-avatar ${item.css_class}`}>
              <img src={currentAvatar} alt="Preview" />
            </div>
          )}

          {/* Background preview */}
          {item.category === 'page_background' && (
            <div className={`preview-background ${item.css_class}`}>
              <span>Your drawer background</span>
            </div>
          )}

          {/* Frame preview */}
          {item.category === 'frame' && (
            <div className={`preview-frame ${item.css_class}`}>
              <img src={currentAvatar} alt="Preview" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 📋 Implementation Checklist

### Phase 1: Database Migration
- [ ] Create unified `items` table with all item types
- [ ] Create `user_items` table (replaces user_inventory + user_customization_items)
- [ ] Create `user_equipment` table (replaces user_equipped + drawer_customization)
- [ ] Create `user_gift_stats` table
- [ ] Create `gift_history` table
- [ ] Migrate existing data from old tables
- [ ] Add indexes for performance

### Phase 2: API Updates
- [ ] Create unified `/api/shop/items` endpoint
- [ ] Create unified `/api/inventory` endpoint
- [ ] Update `/api/shop/purchase` for unified system
- [ ] Create `/api/shop/equip` endpoint
- [ ] Create `/api/gift` endpoint
- [ ] Update `/api/drawer/[userId]` to read from unified tables

### Phase 3: Frontend - Shop
- [ ] Update Shop.tsx to show all item categories
- [ ] Add limited edition badges (stock, countdown)
- [ ] Add bundle cards
- [ ] Add tier badges (Free/Basic/Premium)
- [ ] Add live preview on hover
- [ ] Add "insufficient funds" prompt with CTA

### Phase 4: Frontend - Inventory
- [ ] Create InventoryWidget component
- [ ] Add tabbed category navigation
- [ ] Add equip/unequip functionality
- [ ] Add live preview on hover
- [ ] Show equipped badge

### Phase 5: Frontend - Gifting
- [ ] Add gift button to inventory items
- [ ] Create gift modal (select friend, optional message)
- [ ] Add gift stats to Account page
- [ ] Add gift notifications

### Phase 6: Frontend - Toast System
- [ ] Create ToastContext and useToast hook
- [ ] Create ToastContainer component
- [ ] Add toast triggers to all item actions

### Phase 7: Drawer Integration
- [ ] Update Drawer.tsx to read all equipment
- [ ] Ensure all CSS classes exist and work
- [ ] Test every customization option

### Phase 8: Testing
- [ ] Test purchase flow end-to-end
- [ ] Test equip/unequip flow
- [ ] Test gifting flow
- [ ] Test limited edition stock decrement
- [ ] Test bundle purchase
- [ ] Test all preview hovers
- [ ] Test all toast notifications

---

## 🚀 Summary

This spec provides a **complete, unified item system** that:

1. **Merges two disconnected systems** into one
2. **Supports all item types** (shop items + drawer customization)
3. **Has clear state transitions** (catalog → owned → equipped)
4. **Enables gifting** with stat tracking
5. **Supports limited editions** (quantity + time)
6. **Supports bundles** with discounts
7. **Provides great UX** (live preview, toasts, auto-equip)
8. **Is scalable** for future item types

**After implementation, items will flow correctly from purchase → inventory → drawer!** 🎯

Sources:
- [Game Developer - Economy Design Handbook](https://www.gamedeveloper.com/production/i-designed-economies-for-150m-games-here-s-my-ultimate-handbook)
- [Helika - 10 Game Economy Tips](https://www.helika.io/10-game-economy-management-design-tips-with-examples/)
- [The Acagamic - Inventory UX Design](https://acagamic.com/newsletter/2023/03/21/how-to-unlock-the-secrets-of-video-game-inventory-ux-design/)
- [Game Programming Patterns - State](https://gameprogrammingpatterns.com/state.html)
- [GeeksforGeeks - Database Inventory Design](https://www.geeksforgeeks.org/dbms/how-to-design-database-inventory-management-systems/)
