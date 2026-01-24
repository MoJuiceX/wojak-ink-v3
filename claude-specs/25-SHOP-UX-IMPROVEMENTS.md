# SPEC 25: Shop UX Improvements - Unique Item Visuals & Info System

## Overview

Two critical UX issues need fixing in the shop:

1. **Drawer Style items all have identical placeholder images** - Users can't tell items apart
2. **No item information system** - Users don't know what they're buying or why

---

## Issue 1: Unique Item Visuals for Drawer Style

### Current Problem

All Drawer Style items show the same generic sparkle icon. This includes:
- **Layouts**: None, Normal, Right, Hidden, Grid
- **Font Colors**: Tang Orange, White, Red, Yellow, Green, Blue, Purple
- **Backgrounds**: Default, Midnight Black

Users cannot visually distinguish between items.

### Solution: Generate Preview Images

Each Drawer Style item needs a unique preview image showing what it actually looks like.

#### Option A: Static Preview Images (Recommended)

Create preview images for each item type:

**Layouts** - Show a mini drawer preview:
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ [Normal]    │     │    [Right]  │     │ ░░░░░░░░░░░ │
│ NFT  NFT    │     │  NFT  NFT   │     │   [Hidden]  │
│ NFT  NFT    │     │  NFT  NFT   │     │             │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐
│ [Grid]      │     │ [None]      │
│ ■ ■ ■ ■     │     │             │
│ ■ ■ ■ ■     │     │ (no drawer) │
└─────────────┘     └─────────────┘
```

**Font Colors** - Show text sample in that color:
```
┌─────────────┐
│             │
│  "Sample"   │  ← Text rendered in Tang Orange (#FF6B00)
│             │
└─────────────┘
```

**Backgrounds** - Show the actual background pattern/color:
```
┌─────────────┐     ┌─────────────┐
│ ████████████│     │             │
│ █ Default ██│     │  Midnight   │
│ ████████████│     │   Black     │
└─────────────┘     └─────────────┘
```

#### Option B: Dynamic CSS Previews

Render previews dynamically using CSS/SVG in the card itself:

```tsx
// ItemCard.tsx - for Drawer Style items
const DrawerStylePreview = ({ item }: { item: Item }) => {
  if (item.category === 'drawer_style') {
    // Determine subcategory from item metadata or name patterns
    if (isLayout(item)) {
      return <LayoutPreview layout={item.value} />;
    }
    if (isFontColor(item)) {
      return <FontColorPreview color={item.value} />;
    }
    if (isBackground(item)) {
      return <BackgroundPreview bg={item.value} />;
    }
  }
  return <img src={item.image_url} />;
};
```

#### Database Changes Needed

Add a `preview_data` or `metadata` JSON column to items table:

```sql
ALTER TABLE items ADD COLUMN metadata TEXT;

-- Example data:
UPDATE items SET metadata = '{"type": "layout", "value": "grid"}'
WHERE name = 'Grid' AND category = 'drawer_style';

UPDATE items SET metadata = '{"type": "font_color", "value": "#FF6B00"}'
WHERE name = 'Tang Orange' AND category = 'drawer_style';

UPDATE items SET metadata = '{"type": "background", "value": "midnight_black"}'
WHERE name = 'Midnight Black' AND category = 'drawer_style';
```

---

## Issue 2: Item Information System

### Current Problem

Users have no way to know:
- What an item does
- How it will look when equipped
- Why they should buy it

### Solution: Info Button with Tooltip/Modal

Add an info system that works across the entire shop.

#### UI Design

**Option A: Info Icon on Each Card**

```
┌─────────────────────┐
│ BASIC          [ⓘ] │  ← Small info icon in top-right
│                     │
│      [image]        │
│                     │
│    Item Name        │
│     🍊 100          │
│    [ Buy ]          │
└─────────────────────┘
```

**Option B: Info Icon Next to Item Name**

```
┌─────────────────────┐
│ BASIC               │
│                     │
│      [image]        │
│                     │
│  Item Name [ⓘ]     │  ← Info icon next to name
│     🍊 100          │
│    [ Buy ]          │
└─────────────────────┘
```

**Option C: Click/Tap Card to See Details (Mobile-Friendly)**

```
First tap: Shows info overlay on card
Second tap: Opens purchase modal
```

#### Info Content Structure

Each item needs these info fields:

```typescript
interface ItemInfo {
  name: string;
  description: string;      // What is this item?
  effect: string;           // What does it do when equipped?
  preview_url?: string;     // Optional: larger preview image
  category_explanation?: string; // "Frames appear around your NFT in the drawer"
}
```

#### Database Schema Addition

```sql
ALTER TABLE items ADD COLUMN description TEXT;
ALTER TABLE items ADD COLUMN effect TEXT;

-- Example data:
UPDATE items SET
  description = 'A calming blue-tinted frame',
  effect = 'Adds a soft ocean blue gradient frame around your NFT in the drawer'
WHERE name = 'Ocean Mist';

UPDATE items SET
  description = 'Arrange your NFTs in a compact grid',
  effect = 'Changes your drawer layout to show NFTs in a tight grid formation'
WHERE name = 'Grid';

UPDATE items SET
  description = 'Classic Tang Gang orange',
  effect = 'Changes your drawer title text to Tang Orange color'
WHERE name = 'Tang Orange';
```

#### Component Implementation

```tsx
// components/Shop/ItemInfoButton.tsx
import { useState } from 'react';
import { Info } from 'lucide-react';

interface ItemInfoButtonProps {
  item: {
    name: string;
    description?: string;
    effect?: string;
    category: string;
  };
}

export function ItemInfoButton({ item }: ItemInfoButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Category explanations
  const categoryInfo: Record<string, string> = {
    frames: 'Frames appear around your NFT in the drawer',
    titles: 'Titles display below your username',
    font_colors: 'Changes the color of text in your drawer',
    backgrounds: 'Changes the background of your drawer',
    layouts: 'Changes how NFTs are arranged in your drawer',
    effects: 'Visual effects that play on your NFT',
    celebrations: 'Animations that play when you win',
    ammo: 'Throwable items for NFT battles',
  };

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <Info size={16} className="text-gray-400 hover:text-white" />
      </button>

      {showTooltip && (
        <div className="absolute z-50 w-64 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl -left-28 top-8">
          <h4 className="font-bold text-white mb-1">{item.name}</h4>

          {item.description && (
            <p className="text-sm text-gray-300 mb-2">{item.description}</p>
          )}

          {item.effect && (
            <p className="text-sm text-orange-400">
              <span className="font-semibold">Effect:</span> {item.effect}
            </p>
          )}

          <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
            {categoryInfo[item.category] || 'Customization item'}
          </p>
        </div>
      )}
    </div>
  );
}
```

#### Integration with ItemCard

```tsx
// components/Shop/ItemCard.tsx
import { ItemInfoButton } from './ItemInfoButton';

