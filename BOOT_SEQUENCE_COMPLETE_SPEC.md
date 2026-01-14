# Complete Boot Sequence Specification
## Everything Needed to Rebuild Boot Sequences 0, 1, and 2

---

## Overview

The boot sequence consists of **three sequential stages**:

- **Boot Sequence 0 (boot0)**: Terminal-style boot text with character-by-character typing animation
- **Boot Sequence 1 (boot1)**: Orange logo screen with pulsing animation  
- **Boot Sequence 2 (boot2)**: Loading bar with progress animation

All three sequences play audio with specific timing and fade rules.

---

## File Structure

```
src/
  components/
    BootSequence.tsx          # Boot Sequence 0 implementation
    BootSequence.css          # Boot Sequence 0 styles
    StartupSequence.tsx       # Boot Sequences 1 & 2 implementation
    StartupSequence.css       # Boot Sequences 1 & 2 styles

public/
  assets/
    BootUp/
      PC-boot.mp3            # Audio for boot0
      Ps1-startup.mp3        # Audio for boot1
```

---

## Boot Sequence 0: Terminal Boot Text

### Component: `BootSequence.tsx`

**Purpose**: Displays terminal-style boot text with typing animation

**Key Features**:
- Character-by-character typing animation
- Green text for completed lines, red for typing lines
- Blinking cursor on current line
- Auto-scrolling container
- Click prompt overlay (required for audio)
- Cannot be skipped

### Boot Text Content (`TANGY_BOOT_LINES`)

```typescript
export const TANGY_BOOT_LINES = [
  "CitrusBIOS v1.369 (JuiceBuild)",
  "© 2023–2026 Orange Labs",
  "",
  "Checking PULP integrity .............. OK",
  "CPU : Tangium™ 133MHz",
  "RAM : 65536K JUICE",
  "Video : VGA (Grapefruit Adapter) ..... OK",
  "Keyboard : Clicky-Mechanical ......... OK",
  "Mouse : CitrusTrack v2.1 ............. OK",
  "",
  "Detecting storange of value...",
  "  Primary Master : ORANGE_CITRUS ..... OK",
  "  Primary Slave  : PEEL_DRIVE ........ OK",
  "  Secondary Master : PULP_CACHE ...... OK",
  "  Accepting Cookies  : <true>",
  "",
  "Loading boot sector...",
  "Peel to peel : TANGBOOT.SYS .......... OK",
  "Unpacking kernel : CITRUSKERNEL.95 ... OK",
  "",
  ">> Mounting Orange Grove...",
  "Mount /WMC Server ................... OK",
  "Mount /tanggang ..................... OK",
  "Mount /hoamis ....................... OK",
  "",
  "Initializing drivers...",
  "  peel.sys     (peel protection) .... OK",
  "  pulp.sys     (pulp acceleration) .. OK",
  "  zest.sys     (zest rendering) ..... OK",
  "  squeeze.sys  (juice compression) .. OK",
  "  drip.sys     (liquidity routing) .. OK",
  "",
  "Networking...",
  "  DHCP : requesting fresh IP ........ OK",
  "  DNS  : ROYAL.CLUB ................ OK",
  "  NTP  : syncing to Orange Standard . OK",
  "",
  "Tang Guard Security...",
  "  TangGang handshake .............. PIIP",
  "  Hex Orange Address............. ENABLED",
  "",
  "Starting graphical shell...",
  "Launching ORANGE.EXE ................ OK",
  "Warming up the grove... please wait...",
  "",
  "READY: Storange of Value Initiated 🍊",
]
```

### Timing Rules for Boot Sequence 0

- **Typing Speed**: `10ms` per character (configurable via `typingSpeed` prop, default: 10)
- **Empty Line Delay**: `29ms` (15% longer than original 25ms)
- **Delay Between Lines**: `15ms` (15% longer than original 13ms)
- **End Pause**: `100ms` before fade starts
- **Fade Out Duration**: `200ms` (JavaScript delay), CSS animation: `2.5s` (bootFadeOut)
- **Max Visible Lines**: `18` lines (scrolls to show latest)

### Audio Rules for Boot Sequence 0

**File**: `/assets/BootUp/PC-boot.mp3`

- **Volume**: `0.11` (11% via Web Audio API gain node)
- **Playback Rate**: `0.8` (20% slower than original)
- **Start Time**: Plays immediately when user clicks to start
- **Audio Setup**: Uses Web Audio API with gain node for precise control
- **Fade Out**: Starts when boot1 (logo) appears (see Boot Sequence 1 section)

