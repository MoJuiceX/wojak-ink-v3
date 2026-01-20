# Juice Testing Checklist

> How to verify game juice feels right

---

## Pre-Testing Setup

- [ ] Test on real device (not just browser DevTools)
- [ ] Test with sound ON
- [ ] Test with haptics enabled
- [ ] Clear localStorage for fresh experience
- [ ] Test at both 30fps and 60fps

---

## 1. FLAP / TAP FEEL

### Visual
- [ ] Squash/stretch visible but not distracting
- [ ] Wing particles spawn in correct direction
- [ ] Camera zoom pulse is subtle (2% max)
- [ ] Bird rotation responds to velocity

### Audio
- [ ] Flap sound has pitch variation (no two identical)
- [ ] Volume feels balanced (not too loud)
- [ ] Sound plays instantly (no delay)

### Haptic
- [ ] Vibration is felt on tap
- [ ] Pattern is short and crisp (8-15ms)
- [ ] Works on both iOS and Android

### Feel Check
- [ ] **Ask yourself:** Does every tap feel SATISFYING?
- [ ] Play 20 taps rapidly - still feel good?
- [ ] Play with sound off - still satisfying visually?

---

## 2. DEATH SEQUENCE

### Freeze Frame
- [ ] Pause is noticeable (150ms)
- [ ] No input accepted during freeze
- [ ] Visual is clear (not flickering)

### Impact Flash
- [ ] Flash is visible but not painful
- [ ] Alpha is correct (~0.6)
- [ ] Fade out is smooth

### Screen Shake
- [ ] Shake feels impactful
- [ ] Intensity matches collision severity
- [ ] Decays smoothly (doesn't stop abruptly)

### Particles
- [ ] Explosion spawns at collision point
- [ ] Particle count is visible (25-35)
- [ ] Colors match character
- [ ] Gravity pulls particles down
- [ ] Rotation looks natural

### Slow Motion
- [ ] Tumble is visible and dramatic
- [ ] Time scale feels like 0.3x
- [ ] Duration is long enough to appreciate (~400ms)
- [ ] Returns to normal speed smoothly

### Chromatic Aberration (if implemented)
- [ ] Effect is subtle
- [ ] Fades quickly
- [ ] Doesn't hurt eyes

### Audio
- [ ] Impact sound is heavy/thuddy
- [ ] Timing matches visual impact
- [ ] No clipping or distortion

### Haptic
- [ ] Heavy vibration on death
- [ ] Longer than flap pattern (30-50ms)

### Feel Check
- [ ] **Ask yourself:** Does death feel DRAMATIC?
- [ ] Does it make you want to try again?
- [ ] Is it too long? (boring) or too short? (missed it)

---

## 3. PIPE PASS

### Visual
- [ ] Particles spawn at correct position
- [ ] Gold color is visible
- [ ] "+1" floats up smoothly
- [ ] Score text animates (not just increment)

### Audio
- [ ] Musical note plays
- [ ] Pitch increases with each pass (C major scale)
- [ ] Resets after 8 notes
- [ ] Volume balanced with other sounds

### Haptic
- [ ] Double tap pattern on pass
- [ ] Distinct from flap pattern

### Feel Check
- [ ] Does passing feel REWARDING?
- [ ] Is the musical scale addictive?
- [ ] Do you want to keep passing to hear more notes?

---

## 4. NEAR-MISS SYSTEM

### Detection
- [ ] Triggers at correct distance (25% of gap)
- [ ] Doesn't false-trigger
- [ ] Works on both top and bottom of pipe

### Visual
- [ ] Yellow flash is noticeable
- [ ] "CLOSE!" text appears (high intensity only)
- [ ] Near-miss particles spawn
- [ ] Bonus points display correctly

### Audio
- [ ] Rising tone plays
- [ ] Pitch scales with intensity
- [ ] Sounds tense/exciting

### Haptic
- [ ] Flutter pattern (multiple short bursts)
- [ ] Intensity matches closeness

### Feel Check
- [ ] Does near-miss feel TENSE?
- [ ] Do you intentionally try to get closer?
- [ ] Is bonus rewarding enough?

---

## 5. FIRE MODE / STREAK

### Activation
- [ ] Activates at correct threshold (5 pipes)
- [ ] Activation is obvious (not subtle)
- [ ] Sound plays on activation

### Visual
- [ ] Fire trail is visible
- [ ] Border glow is present
- [ ] Intensity increases with streak
- [ ] Multiplier badge shows correctly

### Audio
- [ ] Whoosh on activation
- [ ] Ambient crackle during fire mode
- [ ] Stops cleanly on death

### Feel Check
- [ ] Does fire mode feel POWERFUL?
- [ ] Do you want to maintain it?
- [ ] Is multiplier motivating?

---

## 6. PARALLAX / ENVIRONMENT

### Layers
- [ ] All layers visible and distinct
- [ ] Speeds are correct (slower = further)
- [ ] No gaps or seams on scroll
- [ ] Seamless wrapping

### Depth
- [ ] Creates sense of 3D space
- [ ] Foreground faster than background
- [ ] Mountains barely move

### Feel Check
- [ ] Does world feel DEEP?
- [ ] Does scrolling feel smooth?
- [ ] Are layers distracting or enhancing?

---

## 7. OVERALL POLISH

### Performance
- [ ] Consistent 60fps
- [ ] No stutters or frame drops
- [ ] No memory leaks (check after 50 games)
- [ ] Particles don't cause lag

### Timing
- [ ] All effects feel synchronized
- [ ] No delays between action and feedback
- [ ] Animations complete before next action

### Balance
- [ ] No single effect dominates
- [ ] Effects layer well together
- [ ] Not too busy visually
- [ ] Audio mix is balanced

---

## 8. EDGE CASES

### Rapid Input
- [ ] Tap spam doesn't break anything
- [ ] No duplicate sounds
- [ ] No particle explosion

### State Transitions
- [ ] Start → Playing smooth
- [ ] Playing → Death smooth
- [ ] Death → Restart smooth
- [ ] No lingering effects after restart

### Sound Toggle
- [ ] Mute works instantly
- [ ] Unmute works instantly
- [ ] State persists across sessions

### Reduced Motion
- [ ] Respects prefers-reduced-motion
- [ ] Game still playable
- [ ] Core feedback preserved

---

## 9. COMPARISON TEST

Play these games and compare:

1. **Flappy Bird (original)**
   - How does death feel?
   - How does flap feel?

2. **Crossy Road**
   - How does hop feel?
   - How does death feel?

3. **Jetpack Joyride**
   - How does boost feel?
   - How does environment scroll?

### Questions
- Is our juice on par with these?
- What do they do better?
- What can we improve?

---

## 10. FINAL CHECKLIST

Before shipping, confirm:

- [ ] All juice effects trigger correctly
- [ ] Sound balance is good
- [ ] Haptics work on target devices
- [ ] Performance is solid
- [ ] No bugs in edge cases
- [ ] Death makes you want to retry
- [ ] Passing feels rewarding
- [ ] Fire mode feels powerful
- [ ] Overall game feels PREMIUM

---

## Test Reporting

When reporting issues, include:
1. **What happened:** Description
2. **Expected:** What should happen
3. **Device:** Model, OS version
4. **Browser:** Chrome, Safari, etc.
5. **Steps:** How to reproduce
6. **Screenshot/Video:** If visual issue

---

Last Updated: 2024
