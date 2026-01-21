# Claude CLI Fix: Shop Item Previews Are Generic

## The Problem

Multiple shop categories show generic sparkle (✨) icons instead of meaningful previews. Each item should have a visual that represents what you're buying.

## Categories That Need Fixing

### 1. BigPulp Items (Hats, Moods, Accessories)

**Current:** All show generic sparkle ✨
**Expected:** Show emoji or icon representing the item

Use these emoji mappings:

#### Hats
| Item | Emoji |
|------|-------|
| Party Hat | 🎉 |
| Cowboy Hat | 🤠 |
| Chef Hat | 👨‍🍳 |
| Viking Helmet | ⚔️ |
| Pirate Hat | 🏴‍☠️ |
| Beret | 🎨 |
| Top Hat | 🎩 |
| Wizard Hat | 🧙 |
| Devil Horns | 😈 |
| Crown | 👑 |
| Halo | 😇 |

#### Moods
| Item | Emoji |
|------|-------|
| Happy | 😊 |
| Chill | 😎 |
| Sleepy | 😴 |
| Hype | 🤩 |
| Grumpy | 😤 |
| Sergeant | 🫡 |
| Numb | 😐 |
| Rekt | 😵 |

#### Accessories
| Item | Emoji |
|------|-------|
| Bowtie | 🎀 |
| Bandana | 🧣 |
| Earring | 💎 |
| Headphones | 🎧 |
| Cigar | 🚬 |
| Monocle | 🧐 |
| Scar | ⚡ |

**Implementation:**
```tsx
// In shop_items database or component mapping
const bigpulpEmojis: Record<string, string> = {
  // Hats
  'party_hat': '🎉',
  'cowboy_hat': '🤠',
  'chef_hat': '👨‍🍳',
  'viking_helmet': '⚔️',
  'pirate_hat': '🏴‍☠️',
  'beret': '🎨',
  'top_hat': '🎩',
  'wizard_hat': '🧙',
  'devil_horns': '😈',
  'crown': '👑',
  'halo': '😇',
  // Moods
  'happy': '😊',
  'chill': '😎',
  'sleepy': '😴',
  'hype': '🤩',
  'grumpy': '😤',
  'sergeant': '🫡',
  'numb': '😐',
  'rekt': '😵',
  // Accessories
  'bowtie': '🎀',
  'bandana': '🧣',
  'earring': '💎',
  'headphones': '🎧',
  'cigar': '🚬',
  'monocle': '🧐',
  'scar': '⚡',
};
```

Display the emoji large (48-64px) in the card preview area.

---

### 2. Titles

**Current:** All show generic sparkle ✨
**Expected:** Show the actual title TEXT as preview

Titles are text, so the preview should literally show the title string in a styled way.

**Implementation:**
```tsx
// For title items, render the title text itself
const TitlePreview: React.FC<{ title: string }> = ({ title }) => (
  <div className="title-preview">
    <span className="title-text">"{title}"</span>
  </div>
);
```

```css
.title-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 1rem;
}

.title-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #F97316;
  text-align: center;
  font-style: italic;
}

/* Legendary titles get extra glow */
.title-preview.legendary .title-text {
  text-shadow: 0 0 10px rgba(249, 115, 22, 0.5);
}
```

**Examples of how it should look:**
- "Seedling" → shows "Seedling" in orange italic text
- "Winners Win!" → shows "Winners Win!" in orange italic text with glow
- "King of the Grove" → shows "King of the Grove" with legendary glow

---

### 3. Celebrations

**Current:** All show generic sparkle ✨
**Expected:** Show animated preview of the celebration effect

**Implementation Options:**

#### Option A: Mini CSS Animations
Create small-scale versions of each celebration:

```tsx
const CelebrationPreview: React.FC<{ type: string }> = ({ type }) => {
  return (
    <div className={`celebration-preview celebration-${type}`}>
      {type === 'confetti' && <ConfettiMini />}
      {type === 'orange_rain' && <OrangeRainMini />}
      {type === 'citrus_explosion' && <CitrusExplosionMini />}
      {type === 'fireworks' && <FireworksMini />}
    </div>
  );
};
```