**Web Audio API Setup**:
```typescript
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const bootAudio = new Audio('/assets/BootUp/PC-boot.mp3')
bootAudio.playbackRate = 0.8

// Create gain node for volume control
const source = audioContext.createMediaElementSource(bootAudio)
const gainNode = audioContext.createGain()
gainNode.gain.value = 0.11  // 11% volume
source.connect(gainNode)
gainNode.connect(audioContext.destination)

// Store references for later fade control
bootAudio._gainNode = gainNode
bootAudio._audioContext = audioContext
```

### Click Prompt

**Z-index**: `10000000` (highest)

**Content**:
- Title: `ℹ️`
- Message: `"Tap for the Full Immersive Experience"`
- Subtitle: `"Audio playback requires user interaction."`

**Styling**: Orange box with Windows 95-style border

### Visual Styling

- **Background**: Black (`#000`)
- **Font**: `'Fixedsys', 'Terminal', 'MS Sans Serif', 'Courier New', monospace`
- **Font Size**: `20px`
- **Line Height**: `1.6`
- **Completed Lines**: Green (`#00ff00`) with subtle glitch animation
- **Typing Lines**: Red (`#ff0000`) with subtle glitch animation
- **Cursor**: Green blinking underscore (`_`)
- **Container**: Max width `800px`, auto-scrolling, green scrollbar

---

## Boot Sequence 1: Logo Screen

### Component: `StartupSequence.tsx` (logo stage)

**Purpose**: Displays orange logo with pulsing animation

**Key Features**:
- Orange emoji (🍊) with pulsing animation
- "Tang Gang" text with pulsing animation
- Orange gradient background with red vignette overlay
- Pixelated scanline effect
- Subtitle: "WOJAK_FARMERS_PLOT.EXE" (pulsing)
- PS1 startup audio plays

### Timing Rules for Boot Sequence 1

- **Transition Delay**: `200ms` after boot0 completes
- **Logo Display Duration**: `3439ms` (15% longer than original 2990ms)
- **Fade Out Duration**: `2579ms` (15% longer than original 2243ms)
- **Total Duration**: `3439ms + 2579ms = 6018ms` (~6 seconds)

### Audio Rules for Boot Sequence 1

**File**: `/assets/BootUp/Ps1-startup.mp3`

- **Volume**: `0.11` (11% via Web Audio API gain node)
- **Start Time**: `0.5 seconds` (skips first 0.5 seconds of audio)
- **Start Trigger**: Plays when logo stage begins (right after boot0 fade)
- **Audio Setup**: Pre-created during user click in BootSequence component

**Web Audio API Setup** (created during click in BootSequence):
```typescript
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const ps1Audio = new Audio('/assets/BootUp/Ps1-startup.mp3')

// Create gain node
const source = audioContext.createMediaElementSource(ps1Audio)
const gainNode = audioContext.createGain()
gainNode.gain.value = 0.11  // 11% volume
source.connect(gainNode)
gainNode.connect(audioContext.destination)

// Store references
ps1Audio._gainNode = gainNode
ps1Audio._audioContext = audioContext
```

**PC-boot Audio Fade Out** (starts when boot1 begins):
- **Fade Method**: Web Audio API exponential + linear ramp
- **Start Volume**: `0.11`
- **Exponential Ramp**: `11 seconds` to `0.00001` (-100dB)
- **Linear Ramp**: `2 seconds` to `0` (complete silence)
- **Total Fade Duration**: `13 seconds`

```typescript
const gainNode = bootAudio._gainNode
const currentTime = gainNode.context.currentTime
gainNode.gain.setValueAtTime(0.11, currentTime)
gainNode.gain.exponentialRampToValueAtTime(0.00001, currentTime + 11)
gainNode.gain.linearRampToValueAtTime(0, currentTime + 13)
```

### Visual Styling

**Background**:
- Base: Orange gradient (`#ffaa00` to `#ff7700`)
- Overlay: Red vignette (radial gradient from red center to black edges)
- Pixelated scanline pattern (repeating linear gradients)

**Logo**:
- Emoji: `80px` (mobile) / `120px` (desktop), orange glow, pulsing scale (1.0 to 1.1)
- Text: `36px` (mobile) / `64px` (desktop), color `#cc4400`, bold, black text shadow
- Animation: `textPulse` (2s ease-in-out infinite)
- Margin: Emoji `-40px` top (mobile), Text `100px` top (mobile) / `150px` (desktop)

