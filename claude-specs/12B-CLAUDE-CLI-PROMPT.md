# Claude CLI Implementation Prompt: SPEC 12B - Profile & Drawer Customization

## Overview

Implement granular customization for the Achievement Drawer and Profile pages. Users can purchase and apply customizations to every visual element - font colors, backgrounds, layouts, BigPulp position, and more. Basic customizations are CHEAP (100-500 🍊) so everyone can personalize.

## Prerequisites

Read these files:
- `/claude-specs/12B-PROFILE-CUSTOMIZATION-SPEC.md` - Full specification
- `/claude-specs/12-SHOP-COLLECTIBLES-SPEC.md` - Existing shop system

## Key Philosophy

**Make basic customization accessible to everyone.** Font color changes should cost only 100 🍊. This creates immediate engagement while premium options (animated backgrounds, music) remain aspirational.

## Implementation Phases

### Phase 1: Database & Shop Items

**Create new tables:**

```sql
-- Drawer customization settings
CREATE TABLE IF NOT EXISTS drawer_customization (
  user_id TEXT PRIMARY KEY,
  font_color TEXT DEFAULT 'orange',
  font_style TEXT DEFAULT 'normal',
  font_family TEXT DEFAULT 'default',
  page_background TEXT DEFAULT 'midnight_black',
  avatar_glow TEXT DEFAULT 'none',
  avatar_size TEXT DEFAULT 'normal',
  bigpulp_position TEXT DEFAULT 'right',
  dialogue_style TEXT DEFAULT 'default',
  dialogue_color TEXT DEFAULT 'dark',
  stats_style TEXT DEFAULT 'default',
  stats_color TEXT DEFAULT 'orange',
  stats_visible TEXT DEFAULT '["items","emojis","spent"]',
  collection_layout TEXT DEFAULT 'grid',
  card_style TEXT DEFAULT 'default',
  featured_slots INTEGER DEFAULT 0,
  featured_items TEXT,
  category_tabs_style TEXT DEFAULT 'default',
  page_theme TEXT DEFAULT 'dark',
  page_border TEXT DEFAULT 'none',
  entrance_animation TEXT DEFAULT 'none',
  background_music TEXT,
  visitor_counter_style TEXT DEFAULT 'hidden',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Purchased customization items
CREATE TABLE IF NOT EXISTS user_customization_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  item_id TEXT NOT NULL,
  purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category, item_id)
);

-- Visitor tracking
CREATE TABLE IF NOT EXISTS drawer_visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  drawer_user_id TEXT NOT NULL,
  visitor_user_id TEXT,
  visited_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Seed customization items in shop_items or create separate catalog:**

### Font Colors (category: 'font_color')
| ID | Name | Price |
|----|------|-------|
| orange | Tang Orange | Free |
| white | White | 100 🍊 |
| red | Red | 100 🍊 |
| yellow | Yellow | 100 🍊 |
| green | Green | 100 🍊 |
| blue | Blue | 100 🍊 |
| purple | Purple | 100 🍊 |
| pink | Pink | 100 🍊 |
| cyan | Cyan | 100 🍊 |
| black | Black | 250 🍊 |
| gold | Gold | 500 🍊 |
| silver | Silver | 500 🍊 |
| gradient_sunset | Sunset Gradient | 750 🍊 |
| gradient_fire | Fire Gradient | 1,000 🍊 |
| gradient_rainbow | Rainbow | 2,500 🍊 |

### Font Styles (category: 'font_style')
| ID | Name | Price |
|----|------|-------|
| normal | Normal | Free |
| bold | Bold | 250 🍊 |
| italic | Italic | 250 🍊 |
| bold_italic | Bold Italic | 500 🍊 |
| outline | Outline | 750 🍊 |
| shadow | Shadow | 750 🍊 |
| glow | Glow | 1,000 🍊 |

### Font Families (category: 'font_family')
| ID | Name | Price |
|----|------|-------|
| default | Default | Free |
| impact | Impact | 500 🍊 |
| monospace | Monospace | 750 🍊 |
| rounded | Rounded | 750 🍊 |
| retro | Retro/Pixel | 1,000 🍊 |
| elegant | Elegant | 1,000 🍊 |
| handwritten | Handwritten | 1,000 🍊 |
| graffiti | Graffiti | 2,000 🍊 |

### Page Backgrounds (category: 'page_background')
| ID | Name | Price |
|----|------|-------|
| midnight_black | Midnight Black | Free |
| deep_navy | Deep Navy | 500 🍊 |
| forest_green | Forest Green | 500 🍊 |
| wine_red | Wine Red | 500 🍊 |
| gradient_sunset | Sunset Fade | 1,500 🍊 |
| gradient_ocean | Ocean Depths | 1,500 🍊 |
| pattern_grid | Grid Pattern | 1,000 🍊 |
| pattern_hexagons | Hexagons | 1,500 🍊 |
| animated_particles | Particle Field | 5,000 🍊 |
| animated_matrix | Matrix Rain | 7,500 🍊 |
| animated_aurora | Aurora | 10,000 🍊 |
| legendary_void | Void Portal | 25,000 🍊 |
| legendary_holographic | Holographic | 30,000 🍊 |

### Collection Layouts (category: 'collection_layout')
| ID | Name | Price |
|----|------|-------|
| grid | Grid | Free |
| list | List | 1,000 🍊 |
| showcase | Showcase | 2,000 🍊 |
| carousel | Carousel | 2,500 🍊 |
| masonry | Masonry | 2,000 🍊 |

### Card Styles (category: 'card_style')
| ID | Name | Price |
|----|------|-------|
| default | Default | Free |
| minimal | Minimal | 750 🍊 |
| fancy | Fancy | 1,500 🍊 |
| neon | Neon | 2,500 🍊 |
| glass | Glass | 2,000 🍊 |
| pixel | Pixel | 1,500 🍊 |

(Continue for all categories in spec...)

### Phase 2: API Endpoints

```typescript
// GET /api/drawer/:userId/customization
// Returns user's current customization settings + owned items

