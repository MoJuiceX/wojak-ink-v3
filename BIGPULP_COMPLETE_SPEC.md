# Complete BigPulp Component Specification
## Everything Needed to Rebuild the BigPulp Character System

---

## Overview

The BigPulp component consists of:
1. **Background**: Orange Grove scene background image
2. **Two-Layer Character Animation**: Static base layer + moving character layer
3. **Speech Bubble**: Animated bubble that displays text above the character
4. **Dynamic Text**: Populates based on user search input (NFT ID)

---

## Component Structure

### Main Component: `BigPulpCharacter.tsx`

**Location**: `src/components/BigPulpCharacter.tsx`

**Props Interface**:
```typescript
interface BigPulpCharacterProps {
  message: string;              // Text to display in speech bubble
  isTyping?: boolean;          // Whether to animate text typing
  headTrait?: string;          // NFT head trait (determines character variant)
  onTypingComplete?: () => void; // Callback when typing animation completes
}
```

---

## 1. Background

### Background Image

**Path**: `/assets/wojak-layers/BACKGROUND/Scene/BACKGROUND_Orange Grove.png`

**CSS Implementation**:
```css
.bigpulp-character-container {
  background-image: url('/assets/wojak-layers/BACKGROUND/Scene/BACKGROUND_Orange Grove.png');
  background-size: cover;
  background-position: center;
  border-radius: 16px;
  overflow: visible;
  clip-path: inset(2% 0 10% 0 round 16px);
  min-height: 486px;
}
```

**Key Properties**:
- **Background Size**: `cover` (fills container, maintains aspect ratio)
- **Background Position**: `center` (centered horizontally and vertically)
- **Border Radius**: `16px` (rounded corners)
- **Clip Path**: `inset(2% 0 10% 0 round 16px)` (clips top 2%, bottom 10%, rounds corners)
- **Min Height**: `486px` (ensures minimum container height)

**Container Styling**:
```css
.bigpulp-character-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 120px 20px 10px 20px;
  position: relative;
}
```

**Padding Breakdown**:
- Top: `120px` (space for speech bubble)
- Left/Right: `20px`
- Bottom: `10px`

---

## 2. Two-Layer Character Animation

### Layer Structure

The character consists of **two separate image layers** stacked on top of each other:

1. **Layer 1 (Static Base)**: Feet/base that stays in place
2. **Layer 2 (Moving Character)**: Character variant that floats up and down

### Layer 1: Static Base

**Image Path**: `/assets/BigPulp/art/BigP_base.png`

**CSS Class**: `.bigpulp-layer-static`

**Implementation**:
```tsx
<img
  src="/assets/BigPulp/art/BigP_base.png"
  alt="BigPulp base"
  className="bigpulp-layer bigpulp-layer-static"
/>
```

**CSS**:
```css
.bigpulp-layer-static {
  z-index: 1;  /* Behind moving layer */
}
```

**Properties**:
- **Position**: Absolute (positioned within `.character-layers` container)
- **Z-index**: `1` (behind moving layer)
- **No Animation**: Stays completely still

### Layer 2: Moving Character

**Image Path**: Dynamic based on `headTrait` prop (see Character Variants section)

**CSS Class**: `.bigpulp-layer-moving`

**Implementation**:
```tsx
<img
  src={`/assets/BigPulp/art/${bigPulpImage}`}
  alt="BigPulp"
  className="bigpulp-layer bigpulp-layer-moving"
/>
```

**CSS**:
```css
.bigpulp-layer-moving {
  z-index: 2;  /* In front of static base */
  animation: float-gentle 3s ease-in-out infinite;
}
```

**Animation**:
```css
@keyframes float-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
```

**Animation Properties**:
- **Duration**: `3 seconds`
- **Timing Function**: `ease-in-out` (smooth acceleration/deceleration)
- **Iteration**: `infinite` (loops forever)
- **Movement**: Moves up `4px` at midpoint, returns to original position
- **Effect**: Gentle floating/bobbing motion

### Shared Layer Styles

Both layers share these base styles:

```css
.bigpulp-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom center;
}
```

**Properties**:
- **Position**: `absolute` (stacked on top of each other)
- **Size**: `100%` width and height (fills container)
- **Object Fit**: `contain` (maintains aspect ratio, fits within bounds)
- **Object Position**: `bottom center` (aligned to bottom, centered horizontally)