**Subtitle**:
- Text: `"WOJAK_FARMERS_PLOT.EXE"`
- Size: `16px` (mobile) / `24px` (desktop)
- Color: `#c0c0c0`
- Position: Fixed center, `70px` below center
- Animation: Pulsing (stops when boot2 starts)

**Z-index**: `99999999` (subtitle), `3` (logo content)

---

## Boot Sequence 2: Loading Bar

### Component: `StartupSequence.tsx` (loading stage)

**Purpose**: Displays loading bar with progress animation

**Key Features**:
- Progress bar from 0% to 100%
- Orange blocks that appear as progress increases
- "Starting Tang Gang OS..." text
- "🍊 Orange Grove 🍊" header
- Copyright text at bottom
- Subtitle continues (stops pulsing)
- Both audios fade out during this stage

### Timing Rules for Boot Sequence 2

- **Transition Delay**: `100ms` after boot1 fade completes
- **Progress Increment**: `2%` per step (0, 2, 4, 6, ... 100)
- **Increment Delay**: `99ms` per step (15% longer than original 86ms)
- **Total Steps**: `51` steps (0 to 100 in increments of 2)
- **Total Duration**: `51 × 99ms = 5049ms` (~5 seconds)
- **PS1 Fade Start**: At `10%` progress (`~990ms` into loading)
- **PS1 Fade Duration**: `5500ms` (very long fade for obvious effect)
- **Final Fade Duration**: `1500ms` after loading completes

### Audio Rules for Boot Sequence 2

**PS1 Audio Fade Out**:
- **Start Trigger**: When progress reaches `10%`
- **Fade Method**: `requestAnimationFrame` with linear interpolation
- **Start Volume**: `0.11`
- **Fade Duration**: `5500ms` (~5.5 seconds)
- **End Action**: Pause and reset to `currentTime = 0`

```typescript
// Start fade at 10% progress
if (i >= 10 && !ps1FadeStarted) {
  ps1FadeStarted = true
  const ps1FadeOutDuration = 5500
  const startTime = Date.now()
  
  const fadeOutPs1 = () => {
    const elapsed = Date.now() - startTime
    const prog = Math.min(elapsed / ps1FadeOutDuration, 1)
    const gainNode = ps1Audio._gainNode
    if (gainNode) {
      gainNode.gain.value = 0.11 * (1 - prog)
    }
    if (prog < 1) {
      requestAnimationFrame(fadeOutPs1)
    } else {
      ps1Audio.pause()
      ps1Audio.currentTime = 0
    }
  }
  fadeOutPs1()
}
```

**PC-boot Audio**: Already fading from boot1 (13-second fade continues)

### Visual Styling

**Background**: Black (`#000`)

**Header**:
- Text: `"🍊 Orange Grove 🍊"`
- Size: `28px` text / `36px` emoji (mobile) / `48px` text / `64px` emoji (desktop)
- Color: `#ff6600`
- Position: Top center, `80px` margin-top (mobile)

**Loading Container**:
- Text: `"Starting Tang Gang OS..."`
- Size: `14px`
- Color: `#c0c0c0`

**Progress Bar**:
- Width: `100%` with `max-width: 295px` (mobile) / `350px` (desktop)
- Height: `20px` (mobile) / `24px` (desktop)
- Border: Windows 95-style (`#808080 #ffffff #ffffff #808080`)
- Background: Black
- Blocks: Orange (`#ff6600`), `10px` (mobile) / `11px` (desktop) wide, `2px` gap
- Block Count: `Math.floor(progress / (isDesktop ? 3.7 : 4.0))`
  - Desktop: ~27 blocks at 100%
  - Mobile: ~25 blocks at 100%

**Subtitle**:
- Same as boot1 but stops pulsing (`.no-pulse` class)
- Fades out with loading screen

**Copyright**:
- Text: `"© 2024 Tang Gang. All rights reserved."`
- Size: `11px`
- Color: `#808080`
- Position: Bottom center

---

## Complete Sequence Flow

### Stage Transitions

1. **Initial State**: Click prompt overlay visible
2. **User Clicks**: 
   - Click prompt disappears
   - Boot Sequence 0 starts
   - PC-boot audio starts playing
   - PS1 audio is pre-created (but not played)
3. **Boot Sequence 0 Completes**:
   - Fade out animation (200ms)
   - `onDone()` callback triggers
