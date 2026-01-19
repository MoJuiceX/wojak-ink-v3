# Brick Breaker Juice Implementation Checklist

> **Instructions for Claude CLI:** After implementing each enhancement from `BRICK-BREAKER-JUICE-IMPLEMENTATION.md`, mark it as complete by changing `[ ]` to `[x]`. Add brief implementation notes if needed.

---

## Phase 1: Sound Foundation

- [x] **1. Ball launch sound** — Whoosh/ping when ball is launched
- [x] **2. Paddle hit sound** — Distinct rubbery thwack, pitch varies by hit position
- [x] **3. Wall hit sound** — Subtle ping when bouncing off walls
- [x] **4. Normal brick destruction sound** — Satisfying pop/crunch
- [x] **5. Strong brick hit sound** — Crack sound when damaged (first hit)
- [x] **6. Strong brick destruction sound** — Heavy crumble on destroy
- [x] **7. Unbreakable brick deflect sound** — Metallic clang
- [x] **8. Powerup spawn sound** — Sparkle/chime when powerup drops
- [x] **9. Powerup collection sounds** — Type-specific sounds (E, M, F, S, +)
- [x] **10. Ball lost sound** — Descending womp, not game over
- [x] **11. Combo sound escalation** — Pitch/layers increase with combo count
- [x] **12. Last brick anticipation sound** — Tension loop when 1-3 bricks remain
- [x] **13. Fireball mode loop** — Ambient fire sound while active
- [x] **14. Sound variations** — 3-4 variations per sound type

---

## Phase 2: Haptic Layer

- [x] **15. Paddle hit haptic** — Medium 20ms pulse
- [x] **16. Normal brick haptic** — Light 12ms pulse
- [x] **17. Strong brick crack haptic** — Medium 18ms pulse
- [x] **18. Strong brick destroy haptic** — Double pulse pattern
- [x] **19. Unbreakable brick haptic** — Heavy 30ms thud
- [x] **20. Powerup collection haptic** — Triple pulse reward pattern
- [x] **21. Ball lost haptic** — Long 50ms drop feeling
- [x] **22. Combo escalation haptic** — Intensity scales with combo
- [x] **23. Near-miss haptic** — Ultra-light 5ms warning
- [x] **24. Level complete haptic** — Celebratory burst pattern

---

## Phase 3: Core Visual Juice

- [x] **25. Ball squash on impact** — Compress on hit, recover smoothly
- [x] **26. Paddle squash on ball hit** — Vertical compression on impact
- [x] **27. Ball stretch based on velocity** — Elongate in movement direction
- [x] **28. Impact flash on collisions** — White expanding circle at impact point
- [x] **29. Brick shatter animation** — 6 pieces with physics (gravity, rotation)
- [x] **30. Enhanced particle burst** — 12-16 particles with varied sizes/colors
- [x] **31. Combo trail color escalation** — Trail color changes by combo level

---

## Phase 4: Powerup & Effect Visuals

- [x] **32. Powerup glow and pulse** — Pulsing glow as powerups fall
- [x] **33. Powerup activation flash** — Screen-wide color flash on collect
- [x] **34. Fireball visual enhancement** — Ember particles and glow
- [x] **35. Near-miss visual feedback** — Red warning indicator
- [x] **36. Last bricks highlight** — Pulsing glow on remaining 1-3 bricks
- [x] **37. Freeze frame on big events** — 50-80ms pause for impact
- [x] **38. Screen shake improvements** — Variable intensity with decay

---

## Phase 5: Anticipation & Polish

- [x] **39. Ball approaching paddle warning** — Predicted landing indicator
- [x] **40. Multiball spawn animation** — Visual flourish on ball split
- [x] **41. Powerup timer indicator** — On-screen duration bars
- [x] **42. Level transition animation** — Fade out/in with level display

---

## Phase 6: Combo System

- [x] **43. Combo meter visual** — On-screen meter with timeout bar
- [x] **44. Combo multiplier score bonus** — Points multiplied by combo
- [x] **45. Combo break feedback** — Visual/audio on combo loss

---

## Implementation Notes

