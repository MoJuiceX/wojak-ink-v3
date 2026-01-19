# Orange Juggle Juice Implementation Checklist

> **Instructions for Claude CLI:** After implementing each enhancement from `ORANGE-JUGGLE-JUICE-IMPLEMENTATION.md`, mark it as complete by changing `[ ]` to `[x]`. Add brief implementation notes if needed.

---

## Phase 1: Sound Foundation

- [x] **1. Orange juggle hit sound** — Bouncy "boing" with position-based pitch variation
- [x] **2. Orange drop/miss sound** — Descending "womp" when orange is missed
- [x] **3. Golden orange hit sound** — Magical chime with sparkle layer
- [x] **4. Banana collect sound** — Happy ascending arpeggio
- [x] **5. Rum collect sound** — Sloshing "glug-glug" with woozy warble
- [x] **6. Camel warning sound** — Dramatic descending horn with rumble
- [x] **7. Camel impact sound** — Heavy crash/thud for game over moment
- [x] **8. Combo escalation sound** — Pitch/layers increase with combo count
- [x] **9. Combo break sound** — Deflating whoosh when combo expires
- [x] **10. Rum active ambient loop** — Woozy sloshing while rum effect active
- [x] **11. Banana active ambient** — Energetic shimmer during multiplier
- [x] **12. Sound variations** — Position-based pitch variation for hit sounds (Web Audio synthesis)
- [x] **13. Level complete sound** — Triumphant fanfare
- [x] **14. Arm swing whoosh** — Function created, ready for arm animation integration

---

## Phase 2: Haptic Layer

- [x] **15. Orange hit haptic** — Medium 20ms bounce pulse
- [x] **16. Golden orange haptic** — Celebratory triple burst [15,25,12,25,10]
- [x] **17. Orange drop haptic** — Long 50ms drop feeling
- [x] **18. Banana collect haptic** — Energetic pattern [10,20,8,20,6]
- [x] **19. Rum collect haptic** — Woozy double [30,80,25]
- [x] **20. Camel warning haptic** — Urgent triple [15,100,15,100,15]
- [x] **21. Camel impact haptic** — Heavy 80ms game over pulse
- [x] **22. Combo escalation haptic** — Uses existing hapticCombo system (scales with combo)
- [x] **23. Near-miss haptic** — Pattern defined (oj-near-miss), ready for near-miss detection
- [x] **24. Level complete haptic** — Extended celebration burst [25,50,20,50,15,50,10]

---

## Phase 3: Core Visual Juice

- [ ] **25. Orange squash on impact** — Compress on hit, recover smoothly
- [ ] **26. Orange velocity stretch** — Elongate in movement direction
- [ ] **27. Orangutan arm animation** — Arm swings with follow-through
- [ ] **28. Impact flash on collision** — White expanding circle at contact
- [ ] **29. Orange trail effect** — Motion trail with combo color escalation
- [ ] **30. Particle burst on hit** — 12-16 colorful particles
- [ ] **31. Screen shake** — Variable intensity with decay
- [ ] **32. Freeze frame on big hits** — 40-100ms pause for impact
- [ ] **33. Combo glow effect** — Orangutan glows brighter with combo
- [ ] **34. Multiple orange panic indicators** — Visual cues for simultaneous oranges

---

## Phase 4: Powerup & Collectible Feedback

- [ ] **35. Golden orange glow and pulse** — Radiant pulsing animation
- [ ] **36. Banana glow and float** — Yellow glow with gentle floating
- [ ] **37. Rum bottle wobble** — Wobbles with ominous purple glow
- [ ] **38. Powerup collection flash** — Screen-wide color flash
- [ ] **39. Banana multiplier timer bar** — Duration bar with expiring flash
- [ ] **40. Rum effect visual overlay** — Woozy purple vignette
- [ ] **41. Powerup spawn particles** — Particle burst when spawning
- [ ] **42. Collection score popup** — Animated floating score text

---

## Phase 5: Enemy & Hazard Feedback