4. **Boot Sequence 1 Starts** (200ms delay):
   - Logo appears
   - PC-boot audio fade out begins (13-second exponential+linear fade)
   - PS1 audio starts playing (skips first 0.5 seconds)
   - Logo displays for 3439ms
   - Logo fades out for 2579ms
5. **Boot Sequence 2 Starts** (100ms delay):
   - Loading screen appears
   - Progress bar animates (0% to 100% in 99ms increments)
   - At 10% progress: PS1 audio fade out begins (5.5 seconds)
   - Loading completes
6. **Final Fade** (1500ms):
   - Loading screen fades out
   - Both audios complete their fade outs
   - `onComplete()` callback triggers
   - Main app content appears

### Total Duration

- **Boot Sequence 0**: Variable (depends on text length, ~15-20 seconds)
- **Boot Sequence 1**: `6018ms` (~6 seconds)
- **Boot Sequence 2**: `5049ms` (~5 seconds)
- **Final Fade**: `1500ms` (~1.5 seconds)
- **Total**: ~27-32 seconds (plus boot0 typing time)

---

## CSS Specifications

### BootSequence.css

**Key Styles**:

```css
/* Main container */
.boot-sequence {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 9999999;
  font-family: 'Fixedsys', 'Terminal', 'MS Sans Serif', 'Courier New', monospace;
  animation: bootFadeIn 0.5s ease-out;
}

.boot-sequence.fade-out {
  animation: bootFadeOut 2.5s ease-in-out forwards;
}

/* Click prompt */
.boot-click-prompt {
  z-index: 10000000;
  background: rgba(0, 0, 0, 0.5);
  padding-bottom: 80px;
}

.boot-click-prompt-content {
  background: #ffaa00;
  border: 2px solid;
  border-color: #ffffff #cc7700 #cc7700 #ffffff;
  padding: 20px 30px;
  max-width: 400px;
}

/* Container - responsive font sizes */
.boot-sequence-container {
  max-width: 100%;
  max-height: 80vh;
  font-size: 15px; /* Mobile default */
  padding: 8px;
  margin-top: -50px;
}

@media (min-width: 400px) {
  .boot-sequence-container {
    font-size: 16px;
    padding: 12px;
  }
}

@media (min-width: 480px) {
  .boot-sequence-container {
    font-size: 13px;
    padding: 16px;
  }
}

@media (min-width: 768px) {
  .boot-sequence-container {
    font-size: 18px;
    padding: 20px;
    max-width: 800px;
  }
}

/* Text colors */
.boot-line-complete {
  color: #00ff00; /* Green */
  animation: bootGlitch 0.5s infinite;
}

.boot-line-typing {
  color: #ff0000; /* Red */
  animation: bootGlitch 0.4s infinite;
}

.boot-cursor-blink {
  color: #00ff00;
  animation: bootCursorBlink 1s step-end infinite;
}
```

**Note**: Fade out duration is `2.5s` (not 0.8s as mentioned in some code comments).

### StartupSequence.css

**Key Styles**:

```css
/* Main container */
.startup-sequence {
  position: fixed;
  z-index: 9999999;
  background: #000;
}

.startup-sequence.fade-out-black {
  animation: fadeToWebsite 1.5s ease-in-out forwards;
}

/* Logo screen */
.startup-logo-screen {
  background: linear-gradient(180deg, #ffaa00 0%, #ff7700 100%);
  animation: startupFadeIn 2.5s ease-in-out, orangePulse 2s ease-in-out infinite;
  /* Red vignette overlay via ::after */
  /* Pixelated scanline pattern via ::after */
}

.startup-logo-emoji {
  font-size: 80px; /* Mobile */
  margin-top: -40px;
}

@media (min-width: 480px) {
  .startup-logo-emoji {
    font-size: 120px;
  }
}

.startup-logo-text {
  font-size: 36px; /* Mobile */
  margin-top: 100px;
  color: #cc4400;
}

@media (min-width: 480px) {
  .startup-logo-text {
    font-size: 64px;
    margin-top: 150px;
  }
}

/* Loading screen */
.startup-loading-screen {
  background: #000;
  padding: 40px 20px;
}

.startup-logo-small {
  font-size: 28px; /* Mobile */
  margin-top: 80px;
}

@media (min-width: 480px) {
  .startup-logo-small {
    font-size: 48px;
  }
}

.startup-logo-small span {
  font-size: 36px; /* Mobile */
}

@media (min-width: 480px) {
  .startup-logo-small span {
    font-size: 64px;
  }
}

.startup-progress-bar {
  width: 100%;
  max-width: 295px; /* Mobile */
  height: 20px; /* Mobile */
}

@media (min-width: 480px) {
  .startup-progress-bar {
    max-width: 350px;
    height: 24px;
  }
}

.startup-progress-block {
  width: 10px; /* Mobile */
}

@media (min-width: 480px) {
  .startup-progress-block {
    width: 11px;
  }
}

.startup-loading-text {
  font-size: 12px; /* Mobile */
}

@media (min-width: 480px) {
  .startup-loading-text {
    font-size: 14px;
  }
}

.startup-loading-subtitle {
  font-size: 16px; /* Mobile */
}

@media (min-width: 480px) {
  .startup-loading-subtitle {
    font-size: 24px;
  }
}

/* Subtitle */
.startup-logo-subtitle-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% + 70px));
  z-index: 99999999;
}
```