export function ItemCard({ item }: ItemCardProps) {
  return (
    <div className="relative bg-gray-800 rounded-lg p-4">
      {/* Tier badge */}
      <span className={`badge ${tierColors[item.tier]}`}>{item.tier}</span>

      {/* Info button - top right */}
      <div className="absolute top-2 right-2">
        <ItemInfoButton item={item} />
      </div>

      {/* Item image/preview */}
      <div className="aspect-square mb-3">
        <ItemPreview item={item} />
      </div>

      {/* Item name */}
      <h3 className="text-center font-medium">{item.name}</h3>

      {/* Price */}
      <p className="text-center text-orange-400">🍊 {item.price}</p>

      {/* Buy/Equip button */}
      <Button onClick={handleAction}>
        {item.owned ? 'Equip' : 'Buy'}
      </Button>
    </div>
  );
}
```

---

## Implementation Priority

### Phase 1: Add Item Descriptions (Quick Win)
1. Add `description` and `effect` columns to `items` table
2. Populate descriptions for all items
3. Add `ItemInfoButton` component
4. Integrate into `ItemCard`

### Phase 2: Unique Drawer Style Visuals
1. Add `metadata` column to items table
2. Create preview components for each drawer style type
3. Replace generic sparkle icons with dynamic previews

### Phase 3: Enhanced Preview Modal (Future)
1. Full-screen preview of item in context
2. "Try it on" feature showing item on user's actual drawer
3. Before/after comparison

---

## Sample Item Descriptions

### Frames
| Item | Description | Effect |
|------|-------------|--------|
| Ocean Mist | A calming blue-tinted frame | Adds a soft ocean blue gradient frame around your NFT |
| Citrus Glow | Bright citrus-inspired frame | Wraps your NFT in a glowing orange/yellow gradient |
| Sunset Grove | Warm sunset colors | Adds warm orange-to-purple gradient frame |
| Berry Blush | Soft pink berry tones | Surrounds your NFT with a gentle pink gradient |

### Titles
| Item | Description | Effect |
|------|-------------|--------|
| Seedling | Just starting your journey | Displays "Seedling" title below your name |
| Grove Keeper | Protector of the grove | Displays "Grove Keeper" title below your name |
| Tang Emperor | Ruler of all tangs | Displays "Tang Emperor" title below your name |
| WAGMI | We're All Gonna Make It | Displays "WAGMI" title below your name |

### Drawer Styles
| Item | Description | Effect |
|------|-------------|--------|
| Grid | Compact NFT arrangement | Shows your NFTs in a tight grid formation |
| Right | Right-aligned drawer | Positions your drawer on the right side |
| Hidden | Minimalist hidden drawer | Hides the drawer until hovered |
| Tang Orange | Classic Tang Gang orange | Changes drawer text to Tang Orange (#FF6B00) |
| Midnight Black | Dark mode background | Sets drawer background to deep black |

---

## Files to Modify

1. **Database**: Add columns to `items` table
2. `/functions/api/shop/items.ts` - Return description/effect/metadata
3. `/src/components/Shop/ItemCard.tsx` - Add info button, dynamic previews
4. `/src/components/Shop/ItemInfoButton.tsx` - New component (create)
5. `/src/components/Shop/DrawerStylePreview.tsx` - New component (create)

---

## Acceptance Criteria

- [ ] Each Drawer Style item has a unique visual preview
- [ ] Info button (ⓘ) appears on every shop item card
- [ ] Clicking/hovering info shows: name, description, effect
- [ ] Category explanation shown in tooltip
- [ ] Works on mobile (tap to show info)
- [ ] Descriptions populated for all existing items