| # | Enhancement | File(s) Modified | Notes |
|---|-------------|------------------|-------|
| 1 | Ball launch sound | useGameSounds.ts, BrickBreaker.tsx | Added createBallLaunchSound + playBallLaunch, called on game start and ball respawn |
| 2 | Paddle hit sound | useGameSounds.ts, BrickBreaker.tsx | Added createBrickBreakerPaddleHitSound with hitPosition param for pitch variation |
| 3 | Wall hit sound | useGameSounds.ts, BrickBreaker.tsx | Added createBrickBreakerWallHitSound, quieter than paddle/brick hits |
| 4 | Normal brick destruction | useGameSounds.ts, BrickBreaker.tsx | Added createBrickBreakerBrickDestroySound with pop + crunch layers |
| 5 | Strong brick crack | useGameSounds.ts, BrickBreaker.tsx | Added createBrickBreakerBrickCrackSound for damaged but not destroyed |
| 6 | Strong brick destruction | useGameSounds.ts, BrickBreaker.tsx | Same function as #4 with brickType param, heavier/lower sound |
| 7 | Unbreakable brick hit | useGameSounds.ts, BrickBreaker.tsx | Added createBrickBreakerUnbreakableHitSound, metallic clang with overtones |
| 8 | Powerup spawn | useGameSounds.ts, BrickBreaker.tsx | Added createBrickBreakerPowerupSpawnSound, rising sparkle chime |
| 9 | Powerup collection | useGameSounds.ts, BrickBreaker.tsx | Type-specific sounds: expand=elastic, multiball=pops, fireball=whoosh, slow=decel, extra=chord |
| 10 | Ball lost | useGameSounds.ts, BrickBreaker.tsx | Added createBrickBreakerBallLostSound, descending "womp" with undertone |
| 11 | Combo escalation | useGameSounds.ts, BrickBreaker.tsx | Escalating pitch, sparkle at 5+, bass at 8+, shimmer at 10+ |
| 12 | Anticipation sound | useGameSounds.ts, BrickBreaker.tsx | Pulsing tone with LFO, starts at ≤3 bricks, stops on game over/level complete |
| 13 | Fireball loop | useGameSounds.ts, BrickBreaker.tsx | Crackly fire ambient: low rumble + crackle osc + noise, 8s duration with powerup |
| 14 | Sound variations | useGameSounds.ts | 4 variations each for wall hit, paddle hit, brick destroy |
| 15 | Paddle hit haptic | patterns.ts, useGameHaptics.ts, BrickBreaker.tsx | 20ms pulse on paddle collision |
| 16 | Normal brick haptic | patterns.ts, useGameHaptics.ts, BrickBreaker.tsx | 12ms light tap on normal brick destroy |
| 17 | Strong brick crack haptic | patterns.ts, useGameHaptics.ts, BrickBreaker.tsx | 18ms medium tap on strong brick crack |
| 18 | Strong brick destroy haptic | patterns.ts, useGameHaptics.ts, BrickBreaker.tsx | [20,30,15] double pulse pattern |
| 19 | Unbreakable brick haptic | patterns.ts, useGameHaptics.ts, BrickBreaker.tsx | 30ms heavy thud |
| 20 | Powerup collection haptic | patterns.ts, useGameHaptics.ts, BrickBreaker.tsx | [10,20,8,20,6] triple pulse reward |
| 21 | Ball lost haptic | patterns.ts, useGameHaptics.ts, BrickBreaker.tsx | 50ms long pulse drop feeling |
| 22 | Combo escalation haptic | BrickBreaker.tsx | Uses existing hapticCombo() with escalating patterns |
| 23 | Near-miss haptic | patterns.ts, useGameHaptics.ts, BrickBreaker.tsx | 5ms ultra-light, triggered within 25px of paddle edge |
| 24 | Level complete haptic | patterns.ts, useGameHaptics.ts, BrickBreaker.tsx | [25,50,20,50,15] celebratory success pattern |
| 25 | Ball squash on impact | BrickBreaker.tsx | squashX/squashY on Ball, triggerBallSquash on collisions, recovery in game loop |
| 26 | Paddle squash on hit | BrickBreaker.tsx | squashY on Paddle, triggerPaddleSquash, visual transform in render |
| 27 | Ball velocity stretch | BrickBreaker.tsx | Speed-based stretch factor combined with squash, rotation to movement direction |
| 28 | Impact flash | BrickBreaker.tsx | ImpactFlash interface, createImpactFlash on all collisions, expanding circle render |
| 29 | Brick shatter | BrickBreaker.tsx | BrickShard interface, 6 pieces with physics (gravity, rotation, alpha fade) |
| 30 | Enhanced particles | BrickBreaker.tsx | Increased from 8 to 14 particles, varied speeds, white sparkles mixed in |
| 31 | Combo trail color | BrickBreaker.tsx | getComboTrailColor function, trail uses combo-based colors (orange→gold→magenta) |
| 32 | Powerup glow/pulse | BrickBreaker.tsx | Time-based pulse (animationTimeRef), outer glow scales 5-13px, alpha 0.3-0.6 |
| 33 | Powerup activation flash | BrickBreaker.tsx | screenFlashRef, triggerPowerupFlash on collect, color-coded per type, alpha decays |
| 34 | Fireball ember particles | BrickBreaker.tsx | EmberParticle interface, emberParticlesRef, spawn 30% chance per frame, float upward |
| 35 | Near-miss visual | BrickBreaker.tsx | nearMissVisualRef, red radial gradient at bottom, alpha decays 0.08/frame |
| 36 | Last bricks highlight | BrickBreaker.tsx | Yellow pulsing glow when ≤3 breakable bricks, 15-30px blur, outer rect |
| 37 | Freeze frame | BrickBreaker.tsx | freezeFrameUntilRef, 50ms strong brick, 60ms combo≥5, 80ms level complete |
| 38 | Screen shake | BrickBreaker.tsx | Variable intensity: paddle=15, combo=25, ball lost=30, game over=40 |
| 39 | Ball approaching warning | BrickBreaker.tsx | Predicts landing position, shows dot + dashed line when timeToReach < 60 frames |
| 40 | Multiball spawn animation | BrickBreaker.tsx | SpawnEffect interface, expanding magenta rings, balls spawn with squash |
| 41 | Powerup timer indicator | BrickBreaker.tsx | ActivePowerup interface, progress bars at left, flashes red when < 2s |
| 42 | Level transition | BrickBreaker.tsx | LevelTransition interface, 3 phases: fadeOut, display (LEVEL X), fadeIn |
| 43 | Combo meter visual | BrickBreaker.tsx | Progress bar top-right, shows x count, glow at 5+, color escalation |
| 44 | Combo multiplier | BrickBreaker.tsx | 3+=1.2x, 5+=1.5x, 8+=2.0x, 10+=2.5x, shown in score popups |
| 45 | Combo break feedback | BrickBreaker.tsx, useGameSounds.ts, patterns.ts | Sound, haptic (5+), visual text "COMBO LOST" |