**Responsive Breakpoint**: `480px` (mobile vs desktop)

---

## Integration in App

### App.tsx Integration

```typescript
import StartupSequence from './components/StartupSequence'

const [isStartupComplete, setIsStartupComplete] = useState(false)

// In JSX:
{!isStartupComplete && (
  <StartupSequence onComplete={() => setIsStartupComplete(true)} />
)}

{/* Main app content - hidden until startup completes */}
<div style={{ 
  opacity: isStartupComplete ? 1 : 0, 
  pointerEvents: isStartupComplete ? 'auto' : 'none',
  transition: 'opacity 0.3s ease-in',
  visibility: isStartupComplete ? 'visible' : 'hidden'
}}>
  {/* Main app content */}
</div>
```

---

## Audio File Requirements

### PC-boot.mp3
- **Path**: `/assets/BootUp/PC-boot.mp3`
- **Usage**: Boot Sequence 0
- **Duration**: Should be long enough to play during entire boot0 + fade (recommended: 30+ seconds)
- **Format**: MP3

### Ps1-startup.mp3
- **Path**: `/assets/BootUp/Ps1-startup.mp3`
- **Usage**: Boot Sequence 1
- **Duration**: Should be long enough for boot1 + boot2 fade (recommended: 15+ seconds)
- **Format**: MP3
- **Note**: First 0.5 seconds are skipped

---

## Critical Implementation Details

### 1. Web Audio API Usage

**Why Web Audio API?**
- Allows volume below 0dB (HTML5 Audio volume is clamped to 0-1)
- Smooth exponential/linear ramping for professional fades
- No clicks or pops during fade transitions

**Key Pattern**:
```typescript
// Create once during user interaction
const audioContext = new AudioContext()
const audio = new Audio('/path/to/audio.mp3')
const source = audioContext.createMediaElementSource(audio)
const gainNode = audioContext.createGain()
gainNode.gain.value = 0.11
source.connect(gainNode)
gainNode.connect(audioContext.destination)

// Store for later access
audio._gainNode = gainNode
```

### 2. Audio Fade Timing

**PC-boot Audio**:
- Starts: Boot Sequence 0 begins
- Fade Starts: Boot Sequence 1 begins (logo appears)
- Fade Duration: 13 seconds (11s exponential + 2s linear)
- Ends: During Boot Sequence 2

**PS1 Audio**:
- Starts: Boot Sequence 1 begins (logo appears)
- Fade Starts: Boot Sequence 2 at 10% progress
- Fade Duration: 5.5 seconds
- Ends: Near end of Boot Sequence 2

### 3. User Interaction Requirement

**Critical**: Audio cannot play without user interaction due to browser autoplay policies.

**Solution**: Click prompt overlay that:
1. Appears first (highest z-index)
2. Blocks all interaction until clicked
3. Triggers audio creation and playback
4. Pre-creates PS1 audio during click (for later use)

### 4. Responsive Design

**Loading Bar Block Count**:
- Desktop (`width >= 480px`): `progress / 3.7` blocks
- Mobile (`width < 480px`): `progress / 4.0` blocks

**Font Sizes**: Fixed (not responsive)

### 5. Z-index Hierarchy

- Click Prompt: `10000000`
- Subtitle: `99999999`
- Startup Sequence: `9999999`
- Logo Content: `3`
- Main App: `1` (after startup)

---

## Testing Checklist