### Character Container

**Container Structure**:
```tsx
<div className="bigpulp-character">
  <div className="character-layers">
    {/* Layer 1: Static base */}
    <img className="bigpulp-layer bigpulp-layer-static" />
    {/* Layer 2: Moving character */}
    <img className="bigpulp-layer bigpulp-layer-moving" />
  </div>
</div>
```

**Container CSS**:
```css
.bigpulp-character {
  position: relative;
  width: 420px;
  height: 336px;
  margin-bottom: 50px;
}

.character-layers {
  position: relative;
  width: 100%;
  height: 100%;
}
```

**Responsive Sizing**:
```css
@media (max-width: 380px) {
  .bigpulp-character {
    width: 350px;
    height: 280px;
  }
}
```

---

## 3. Character Variants (Head Trait Mapping)

### Trait-to-Image Mapping

The character variant is determined by the NFT's `Head` trait:

**Mapping Object**:
```typescript
const HEAD_TO_BIGPULP: Record<string, string> = {
  'Crown': 'BigP_crown.png',
  'Clown': 'BigP_clown.png',
  'Military Beret': 'BigP_beret.png',
  'Viking Helmet': 'BigP_viking.png',
  'Tin Foil Hat': 'BigP_tin.png',
  'Super Wojak Hat': 'BigP_super_wojak.png',
  'Propeller Hat': 'BigP_propeller.png',
  'Fedora': 'BigP_Fedora.png',
};
```

**Wizard Hat Colors** (random selection):
```typescript
const WIZARD_COLORS = [
  'BigP_wiz_orange.png',
  'BigP_wiz_red.png',
  'BigP_wiz_pink.png',
  'BigP_wiz_blue.png',
  'BigP_wiz_yellow.png',
  'BigP_wiz_dark_blue.png',
];
```

**All Available Images** (for random fallback):
```typescript
const ALL_BIGPULP_IMAGES = [
  'BigP_crown.png',
  'BigP_clown.png',
  'BigP_beret.png',
  'BigP_viking.png',
  'BigP_tin.png',
  'BigP_super_wojak.png',
  'BigP_propeller.png',
  'BigP_Fedora.png',
  ...WIZARD_COLORS,  // All 6 wizard colors
];
```

### Selection Logic

```typescript
const bigPulpImage = useMemo(() => {
  if (!headTrait) {
    // No trait provided - pick random
    return ALL_BIGPULP_IMAGES[Math.floor(Math.random() * ALL_BIGPULP_IMAGES.length)];
  }

  // Check for Wizard Hat - pick random wizard color
  if (headTrait === 'Wizard Hat') {
    return WIZARD_COLORS[Math.floor(Math.random() * WIZARD_COLORS.length)];
  }

  // Check for direct match
  if (HEAD_TO_BIGPULP[headTrait]) {
    return HEAD_TO_BIGPULP[headTrait];
  }

  // No match - pick random
  return ALL_BIGPULP_IMAGES[Math.floor(Math.random() * ALL_BIGPULP_IMAGES.length)];
}, [headTrait]);
```

**Logic Flow**:
1. If no `headTrait` provided → Random selection from all images
2. If `headTrait === 'Wizard Hat'` → Random wizard color
3. If direct match in `HEAD_TO_BIGPULP` → Use mapped image
4. If no match → Random selection from all images

**Image Path Construction**:
```typescript
const characterImagePath = `/assets/BigPulp/art/${bigPulpImage}`;
```

---

## 4. Speech Bubble

### Bubble Structure

```tsx
<div className={`speech-bubble ${displayedText ? 'visible' : ''} ${hasOverflow ? 'has-overflow' : ''}`}>
  <div className="speech-content" ref={contentRef}>
    {displayedText}
    {isAnimatingText && <span className="typing-cursor">|</span>}
  </div>
  <div className="speech-tail" />
</div>
```

### Bubble Styling

**Base Styles**:
```css
.speech-bubble {
  background: white;
  border-radius: 20px;
  padding: 16px 20px;
  width: calc(100% - 30px);
  max-width: 400px;
  min-height: 60px;
  max-height: 180px;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) scale(0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 5;
  overflow: hidden;
}
```