---

## Summary

**Total Enhancements:** 45

**Completed:** 45 / 45

**Progress:** 100%

---

## Sound Files Status

| Sound | Status | Notes |
|-------|--------|-------|
| ball_launch.mp3 | [ ] | |
| paddle_hit.mp3 | [ ] | |
| wall_ping.mp3 | [ ] | |
| brick_destroy_1.mp3 | [ ] | |
| brick_destroy_2.mp3 | [ ] | |
| brick_destroy_3.mp3 | [ ] | |
| brick_destroy_4.mp3 | [ ] | |
| brick_crack.mp3 | [ ] | |
| brick_strong_destroy.mp3 | [ ] | |
| unbreakable_clang.mp3 | [ ] | |
| powerup_spawn.mp3 | [ ] | |
| powerup_expand.mp3 | [ ] | |
| powerup_multiball.mp3 | [ ] | |
| powerup_fireball.mp3 | [ ] | |
| powerup_slow.mp3 | [ ] | |
| powerup_life.mp3 | [ ] | |
| ball_lost.mp3 | [ ] | |
| combo_chime.mp3 | [ ] | |
| sparkle.mp3 | [ ] | |
| bass_hit.mp3 | [ ] | |
| anticipation_loop.mp3 | [ ] | |
| fireball_loop.mp3 | [ ] | |
| combo_break.mp3 | [ ] | |

---

*Last updated: [DATE]*