- [ ] Click prompt appears first
- [ ] After click, boot text types character-by-character
- [ ] PC-boot.mp3 plays during boot0
- [ ] Boot0 fades out smoothly
- [ ] Logo screen appears with orange emoji
- [ ] PS1-startup.mp3 plays when logo appears (skips first 0.5s)
- [ ] PC-boot audio begins fading when logo appears
- [ ] Logo displays for 3439ms, then fades for 2579ms
- [ ] Loading bar appears and animates 0-100%
- [ ] PS1 audio begins fading at 10% progress
- [ ] Both audios complete fade out during loading
- [ ] Final fade to website is smooth (black background maintained)
- [ ] Main app content appears after startup completes
- [ ] No audio clicks or pops during fades
- [ ] Subtitle pulses during boot1, stops during boot2
- [ ] Progress bar blocks appear correctly (desktop vs mobile)

---

## Summary

This specification contains **everything** needed to rebuild the boot sequences:

1. **Complete source code** structure and logic
2. **Exact timing values** for all delays and animations
3. **Audio specifications** including Web Audio API setup
4. **Visual styling** with exact colors, sizes, and animations
5. **Sequence flow** with all transitions and callbacks
6. **Integration instructions** for the main app

The sequences are designed to be:
- **Non-skippable** (immersive experience)
- **Audio-synchronized** (precise timing with visual elements)
- **Smooth** (professional fade transitions)
- **Responsive** (works on desktop and mobile)

All timing values are **15% longer** than original specifications for better visibility and immersion.

---

## Additional Implementation Notes

### Responsive Design

The implementation uses a **480px breakpoint** to distinguish between mobile and desktop:

- **Mobile** (`< 480px`): Smaller fonts, narrower progress bar, adjusted spacing
- **Desktop** (`>= 480px`): Larger fonts, wider progress bar, more spacing

### Key Differences from Reference Files

The actual implementation in `src/components/` (TypeScript) differs from the reference files in `public/assets/BootUp/` (JSX):

1. **Web Audio API**: TypeScript version uses Web Audio API for both audios with gain nodes
2. **Audio Fade**: PC-boot uses exponential+linear ramp (13s total), PS1 uses requestAnimationFrame (5.5s)
3. **Responsive CSS**: Actual CSS has media queries for mobile/desktop
4. **Fade Duration**: Boot sequence fade is 2.5s (not 0.8s)
5. **Container Styling**: Responsive font sizes and padding

### Audio File Paths

**Important**: The audio files are located at:
- `/assets/BootUp/PC-boot.mp3` (not `/assets/audio/PC-boot.mp3`)
- `/assets/BootUp/Ps1-startup.mp3` (not `/assets/audio/Ps1-startup.mp3`)

This maps to `public/assets/BootUp/` in the file system.

### TypeScript vs JavaScript

The specification is based on the **TypeScript implementation** in `src/components/`, which is the active version. If rebuilding in JavaScript, convert:
- Type annotations to JSDoc or remove
- `as any` type assertions to direct property access
- Interface definitions to PropTypes or remove

### Performance Considerations

1. **Audio Pre-loading**: PS1 audio is pre-created during user click to avoid delay
2. **Web Audio API**: Used for smooth fades without clicks/pops
3. **Animation Performance**: Uses CSS animations where possible (GPU-accelerated)
4. **Scroll Optimization**: Auto-scroll only updates when new lines appear

### Browser Compatibility

- **Web Audio API**: Requires modern browser (Chrome, Firefox, Safari, Edge)
- **Fallback**: If Web Audio API unavailable, falls back to HTML5 Audio (volume limited to 0-1)
- **Autoplay Policy**: Requires user interaction (handled by click prompt)

---

## Quick Reference: All Timing Values

### Boot Sequence 0
- Typing speed: `10ms` per character
- Empty line delay: `29ms`
- Between lines delay: `15ms`
- End pause: `100ms`
- Fade out: `200ms` (JS) + `2.5s` (CSS)

### Boot Sequence 1
- Transition delay: `200ms`
- Logo display: `3439ms`
- Logo fade: `2579ms`
- PC-boot fade: `13s` (11s exponential + 2s linear)

### Boot Sequence 2
- Transition delay: `100ms`
- Progress increment: `2%` per step
- Increment delay: `99ms` per step
- Total duration: `5049ms` (51 steps)
- PS1 fade start: At `10%` progress
- PS1 fade duration: `5500ms`
- Final fade: `1500ms`

### Total Sequence
- Boot0: ~15-20 seconds (variable)
- Boot1: `6018ms` (~6 seconds)
- Boot2: `5049ms` (~5 seconds)
- Final fade: `1500ms` (~1.5 seconds)
- **Total**: ~27-32 seconds + boot0 typing time