#### Confetti Preview
```css
.celebration-confetti {
  position: relative;
  overflow: hidden;
}

.celebration-confetti::before,
.celebration-confetti::after {
  content: '🎊';
  position: absolute;
  animation: confetti-fall 2s linear infinite;
}

.celebration-confetti::before {
  left: 20%;
  animation-delay: 0s;
}

.celebration-confetti::after {
  left: 60%;
  animation-delay: 0.5s;
}

@keyframes confetti-fall {
  0% { top: -20px; opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
```

#### Orange Rain Preview
```css
.celebration-orange_rain {
  position: relative;
  overflow: hidden;
}

.celebration-orange_rain::before,
.celebration-orange_rain::after {
  content: '🍊';
  position: absolute;
  font-size: 16px;
  animation: orange-fall 1.5s linear infinite;
}

.celebration-orange_rain::before {
  left: 30%;
  animation-delay: 0s;
}

.celebration-orange_rain::after {
  left: 70%;
  animation-delay: 0.3s;
}

@keyframes orange-fall {
  0% { top: -20px; opacity: 1; transform: rotate(0deg); }
  100% { top: 100%; opacity: 0; transform: rotate(360deg); }
}
```

#### Citrus Explosion Preview
```css
.celebration-citrus_explosion {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.celebration-citrus_explosion::before {
  content: '🍊';
  font-size: 24px;
  animation: explode 1.5s ease-out infinite;
}

@keyframes explode {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}
```

#### Fireworks Preview
```css
.celebration-fireworks {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.celebration-fireworks::before {
  content: '🎆';
  font-size: 32px;
  animation: firework-burst 2s ease-out infinite;
}

@keyframes firework-burst {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.5; }
}
```

---

### 4. Frames (Already Addressed in Previous Prompt)

See `/claude-specs/12-FIX-FRAMES-PROMPT.md` for frame fixes.

---

### 5. Backgrounds ✅

These look correct - they already show the actual gradient/pattern. No fix needed.

---

## Implementation Checklist

1. **Update ShopItemCard component** to detect category and render appropriate preview:

```tsx
const ShopItemCard: React.FC<{ item: ShopItem }> = ({ item }) => {
  const renderPreview = () => {
    switch (item.category) {
      case 'bigpulp_hat':
      case 'bigpulp_mood':
      case 'bigpulp_accessory':
        return <BigPulpPreview itemId={item.id} />;

      case 'title':
        return <TitlePreview title={item.name} rarity={item.rarity} />;

      case 'celebration':
        return <CelebrationPreview type={item.id} />;

      case 'frame':
        return <FramePreview frameClass={item.css_class} />;

      case 'background':
        return <BackgroundPreview bgClass={item.css_class} />;

      case 'name_effect':
        return <NameEffectPreview effectClass={item.css_class} />;

      case 'emoji_badge':
        return <EmojiPreview emoji={item.emoji} />;

      default:
        return <DefaultPreview />;
    }
  };

  return (
    <div className="shop-item-card">
      <div className="preview-area">
        {renderPreview()}
      </div>
      <h3>{item.name}</h3>
      <span className="price">🍊 {item.price_oranges.toLocaleString()}</span>
    </div>
  );
};
```

2. **Create preview components:**
   - `/src/components/Shop/previews/BigPulpPreview.tsx`
   - `/src/components/Shop/previews/TitlePreview.tsx`
   - `/src/components/Shop/previews/CelebrationPreview.tsx`
   - `/src/components/Shop/previews/FramePreview.tsx`
   - `/src/components/Shop/previews/NameEffectPreview.tsx`

3. **Add CSS for all preview animations**

4. **Update shop_items in database** to include `preview_emoji` field for BigPulp items (or use mapping in code)

## Expected Results

After fix:
- **BigPulp Hats:** Show 🎉🤠👨‍🍳🎩👑 etc. based on item
- **BigPulp Moods:** Show 😊😎😴🤩😤😵 etc. based on mood
- **BigPulp Accessories:** Show 🎀🎧🧐💎 etc. based on accessory
- **Titles:** Show the actual title text like "Winners Win!" or "King of the Grove"
- **Celebrations:** Show animated preview of confetti/oranges falling/explosion/fireworks
- **Frames:** Show unique frame effect (per previous fix)
- **Backgrounds:** Already working ✅
- **Name Effects:** Should show effect on sample text

Each item in the shop should be visually distinct and clearly communicate what you're buying.