**Key Properties**:
- **Background**: White (`#ffffff`)
- **Border Radius**: `20px` (rounded corners)
- **Padding**: `16px 20px` (vertical, horizontal)
- **Width**: `calc(100% - 30px)` (responsive, with margins)
- **Max Width**: `400px` (desktop limit)
- **Min Height**: `60px`
- **Max Height**: `180px` (scrollable if content exceeds)
- **Position**: `absolute`, `top: 20px`, centered horizontally
- **Initial State**: `opacity: 0`, `scale(0.8)` (hidden and smaller)
- **Z-index**: `5` (above character, below other UI)

### Visibility Animation

**Visible State**:
```css
.speech-bubble.visible {
  opacity: 1;
  transform: translateX(-50%) scale(1);
  animation: float-bubble 6s ease-in-out infinite;
}
```

**Transition**: `0.3s cubic-bezier(0.34, 1.56, 0.64, 1)` (bouncy ease-out)

**Float Animation**:
```css
@keyframes float-bubble {
  0%, 100% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
  25% {
    transform: translateX(calc(-50% + 3px)) translateY(4px) scale(1);
  }
  50% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
  75% {
    transform: translateX(calc(-50% - 3px)) translateY(4px) scale(1);
  }
}
```

**Float Properties**:
- **Duration**: `6 seconds`
- **Effect**: Gentle floating motion (moves 3px left/right, 4px up/down)
- **Pattern**: Circular/elliptical motion

### Speech Tail (Pointer)

**Tail Element**:
```tsx
<div className="speech-tail" />
```

**CSS**:
```css
.speech-tail {
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 20px solid white;
}
```

**Properties**:
- **Position**: `absolute`, `bottom: -15px` (extends below bubble)
- **Centered**: `left: 50%`, `translateX(-50%)`
- **Shape**: CSS triangle (pointing down)
- **Size**: `30px` wide (15px + 15px), `20px` tall
- **Color**: White (matches bubble)

### Content Area

**Content Container**:
```css
.speech-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  text-align: center;
  max-height: 148px;
  overflow-y: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}
```

**Properties**:
- **Font**: System font stack (native look)
- **Font Size**: `14px`
- **Line Height**: `1.5` (150%)
- **Color**: `#333` (dark gray)
- **Text Align**: `center`
- **Max Height**: `148px` (allows scrolling)
- **Overflow**: `auto` (scrollable when content exceeds)
- **Smooth Scrolling**: `-webkit-overflow-scrolling: touch` (iOS momentum)

### Overflow Indicator

**Fade Gradient** (shows when scrollable):
```css
.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: 16px;
  left: 20px;
  right: 20px;
  height: 24px;
  background: linear-gradient(transparent, white);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.speech-bubble.has-overflow::after {
  opacity: 1;
}
```

**Effect**: White gradient fade at bottom when content is scrollable

### Typing Cursor

**Cursor Element**:
```tsx
{isAnimatingText && <span className="typing-cursor">|</span>}
```