- [ ] **43. Camel shadow warning** — Growing shadow before drop
- [ ] **44. Camel drop animation** — Dramatic drop with dust cloud
- [ ] **45. Camel movement trail** — Dust particles while moving
- [ ] **46. Camel collision impact** — Explosion particles, shake, flash
- [ ] **47. Near-miss with camel** — Feedback for narrow escape
- [ ] **48. Camel exit animation** — Walk off screen with dust trail

---

## Phase 6: Combo & Scoring System

- [ ] **49. Combo meter visual** — On-screen meter with timeout bar
- [ ] **50. Combo multiplier display** — Show current score multiplier
- [ ] **51. Combo break feedback** — Visual/audio on combo loss
- [ ] **52. Max combo celebration** — Special effects at 10x
- [ ] **53. Score animation** — Count up, don't just set
- [ ] **54. High score celebration** — Effects when beating high score
- [ ] **55. Lives display animation** — Bounce on gain/loss

---

## Phase 7: Anticipation & Polish

- [ ] **56. Landing prediction indicator** — Shows where oranges will land
- [ ] **57. Final orange highlight** — Pulsing glow on last 1-3 oranges
- [ ] **58. Level transition animation** — Fade out/in with level display
- [ ] **59. Anticipation sound loop** — Tension audio for final oranges
- [ ] **60. Level complete celebration** — Full celebration sequence
- [ ] **61. Game over sequence** — Dramatic game over presentation
- [ ] **62. Pause state feedback** — Visual treatment when paused

---

## Implementation Notes

| # | Enhancement | File(s) Modified | Notes |
|---|-------------|------------------|-------|
| 1 | Orange hit sound | useGameSounds.ts, OrangeJuggle.tsx | Web Audio bouncy boing with pitch variation |
| 2 | Orange drop sound | useGameSounds.ts, OrangeJuggle.tsx | Descending womp when orange hits ground |
| 3 | Golden orange hit sound | useGameSounds.ts, OrangeJuggle.tsx | 3-layer magical chime (base+harmonic+shimmer) |
| 4 | Banana collect sound | useGameSounds.ts, OrangeJuggle.tsx | Major arpeggio C5-E5-G5 |
| 5 | Rum collect sound | useGameSounds.ts, OrangeJuggle.tsx | Double glug with woozy warble |
| 6 | Camel warning sound | useGameSounds.ts, OrangeJuggle.tsx | Descending sawtooth horn + low rumble |
| 7 | Camel impact sound | useGameSounds.ts, OrangeJuggle.tsx | Heavy thud + crash noise |
| 8 | Combo escalation sound | useGameSounds.ts, OrangeJuggle.tsx | Pitch escalates, adds sparkle at 5+, bass at 8+ |
| 9 | Combo break sound | useGameSounds.ts, OrangeJuggle.tsx | Descending whoosh for combos 3+ |
| 10 | Rum ambient loop | useGameSounds.ts, OrangeJuggle.tsx | Woozy LFO modulated ambient |
| 11 | Banana ambient | useGameSounds.ts, OrangeJuggle.tsx | Energetic shimmer ambient |
| 12 | Sound variations | useGameSounds.ts | Position-based pitch variation via Web Audio |
| 13 | Level complete sound | useGameSounds.ts, OrangeJuggle.tsx | Triumphant fanfare C5-E5-G5-C6 |
| 14 | Arm swing whoosh | useGameSounds.ts | Function ready, awaiting arm animation |
| 15 | Orange hit haptic | patterns.ts, useGameHaptics.ts, OrangeJuggle.tsx | 20ms bounce pulse |
| 16 | Golden orange haptic | patterns.ts, useGameHaptics.ts, OrangeJuggle.tsx | Celebratory triple burst |
| 17 | Orange drop haptic | patterns.ts, useGameHaptics.ts, OrangeJuggle.tsx | 50ms drop feeling |
| 18 | Banana collect haptic | patterns.ts, useGameHaptics.ts, OrangeJuggle.tsx | Energetic triple pulse |
| 19 | Rum collect haptic | patterns.ts, useGameHaptics.ts, OrangeJuggle.tsx | Woozy double pulse |
| 20 | Camel warning haptic | patterns.ts, useGameHaptics.ts, OrangeJuggle.tsx | Urgent triple pulse |
| 21 | Camel impact haptic | patterns.ts, useGameHaptics.ts, OrangeJuggle.tsx | Heavy 80ms pulse |
| 22 | Combo escalation haptic | OrangeJuggle.tsx | Uses existing hapticCombo system |
| 23 | Near-miss haptic | patterns.ts, useGameHaptics.ts | Pattern ready, awaiting detection |
| 24 | Level complete haptic | patterns.ts, useGameHaptics.ts, OrangeJuggle.tsx | Extended celebration burst |
| 25 | Orange squash | | |
| 26 | Orange velocity stretch | | |
| 27 | Orangutan arm animation | | |
| 28 | Impact flash | | |
| 29 | Orange trail effect | | |
| 30 | Particle burst | | |
| 31 | Screen shake | | |
| 32 | Freeze frame | | |
| 33 | Combo glow effect | | |
| 34 | Panic indicators | | |
| 35 | Golden orange glow | | |
| 36 | Banana glow/float | | |
| 37 | Rum wobble | | |
| 38 | Powerup collection flash | | |
| 39 | Banana timer bar | | |
| 40 | Rum overlay | | |
| 41 | Powerup spawn particles | | |
| 42 | Score popup | | |
| 43 | Camel shadow warning | | |
| 44 | Camel drop animation | | |
| 45 | Camel movement trail | | |
| 46 | Camel collision impact | | |
| 47 | Near-miss camel | | |
| 48 | Camel exit animation | | |
| 49 | Combo meter visual | | |
| 50 | Combo multiplier display | | |
| 51 | Combo break feedback | | |
| 52 | Max combo celebration | | |
| 53 | Score animation | | |
| 54 | High score celebration | | |
| 55 | Lives display animation | | |
| 56 | Landing prediction | | |
| 57 | Final orange highlight | | |
| 58 | Level transition | | |
| 59 | Anticipation sound loop | | |
| 60 | Level complete celebration | | |
| 61 | Game over sequence | | |
| 62 | Pause state feedback | | |