// PUT /api/drawer/customization
// Update customization (validates ownership)
{
  font_color?: string;
  font_style?: string;
  // ... all customization fields
}

// POST /api/drawer/customization/purchase
// Purchase a customization item
{
  category: string;
  itemId: string;
}

// GET /api/customization/catalog
// Returns full catalog with prices, grouped by category

// GET /api/drawer/:userId/visitors/count
// Returns total visitor count
```

### Phase 3: Drawer Customization UI

**Create Drawer Editor component:**

Location: `/src/components/Drawer/DrawerEditor.tsx`

Features:
1. Live preview panel showing changes in real-time
2. Category tabs: Username, Background, BigPulp, Stats, Collection, Page
3. For each option:
   - Show current selection
   - Show owned items with checkmark
   - Show unowned items with price and Buy button
4. Save button applies changes

```tsx
const DrawerEditor: React.FC = () => {
  const [preview, setPreview] = useState<DrawerCustomization>(currentSettings);
  const [activeCategory, setActiveCategory] = useState('username');

  return (
    <div className="drawer-editor">
      <div className="preview-panel">
        <DrawerPreview customization={preview} />
      </div>

      <div className="editor-panel">
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

        {activeCategory === 'username' && (
          <>
            <OptionGroup
              title="Font Color"
              category="font_color"
              options={fontColorOptions}
              current={preview.font_color}
              owned={ownedItems.font_color}
              onSelect={(id) => setPreview({...preview, font_color: id})}
              onBuy={handlePurchase}
            />
            <OptionGroup title="Font Style" ... />
            <OptionGroup title="Font Family" ... />
          </>
        )}

        {/* Other categories... */}
      </div>

      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
};
```

### Phase 4: Apply Customization to Drawer

**Update AchievementDrawer component:**

```tsx
const AchievementDrawer: React.FC<{ userId: string }> = ({ userId }) => {
  const { customization } = useDrawerCustomization(userId);

  // Apply font color
  const nameStyle = {
    color: getFontColor(customization.font_color),
    fontWeight: customization.font_style.includes('bold') ? 'bold' : 'normal',
    fontStyle: customization.font_style.includes('italic') ? 'italic' : 'normal',
    fontFamily: getFontFamily(customization.font_family),
  };

  // Apply background
  const bgClass = `bg-${customization.page_background}`;

  // Apply entrance animation
  const entranceClass = `entrance-${customization.entrance_animation}`;

  return (
    <div className={`drawer ${bgClass} ${entranceClass}`}>
      <Username style={nameStyle} effect={customization.name_effect}>
        {user.displayName}
      </Username>
      {/* ... */}
    </div>
  );
};
```

### Phase 5: CSS for All Options

**Create `/src/styles/drawer-customization.css`:**

```css
/* Font Colors */
.font-color-orange { color: #F97316; }
.font-color-white { color: #FFFFFF; }
.font-color-gold { color: #FFD700; }
.font-color-gradient-sunset {
  background: linear-gradient(90deg, #F97316, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.font-color-gradient-rainbow {
  background: linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: rainbow-shift 3s linear infinite;
}

/* Font Styles */
.font-style-bold { font-weight: 700; }
.font-style-italic { font-style: italic; }
.font-style-outline {
  -webkit-text-stroke: 1px #F97316;
  color: transparent;
}
.font-style-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
.font-style-glow { text-shadow: 0 0 10px #F97316, 0 0 20px #F97316; }

/* Font Families */
.font-family-retro { font-family: 'Press Start 2P', cursive; }
.font-family-elegant { font-family: 'Playfair Display', serif; }
.font-family-monospace { font-family: 'Fira Code', monospace; }

/* Backgrounds */
.bg-midnight_black { background: #0a0a0a; }
.bg-deep_navy { background: #0a1628; }
.bg-gradient_sunset {
  background: linear-gradient(135deg, #0a0a0a 0%, #4a1942 50%, #0a1628 100%);
}
.bg-animated_particles {
  background: #0a0a0a;
  position: relative;
}
.bg-animated_particles::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, #F97316 1px, transparent 1px);
  background-size: 50px 50px;
  animation: particles-float 20s linear infinite;
}

/* Avatar Glow */
.avatar-glow-soft { filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.3)); }
.avatar-glow-strong { filter: drop-shadow(0 0 20px rgba(249, 115, 22, 0.6)); }
.avatar-glow-pulsing {
  animation: glow-pulse 2s ease-in-out infinite;
}
.avatar-glow-rainbow {
  animation: rainbow-glow 3s linear infinite;
}

/* Entrance Animations */
.entrance-fade { animation: fade-in 0.5s ease-out; }
.entrance-slide { animation: slide-up 0.5s ease-out; }
.entrance-bounce { animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.entrance-dramatic { animation: dramatic-reveal 1.5s ease-out; }

/* Card Styles */
.card-style-minimal {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
}
.card-style-neon {
  background: rgba(0,0,0,0.5);
  border: 2px solid #F97316;
  box-shadow: 0 0 10px #F97316, inset 0 0 10px rgba(249, 115, 22, 0.1);
}
.card-style-glass {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}

/* Collection Layouts */
.layout-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
.layout-list { display: flex; flex-direction: column; }
.layout-masonry { columns: 3; column-gap: 1rem; }
.layout-carousel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }
```

### Phase 6: Featured Items

Allow users to pin favorite items at the top:

```tsx
const FeaturedItems: React.FC<{ items: string[]; max: number }> = ({ items, max }) => {
  return (
    <div className="featured-items">
      <h3>⭐ Featured</h3>
      <div className="featured-grid">
        {items.map(itemId => <ItemCard key={itemId} itemId={itemId} featured />)}
        {items.length < max && <AddFeaturedSlot />}
      </div>
    </div>
  );
};
```

### Phase 7: Visitor Counter

Track and display profile visitors:

```tsx
// On drawer load, record visit
useEffect(() => {
  if (userId !== currentUser.id) {
    recordVisit(userId);
  }
}, [userId]);

// Display counter if enabled
{customization.visitor_counter_style !== 'hidden' && (
  <VisitorCounter
    count={visitorCount}
    style={customization.visitor_counter_style}
  />
)}
```

## Files to Create/Modify

**New Files:**
- `/src/components/Drawer/DrawerEditor.tsx`
- `/src/components/Drawer/DrawerPreview.tsx`
- `/src/components/Drawer/OptionGroup.tsx`
- `/src/components/Drawer/FeaturedItems.tsx`
- `/src/components/Drawer/VisitorCounter.tsx`
- `/src/styles/drawer-customization.css`
- `/src/hooks/useDrawerCustomization.ts`
- `/functions/api/drawer/customization.ts`
- `/functions/api/customization/catalog.ts`

**Modify:**
- `/src/pages/AchievementDrawer.tsx` - Apply customization
- `/schema.sql` - Add new tables

## Acceptance Criteria

1. Users can change font color for 100 🍊 (cheap!)
2. All customization options purchasable from Drawer Editor
3. Live preview shows changes before saving
4. Owned items can be switched freely
5. Customization persists in database
6. Visitor counter tracks unique daily visits
7. Featured items display at top of collection
8. All CSS effects render correctly
9. Entrance animations play on page load
10. Background music plays with mute option

## Price Guidelines

- **100-500 🍊**: Basic colors, simple styles (everyone can afford)
- **500-2,500 🍊**: Gradients, fonts, layouts
- **2,500-10,000 🍊**: Animations, premium features
- **10,000-30,000 🍊**: Legendary backgrounds, music

---

**Winners win, baby!** 🍊