**CSS**:
```css
.typing-cursor {
  animation: blink 0.7s infinite;
  color: var(--ion-color-primary);
  font-weight: bold;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

**Properties**:
- **Character**: `|` (vertical bar)
- **Animation**: Blinks every `0.7 seconds`
- **Color**: Primary theme color
- **Weight**: `bold`

### Responsive Speech Bubble

```css
@media (max-width: 380px) {
  .speech-bubble {
    max-width: 280px;
    padding: 12px 16px;
  }

  .speech-content {
    font-size: 14px;
  }
}
```

---

## 5. Text Population from Search

### Text Source Flow

1. **User Input**: Enters NFT ID in search bar
2. **Search Trigger**: Auto-searches when 4 digits entered, or manual search
3. **Data Lookup**: Fetches NFT analysis, takes, and metadata
4. **Message Generation**: Creates sentence from multiple sources
5. **Props Passed**: `message` prop sent to `BigPulpCharacter`
6. **Typing Animation**: Text types out character-by-character
7. **Display**: Text appears in speech bubble

### Search Implementation

**Location**: `src/pages/BigPulp.tsx`

**Search Handler**:
```typescript
const handleSearch = (directValue?: string) => {
  const searchValue = directValue || nftId;
  const id = parseInt(searchValue, 10);
  
  if (isNaN(id) || id < 1 || id > 4200) {
    setError('Enter a valid NFT ID (1-4200)');
    return;
  }

  setLoading(true);
  setIsTyping(true);

  setTimeout(() => {
    const nftAnalysis = analysisData?.[String(id)];
    const nftTake = takesData?.[String(id)];
    const nftDidYouKnow = didYouKnowData?.[String(id)];

    if (!nftAnalysis) {
      setError(`No data for NFT #${id}`);
      return;
    }

    setSearchedNftId(id);
    setAnalysis(nftAnalysis);
    setCurrentTake(nftTake || null);
    setCurrentDidYouKnow(nftDidYouKnow?.didYouKnow || null);

    // Get head trait from metadata
    const nftMetadata = metadataList?.[id - 1];
    const headAttr = nftMetadata?.attributes?.find(attr => attr.trait_type === 'Head');
    setCurrentHeadTrait(headAttr?.value);

    // Generate message (priority order)
    if (nftTake?.take) {
      setSentence(nftTake.take);
    } else if (nftAnalysis.highlight) {
      setSentence(nftAnalysis.highlight);
    } else {
      setSentence(`This is Wojak #${id}. Ranked #${nftAnalysis.rank} out of 4200.`);
    }

    setLoading(false);
  }, 300);
};
```

### Message Priority

The `sentence` state is set in this priority order:

1. **NFT Take** (`nftTake.take`): From `nft_takes_v2.json` - personalized commentary
2. **Analysis Highlight** (`nftAnalysis.highlight`): From `all_nft_analysis.json` - key insight
3. **Fallback**: Generic message with rank info

### Data Sources

**Files Loaded**:
```typescript
const [analysisRes, takesRes, didYouKnowRes, metadataRes, combosRes] = await Promise.all([
  fetch('/assets/BigPulp/all_nft_analysis.json'),      // Analysis data
  fetch('/assets/BigPulp/nft_takes_v2.json'),         // BigPulp takes/comments
  fetch('/assets/BigPulp/bigP_Didyouknow/did_you_know.json'), // Did you know facts
  fetch('/assets/nft-data/metadata.json'),             // NFT metadata (traits)
  fetch('/assets/BigPulp/combos_badges.json')          // Combo badges
]);
```

**Data Structure**:
- **Analysis**: `Record<string, NFTAnalysis>` - Keyed by NFT ID string
- **Takes**: `Record<string, NFTTakeV2>` - Keyed by NFT ID string
- **Did You Know**: `Record<string, DidYouKnow>` - Keyed by NFT ID string
- **Metadata**: `NFTMetadata[]` - Array, index = NFT ID - 1

### Component Integration

**BigPulpCharacter Usage**:
```tsx
<BigPulpCharacter
  message={sentence || welcomeMessage}
  isTyping={isTyping && !!sentence}
  headTrait={currentHeadTrait}
  onTypingComplete={handleTypingComplete}