---

## Summary

**Total Enhancements:** 62

**Completed:** 24 / 62

**Progress:** 38.7% (Phase 1 & 2 Complete)

---

## Sound Files Status

> **Note:** All Phase 1 sounds are implemented using Web Audio API synthesized sounds for low latency and smaller bundle size. MP3 files can be added later for richer sound design if desired.

| Sound | Status | Notes |
|-------|--------|-------|
| orange_hit.mp3 | [x] | Web Audio synthesis with position-based pitch |
| orange_hit_2.mp3 | N/A | Variations handled via pitch parameter |
| orange_hit_3.mp3 | N/A | Variations handled via pitch parameter |
| orange_hit_4.mp3 | N/A | Variations handled via pitch parameter |
| orange_drop.mp3 | [x] | Web Audio descending tone |
| golden_orange_hit.mp3 | [x] | Web Audio 3-layer chime |
| banana_collect.mp3 | [x] | Web Audio arpeggio |
| rum_collect.mp3 | [x] | Web Audio glug + warble |
| camel_warning.mp3 | [x] | Web Audio horn + rumble |
| camel_impact.mp3 | [x] | Web Audio thud + crash |
| camel_land.mp3 | [ ] | Optional for future |
| combo_chime.mp3 | [x] | Web Audio escalating chime |
| combo_break.mp3 | [x] | Web Audio descending whoosh |
| rum_ambient_loop.mp3 | [x] | Web Audio LFO ambient |
| banana_ambient_loop.mp3 | [x] | Web Audio shimmer ambient |
| level_complete.mp3 | [x] | Web Audio fanfare |
| arm_whoosh.mp3 | [x] | Web Audio noise whoosh (function ready) |
| arm_whoosh_2.mp3 | N/A | Variations via isLeftArm parameter |
| arm_whoosh_3.mp3 | N/A | Variations via isLeftArm parameter |
| anticipation_loop.mp3 | [ ] | Phase 7 |
| game_over.mp3 | [x] | Uses existing playGameOver |
| high_score.mp3 | [ ] | Optional for future |
| max_combo.mp3 | [ ] | Phase 6 |

---

*Last updated: 2026-01-18*
