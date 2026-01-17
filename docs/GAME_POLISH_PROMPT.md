# 🎮 GAME POLISH PROMPT: Elevate All Games to Orange Stack Standard

## Context
Our flagship game **Orange Stack** has extremely polished, premium visuals with intense animations, particle effects, and dopamine-triggering feedback loops. The other 8 games feel "dull" in comparison. This prompt guides you to bring every game to the same addictive, visually extreme standard.

---

## Reference: What Makes Orange Stack Premium

Orange Stack uses these techniques that create an INTENSE, STICKY experience:

### 1. Layered Visual Effects System
```tsx
// State for visual effects - ALL GAMES should have these
const [showShockwave, setShowShockwave] = useState(false);
const [showImpactSparks, setShowImpactSparks] = useState(false);
const [showVignette, setShowVignette] = useState(false);
const [floatingEmojis, setFloatingEmojis] = useState([]);
const [epicCallout, setEpicCallout] = useState(null);
const [showConfetti, setShowConfetti] = useState(false);
const [showLightning, setShowLightning] = useState(false);
const [showScreenShake, setShowScreenShake] = useState(false);
```

### 2. Combo/Streak System with Escalating Rewards
- Track consecutive successes (combo counter)
- Visual intensity SCALES with combo level (3x, 5x, 8x, 10x, 15x, 20x)
- Milestone celebrations at key thresholds (confetti, epic callouts like "LEGENDARY!", "GODLIKE!")
- Background glow color shifts based on combo level
- Speed lines appear at high combos

### 3. Impact Feedback (EVERY action needs feedback)
- **Shockwave ripple** - CSS animation expanding from impact point
- **Impact sparks** - 8 particles radiating outward (✦ characters)
- **Screen shake** - 300ms transform shake on perfect actions
- **Vignette pulse** - Darkened edges flash on good actions
- **Floating emojis** - Random celebratory emojis float upward (🔥⚡💎🌟✨💥🚀👑)

### 4. Sound Design Integration
```tsx
const { playBlockLand, playPerfectBonus, playCombo, playWinSound, playGameOver } = useGameSounds();
```
Every visual effect should have matching audio cue.

### 5. Scoring Psychology
- Base points + bonus categories (PERFECT, GREAT, speed bonus, combo multiplier)
- Flying score popup (+50, +100) that animates upward
- Clear bonus text feedback ("⚡ PERFECT ⚡", "✓ GREAT", "5x Combo!")

### 6. CSS Animations (from OrangeStack.css)
Key animation patterns to replicate:

```css
/* Shockwave */
.impact-shockwave {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid rgba(255, 165, 0, 0.8);
  transform: translate(-50%, 50%);
  animation: shockwave 0.6s ease-out forwards;
  pointer-events: none;
}
@keyframes shockwave {
  0% { transform: translate(-50%, 50%) scale(0); opacity: 0.8; }
  100% { transform: translate(-50%, 50%) scale(3); opacity: 0; }
}

/* Screen shake */
.screen-shake {
  animation: shake 0.3s ease-in-out;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px) rotate(-1deg); }
  75% { transform: translateX(5px) rotate(1deg); }
}

/* Floating emoji */
.floating-emoji {
  position: absolute;
  font-size: 32px;
  bottom: 50%;
  animation: float-up 1.5s ease-out forwards;
  pointer-events: none;
  z-index: 200;
}
@keyframes float-up {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-100px) scale(1.5); }
}

/* Epic callout text */
.epic-callout {
  position: absolute;
  left: 50%;
  font-size: 48px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 20px rgba(255, 107, 0, 0.8), 0 0 40px rgba(255, 107, 0, 0.6);
  letter-spacing: 4px;
  animation: callout-zoom 1.5s ease-out forwards;
  pointer-events: none;
  z-index: 300;
}
@keyframes callout-zoom {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

/* Confetti explosion */
.confetti-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 250;
}
.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--confetti-color);
  left: var(--confetti-x);
  top: -10px;
  animation: confetti-fall 3s ease-out forwards;
  animation-delay: var(--confetti-delay);
}
@keyframes confetti-fall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

/* Lightning bolts */
.lightning-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 200;
  animation: lightning-flash 0.4s ease-out;
}
@keyframes lightning-flash {
  0%, 100% { opacity: 0; }
  10%, 30%, 50% { opacity: 1; }
  20%, 40% { opacity: 0.5; }
}

/* Speed lines (intensity scales with combo) */
.speed-lines {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 50;
}
.speed-line {
  position: absolute;
  left: var(--line-offset);
  top: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: speed-line-move 0.5s linear infinite;
}

/* Background glow (color shifts with combo level) */
.combo-bg-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  transition: opacity 0.3s ease;
}

/* Vignette pulse */
.vignette-pulse {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, transparent 40%, rgba(255, 107, 0, 0.3) 100%);
  animation: vignette-flash 0.4s ease-out forwards;
  pointer-events: none;
  z-index: 150;
}
@keyframes vignette-flash {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

/* Impact sparks */
.impact-sparks {
  position: absolute;
  transform: translate(-50%, 50%);
  pointer-events: none;
  z-index: 200;
}
.spark {
  position: absolute;
  font-size: 16px;
  color: #ffd700;
  animation: spark-burst 0.5s ease-out forwards;
  transform: rotate(var(--spark-angle));
}
@keyframes spark-burst {
  0% { opacity: 1; transform: rotate(var(--spark-angle)) translateX(0); }
  100% { opacity: 0; transform: rotate(var(--spark-angle)) translateX(50px); }
}

/* Combo celebration */
.combo-celebration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 100;
  animation: combo-entrance 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.combo-number {
  font-size: 72px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(168, 85, 247, 0.6);
  animation: combo-pulse 0.6s ease-in-out infinite alternate;
}
@keyframes combo-pulse {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

/* Score popup */
.score-popup {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
  font-weight: 800;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.8);
  animation: score-fly 1s ease-out forwards;
  pointer-events: none;
  z-index: 200;
}
@keyframes score-fly {
  0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-60px) scale(1.3); }
}

/* Bonus flash */
.bonus-flash {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  font-weight: 800;
  color: #ffd700;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
  animation: bonus-pop 1.5s ease-out forwards;
  pointer-events: none;
  z-index: 180;
}
.bonus-flash.perfect {
  font-size: 32px;
  color: #fff;
  text-shadow: 0 0 20px rgba(255, 107, 0, 1), 0 0 40px rgba(255, 215, 0, 0.8);
}
@keyframes bonus-pop {
  0% { opacity: 0; transform: translateX(-50%) scale(0.5); }
  20% { opacity: 1; transform: translateX(-50%) scale(1.2); }
  80% { opacity: 1; transform: translateX(-50%) scale(1); }
  100% { opacity: 0; transform: translateX(-50%) scale(0.8); }
}
```

### 7. Power-ups & Perks (adds variety/surprise)
- Random power-up spawns (magnet, slow-mo, shield, width+)
- Visual notification when collected
- Active power-up indicators in HUD

### 8. Progressive Difficulty with Theme Changes
- Levels have different themes (sunrise → morning → day → sunset → dusk → night → storm → inferno)
- Each level can have different background treatment/color scheme
- Speed/difficulty scales but remains fair

---

## Games to Upgrade (Priority Order)

### 1. Memory Match (`src/pages/MemoryMatch.tsx`)
- Add: Card flip particles, match celebration shockwave, combo for consecutive matches
- Add: Speed bonus for fast matches, streak tracking
- Add: Milestone celebrations (5 pairs, 10 pairs)
- Add: Perfect round bonus (no mismatches)

### 2. Orange Pong (`src/pages/OrangePong.tsx`)
- Add: Ball hit shockwave, paddle impact sparks
- Add: Streak bonus for consecutive points
- Add: Near-miss tension effect, rally counter with escalating effects
- Add: Dramatic slow-mo on match point

### 3. Wojak Runner (`src/pages/WojakRunner.tsx`)
- Add: Collection burst when grabbing oranges
- Add: Near-miss sparks when dodging obstacles
- Add: Speed increase visual effects (motion blur, speed lines)
- Add: Distance milestone celebrations (100m, 500m, 1000m)