/>
```

**Props Breakdown**:
- **message**: `sentence` (from search) or `welcomeMessage` (default)
- **isTyping**: `true` when typing animation should play
- **headTrait**: `currentHeadTrait` (from NFT metadata)
- **onTypingComplete**: Callback to stop typing state

**Welcome Message**:
```typescript
const welcomeMessage = "Yo! I'm BigPulp. Drop an NFT ID and I'll give you the real talk on what you're looking at. 🍊";
```

### Typing Animation

**Implementation**:
```typescript
useEffect(() => {
  if (!message) {
    setDisplayedText('');
    return;
  }

  if (isTyping) {
    setIsAnimatingText(true);
    setDisplayedText('');
    let index = 0;
    const typingSpeed = 20; // ms per character

    const timer = setInterval(() => {
      if (index < message.length) {
        setDisplayedText(message.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsAnimatingText(false);
        onTypingComplete?.();
      }
    }, typingSpeed);

    return () => clearInterval(timer);
  } else {
    setDisplayedText(message);
    setIsAnimatingText(false);
  }
}, [message, isTyping, onTypingComplete]);
```

**Typing Properties**:
- **Speed**: `20ms` per character
- **Method**: `setInterval` that increments character index
- **Display**: `message.slice(0, index + 1)` (shows progressively more characters)
- **Completion**: Calls `onTypingComplete()` when done

### Overflow Detection

**Check for Scrollable Content**:
```typescript
useEffect(() => {
  const el = contentRef.current;
  if (el) {
    setHasOverflow(el.scrollHeight > el.clientHeight);
  }
}, [displayedText]);
```

**Effect**: Adds `has-overflow` class when content exceeds max height, shows fade gradient

---

## Complete File Structure

### Required Files

```
src/
  components/
    BigPulpCharacter.tsx      # Main component
    BigPulpCharacter.css      # Component styles

public/
  assets/
    BigPulp/
      art/
        BigP_base.png         # Static base layer
        BigP_crown.png        # Character variants
        BigP_clown.png
        BigP_beret.png
        BigP_viking.png
        BigP_tin.png
        BigP_super_wojak.png
        BigP_propeller.png
        BigP_Fedora.png
        BigP_wiz_orange.png   # Wizard variants
        BigP_wiz_red.png
        BigP_wiz_pink.png
        BigP_wiz_blue.png
        BigP_wiz_yellow.png
        BigP_wiz_dark_blue.png
    wojak-layers/
      BACKGROUND/
        Scene/
          BACKGROUND_Orange Grove.png  # Background image
```

### Data Files (for text population)

```
public/
  assets/
    BigPulp/
      all_nft_analysis.json      # NFT analysis data
      nft_takes_v2.json          # BigPulp commentary
      bigP_Didyouknow/
        did_you_know.json        # Did you know facts
    nft-data/
      metadata.json              # NFT metadata (traits)
```

---

## Complete CSS Reference

### Container Styles

```css
.bigpulp-character-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 120px 20px 10px 20px;
  position: relative;
  background-image: url('/assets/wojak-layers/BACKGROUND/Scene/BACKGROUND_Orange Grove.png');
  background-size: cover;
  background-position: center;
  border-radius: 16px;
  overflow: visible;
  clip-path: inset(2% 0 10% 0 round 16px);
  min-height: 486px;
}
```

### Character Layers

```css
.bigpulp-character {
  position: relative;
  width: 420px;
  height: 336px;
  margin-bottom: 50px;
}

.character-layers {
  position: relative;
  width: 100%;
  height: 100%;
}

.bigpulp-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom center;
}

.bigpulp-layer-static {
  z-index: 1;
}

.bigpulp-layer-moving {
  z-index: 2;
  animation: float-gentle 3s ease-in-out infinite;
}

@keyframes float-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
```

### Speech Bubble

```css
.speech-bubble {
  background: white;
  border-radius: 20px;
  padding: 16px 20px;
  width: calc(100% - 30px);
  max-width: 400px;
  min-height: 60px;
  max-height: 180px;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) scale(0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 5;
  overflow: hidden;
}

.speech-bubble.visible {
  opacity: 1;
  transform: translateX(-50%) scale(1);
  animation: float-bubble 6s ease-in-out infinite;
}

@keyframes float-bubble {
  0%, 100% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
  25% {
    transform: translateX(calc(-50% + 3px)) translateY(4px) scale(1);
  }
  50% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
  75% {
    transform: translateX(calc(-50% - 3px)) translateY(4px) scale(1);
  }
}

.speech-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  text-align: center;
  max-height: 148px;
  overflow-y: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.speech-tail {
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 20px solid white;
}

.typing-cursor {
  animation: blink 0.7s infinite;
  color: var(--ion-color-primary);
  font-weight: bold;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

---

## Integration Example

### Usage in BigPulp Page

```tsx
import BigPulpCharacter from '../components/BigPulpCharacter';

const BigPulp: React.FC = () => {
  const [sentence, setSentence] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentHeadTrait, setCurrentHeadTrait] = useState<string | undefined>();

  // After search completes:
  <BigPulpCharacter
    message={sentence || welcomeMessage}
    isTyping={isTyping && !!sentence}
    headTrait={currentHeadTrait}
    onTypingComplete={() => setIsTyping(false)}
  />
};
```

---

## Summary

This specification contains everything needed to rebuild the BigPulp component:

1. **Background**: Orange Grove image with specific CSS properties
2. **Two Layers**: Static base + animated character layer with float animation
3. **Speech Bubble**: White bubble with tail, floating animation, scrollable content
4. **Text Population**: Dynamic text from search, typing animation, overflow handling
5. **Character Variants**: Head trait mapping to different character images
6. **Responsive Design**: Mobile breakpoints and sizing adjustments

All timing values, CSS properties, animation keyframes, and data flow are documented for complete reconstruction.