### 4. Orange Juggle (`src/pages/OrangeJuggle.tsx`)
- Add: Bounce shockwave on each hit
- Add: Juggle streak with escalating effects
- Add: Power-up collection particles
- Add: Multi-ball chaos visual intensity

### 5. Color Reaction (`src/pages/ColorReaction.tsx`)
- Add: Match shockwave, reaction time visual feedback
- Add: Perfect timing celebration (< 200ms)
- Add: Streak meter with intensity scaling
- Add: Speed increase visual blur

### 6. 2048 Merge (`src/games/Merge2048/Merge2048Game.tsx`)
- Add: Merge particles and shockwave
- Add: New tile spawn animation with bounce
- Add: High-value tile glow effects (256, 512, 1024, 2048)
- Add: Cascade bonus visual for chain reactions
- Add: Board shake on big merges

### 7. Orange Wordle (`src/games/Wordle/WordleGame.tsx`)
- Add: Letter reveal animations with particles
- Add: Correct letter celebration (green = confetti burst)
- Add: Win celebration with full confetti
- Add: Streak display (consecutive wins)
- Add: Hard mode visual intensity

### 8. Knife Game (`src/pages/KnifeGame.tsx`)
- Add: Stab impact effects with sparks
- Add: Near-miss tension (close to finger = red vignette)
- Add: Speed intensity visual feedback
- Add: Blood splatter effect on fail (cartoonish)

---

## Implementation Checklist Per Game

For each game, implement:

- [ ] **Effect state variables** (shockwave, sparks, confetti, emojis, etc.)
- [ ] **Combo/streak tracking** with milestone thresholds
- [ ] **Impact feedback** on every significant action
- [ ] **Score popups** that animate and fly
- [ ] **Bonus text** (PERFECT, GREAT, etc.)
- [ ] **Screen shake** on big moments
- [ ] **Background intensity** that scales with performance
- [ ] **Sound hooks** from useGameSounds
- [ ] **CSS animations** in game's .css file
- [ ] **Mobile HUD** for score/streak during gameplay

---

## File Structure Per Game
```
src/pages/[GameName].tsx     # Component with effect state & logic
src/pages/[GameName].css     # Animations and visual effects
```

---

## Key Principle

> **Every action = visual + audio feedback. No silent moments.**

The player should FEEL every tap, match, hit, dodge, and score. The game should feel ALIVE and responsive. When a player does something good, the game should CELEBRATE with them. When intensity builds, the visuals should ESCALATE.

---

## Technical Notes

### Triggering Effects Pattern
```tsx
// Example: Triggering a shockwave effect
const triggerShockwave = (x: number, y: number) => {
  setImpactPosition({ x, y });
  setShowShockwave(true);
  setTimeout(() => setShowShockwave(false), 600);
};

// Example: Adding floating emoji
const addFloatingEmoji = (emoji: string, x: number) => {
  const id = floatingEmojiIdRef.current++;
  setFloatingEmojis(prev => [...prev, { id, emoji, x }]);
  setTimeout(() => {
    setFloatingEmojis(prev => prev.filter(e => e.id !== id));
  }, 1500);
};

// Example: Milestone celebration
if (combo === 5 || combo === 10 || combo === 15 || combo === 20) {
  setShowMilestone(combo);
  setShowConfetti(true);
  setEpicCallout(callouts[combo]);
  setTimeout(() => setShowMilestone(null), 2000);
  setTimeout(() => setShowConfetti(false), 3000);
  setTimeout(() => setEpicCallout(null), 1500);
}
```

### Performance Considerations
- Limit particle count (50 confetti pieces max)
- Use CSS animations over JS animations where possible
- Clean up timeouts and intervals
- Use `will-change: transform` for frequently animated elements
- Remove effects from DOM when not visible

---

## Output Expected

After upgrading each game:
1. Verify it compiles (`npm run build`)
2. Test effects trigger correctly
3. Ensure mobile responsiveness
4. Check performance (no lag from too many particles)
5. Verify sounds play at appropriate moments

**Start with Memory Match** as it's the most played after Orange Stack.
