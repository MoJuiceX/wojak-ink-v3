# Flappy Orange - Complete Implementation Checklist

**Total Tasks: 216** (160 juice + 56 design)
**Last Updated:** 2026-01-19

> 📄 **Related Docs:**
> - [FLAPPY-ORANGE-JUICE-IMPLEMENTATION.md](./FLAPPY-ORANGE-JUICE-IMPLEMENTATION.md) - Full implementation guide
> - [FLAPPY-ORANGE-DESIGN-ENHANCEMENTS.md](./FLAPPY-ORANGE-DESIGN-ENHANCEMENTS.md) - Premium design tasks

---

## Progress Overview

### Juice Effects (160 tasks)

| Phase | Tasks | Completed | Status |
|-------|-------|-----------|--------|
| Phase 1: Premium Flap Feel | 18 | 18 | ✅ Complete |
| Phase 2: Dramatic Death Sequence | 16 | 16 | ✅ Complete |
| Phase 3: Near-Miss Detection | 14 | 14 | ✅ Complete |
| Phase 4: Full Pass Juice | 12 | 12 | ✅ Complete |
| Phase 5: 3-Layer Parallax | 14 | 14 | ✅ Complete |
| Phase 6: Streak Fire Mode | 16 | 16 | ✅ Complete |
| Phase 7: Enhanced Haptics | 8 | 8 | ✅ Complete |
| Phase 8: Pipe Anticipation | 10 | 4 | 🔶 Partial |
| Phase 9: Environment Enhancements | 12 | 10 | ✅ Complete |
| Phase 10: Viral Share System | 14 | 14 | ✅ Complete |
| Phase 11: Sound System Overhaul | 12 | 0 | Not Started |
| Phase 12: Polish & Optimization | 10 | 0 | Not Started |
| Phase 13: Playbook Bonus Techniques | 18 | 5 | 🔶 Partial |
| **Juice Subtotal** | **160** | **131** | **81.9%** |

### Design Enhancements (56 tasks)

| Phase | Tasks | Completed | Status |
|-------|-------|-----------|--------|
| Phase D1: Character Personality | 12 | 0 | Not Started |
| Phase D2: Environment Depth | 14 | 0 | Not Started |
| Phase D3: Modern Pipe Design | 10 | 0 | Not Started |
| Phase D4: Premium UI Design | 12 | 0 | Not Started |
| Phase D5: Atmospheric Effects | 8 | 0 | Not Started |
| **Design Subtotal** | **56** | **0** | **0%** |

### Grand Total

| Category | Tasks | Completed | Progress |
|----------|-------|-----------|----------|
| Juice Effects | 160 | 131 | 81.9% |
| Design Enhancements | 56 | 0 | 0% |
| **GRAND TOTAL** | **216** | **131** | **60.6%** |

---

## Phase 1: Premium Flap Feel (18 tasks) ✅

### 1.1 Squash & Stretch System
- [x] 1.1.1 Add scaleX/scaleY to bird state
- [x] 1.1.2 Create DEFORMATION_CONFIG constant
- [x] 1.1.3 Implement applyFlapDeformation function
- [x] 1.1.4 Implement applyFallPeakDeformation (at velocity apex)
- [x] 1.1.5 Implement applyDeathDeformation
- [x] 1.1.6 Modify drawBird to use scale transforms
- [x] 1.1.7 Add easing function for smooth returns

### 1.2 Wing Burst Particles
- [x] 1.2.1 Create WingParticle interface
- [x] 1.2.2 Add wingParticles state array
- [x] 1.2.3 Implement spawnWingParticles function
- [x] 1.2.4 Add particle update loop (fade + move)
- [x] 1.2.5 Add particle render in game loop
- [x] 1.2.6 Call spawnWingParticles on every flap

### 1.3 Varied Pitch Flap Sounds
- [x] 1.3.1 Create FLAP_SOUND_CONFIG constant
- [x] 1.3.2 Implement playFlapSound with Web Audio API
- [x] 1.3.3 Add pitch randomization (±15%)
- [x] 1.3.4 Add volume randomization (±10%)
- [x] 1.3.5 Replace existing flap sound call

### 1.4 Micro Camera Pulse
- [x] 1.4.1 Add cameraZoom state (default 1.0)
- [x] 1.4.2 Create CAMERA_PULSE_CONFIG
- [x] 1.4.3 Implement triggerCameraPulse function
- [x] 1.4.4 Apply camera zoom in canvas render
- [x] 1.4.5 Call on every flap

### 1.5 Enhanced Haptic Feedback
- [x] 1.5.1 Create HAPTIC_PATTERNS constant
- [x] 1.5.2 Implement triggerHaptic helper
- [x] 1.5.3 Apply FLAP pattern on every tap

---

## Phase 2: Dramatic Death Sequence (16 tasks) ✅

### 2.1 Freeze Frame System
- [x] 2.1.1 Add isFrozen flag to game state
- [x] 2.1.2 Create FREEZE_CONFIG constant
- [x] 2.1.3 Implement triggerDeathFreeze function
- [x] 2.1.4 Skip physics updates when frozen
- [x] 2.1.5 Continue rendering during freeze (particles still animate)

### 2.2 Slow-Motion Tumble
- [x] 2.2.1 Add timeScale to game state (default 1.0)
- [x] 2.2.2 Add rotationVelocity to bird state
- [x] 2.2.3 Add velocityX to bird state (for knockback)
- [x] 2.2.4 Create SLOW_MO_CONFIG constant
- [x] 2.2.5 Implement startSlowMotionDeath function
- [x] 2.2.6 Apply timeScale to all physics calculations

### 2.3 Death Particle Explosion
- [x] 2.3.1 Create DeathParticle interface
- [x] 2.3.2 Add deathParticles state array
- [x] 2.3.3 Implement spawnDeathParticles function
- [x] 2.3.4 Add gravity to death particles
- [x] 2.3.5 Render death particles with rotation

### 2.4 Chromatic Aberration Flash
- [x] 2.4.1 Add chromaticIntensity state
- [x] 2.4.2 Create CHROMATIC_CONFIG constant
- [x] 2.4.3 Implement applyChromaticAberration (simplified version)
- [x] 2.4.4 Trigger on death, decay over 200ms
- [x] 2.4.5 Alternative: CSS filter approach for performance

### 2.5 Impact Flash
- [x] 2.5.1 Add impactFlashAlpha state
- [x] 2.5.2 Implement triggerImpactFlash function
- [x] 2.5.3 Render white overlay in game loop
- [x] 2.5.4 Trigger on death collision

---

## Phase 3: Near-Miss Detection System (14 tasks) ✅

### 3.1 Near-Miss Detection Algorithm
- [x] 3.1.1 Create NearMissResult interface
- [x] 3.1.2 Create NEAR_MISS_CONFIG constant
- [x] 3.1.3 Implement checkNearMiss function
- [x] 3.1.4 Call on every pipe pass
- [x] 3.1.5 Track consecutive near-misses for bonus escalation

### 3.2 Near-Miss Visual Feedback
- [x] 3.2.1 Add nearMissFlashAlpha state
- [x] 3.2.2 Implement yellow screen flash (quick fade)
- [x] 3.2.3 Create spawnNearMissParticles function
- [x] 3.2.4 Add "CLOSE!" callout for high intensity
- [x] 3.2.5 Render yellow vignette overlay

### 3.3 Near-Miss Audio
- [x] 3.3.1 Implement playNearMissSound function
- [x] 3.3.2 Pitch scales with intensity
- [x] 3.3.3 Call on near-miss detection

### 3.4 Near-Miss Bonus Points
- [x] 3.4.1 Implement calculateNearMissBonus function
- [x] 3.4.2 Integrate into scoring system
- [x] 3.4.3 Show bonus points floating text
- [x] 3.4.4 Track total near-miss bonuses for stats

---

## Phase 4: Full Pass Juice (12 tasks) ✅

### 4.1 Pass Particle Burst
- [x] 4.1.1 Create PassParticle interface
- [x] 4.1.2 Add passParticles state array
- [x] 4.1.3 Implement spawnPassParticles function
- [x] 4.1.4 Trigger on every pipe pass

### 4.2 Musical Pass Notes (Rising Scale)
- [x] 4.2.1 Create PASS_SCALE_FREQUENCIES constant (C major scale)
- [x] 4.2.2 Implement playPassNote function
- [x] 4.2.3 Track pipe number for scale position
- [x] 4.2.4 Reset scale on game over

### 4.3 Subtle Screen Pulse
- [x] 4.3.1 Add screenBrightness state
- [x] 4.3.2 Implement triggerPassPulse function
- [x] 4.3.3 Apply brightness in render
- [x] 4.3.4 Call on every pipe pass

### 4.4 Enhanced Floating Score
- [x] 4.4.1 Enhance FloatingScore to include scale
- [x] 4.4.2 Make near-miss scores larger and yellow
- [x] 4.4.3 Add scale animation (grow then shrink)
- [x] 4.4.4 Improve floating animation (arc, not linear)

---

## Phase 5: 3-Layer Parallax System (14 tasks) ✅

### 5.1 Parallax Layer Structure
- [x] 5.1.1 Create ParallaxLayer interface (Cloud, MountainPeak interfaces)
- [x] 5.1.2 Create ParallaxElement interface
- [x] 5.1.3 Create PARALLAX_CONFIG constant (ENVIRONMENT_COLORS)
- [x] 5.1.4 Add parallaxLayers state (cloudsRef, mountainsRef, etc.)

### 5.2 Background Layer (30% speed)
- [x] 5.2.1 Implement drawBackgroundLayer function (drawBackground with parallax)
- [x] 5.2.2 Create drawMountainRange function (drawMountains)
- [x] 5.2.3 Create drawSun function (drawCelestialBody)
- [x] 5.2.4 Create drawMoon function (for night) (drawCelestialBody)
- [x] 5.2.5 Apply environment-specific colors

### 5.3 Midground Layer (60% speed) - Clouds
- [x] 5.3.1 Create Cloud interface
- [x] 5.3.2 Implement generateClouds function
- [x] 5.3.3 Implement drawCloud function
- [x] 5.3.4 Add clouds state (cloudsRef)
- [x] 5.3.5 Update cloud positions based on scroll offset

### 5.4 Foreground Layer (90% speed)
- [x] 5.4.1 Implement drawForegroundLayer function (drawGrassTufts)
- [x] 5.4.2 Create grass tuft drawing (generateGrassTufts)
- [x] 5.4.3 Add subtle bushes/plants (grass tufts)
- [x] 5.4.4 Integrate into render loop

---

## Phase 6: Streak Fire Mode (16 tasks) ✅

### 6.1 Streak Tracking
- [x] 6.1.1 Create StreakState interface
- [x] 6.1.2 Create STREAK_CONFIG constant
- [x] 6.1.3 Add streak state
- [x] 6.1.4 Implement updateStreak function
- [x] 6.1.5 Call on pipe pass and death

### 6.2 Fire Mode Visual Effects
- [x] 6.2.1 Add fireParticles ref
- [x] 6.2.2 Implement drawFireTrail function
- [x] 6.2.3 Create fire color palette
- [x] 6.2.4 Add fire glow around bird

### 6.3 Fire Mode Border Glow
- [x] 6.3.1 Implement drawFireBorder function
- [x] 6.3.2 Add pulsing animation
- [x] 6.3.3 Intensity increases with streak length

### 6.4 Fire Mode Audio
- [x] 6.4.1 Implement playFireModeStartSound
- [x] 6.4.2 Implement startFireAmbience (crackling loop)
- [x] 6.4.3 Implement stopFireAmbience
- [x] 6.4.4 Trigger on fire mode start/end

### 6.5 Fire Mode Score Display
- [x] 6.5.1 Implement drawFireModeScore
- [x] 6.5.2 Show multiplier badge
- [x] 6.5.3 Add flame emojis
- [x] 6.5.4 Pulsing glow animation

---

## Phase 7: Enhanced Haptics (8 tasks) ✅

- [x] 7.1 Apply FLAP pattern on every tap
- [x] 7.2 Apply PASS pattern on pipe pass
- [x] 7.3 Apply NEAR_MISS pattern (rapid flutter)
- [x] 7.4 Apply MILESTONE pattern on milestones
- [x] 7.5 Apply DEATH pattern (heavy impact)
- [x] 7.6 Apply STREAK_START pattern when fire mode activates
- [x] 7.7 Intensity scaling with streak length
- [x] 7.8 Disable duplicate haptics (no double-tap on jump+score)

---

## Phase 8: Pipe Anticipation & Warning (10 tasks) 🔶

### 8.1 Pipe Gap Highlighting
- [x] 8.1.1 Implement drawPipeGapHighlight
- [x] 8.1.2 Intensity based on distance
- [x] 8.1.3 Green glow for safe zone
- [x] 8.1.4 Integrate into pipe render

### 8.2 Approaching Pipe Warning
- [ ] 8.2.1 Implement drawApproachingWarning
- [ ] 8.2.2 Pulsing outline effect
- [ ] 8.2.3 Only show when pipe is close
- [ ] 8.2.4 Disable in "hardcore" mode (future option)

### 8.3 Additional Warning Features
- [ ] 8.3.1 Slight camera pan toward upcoming gap
- [ ] 8.3.2 Audio cue for approaching pipe

---

## Phase 9: Environment Enhancements (12 tasks) ✅

### 9.1 Smooth Environment Transitions
- [x] 9.1.1 Create ENVIRONMENT_COLORS constant
- [x] 9.1.2 Implement lerpColor function (hexToRgb + color interpolation)
- [x] 9.1.3 Add transitionProgress state (handled in drawBackground)
- [x] 9.1.4 Smooth 2-second transitions between environments

### 9.2 Weather Particles (Storm Mode)
- [x] 9.2.1 Create storm particle system (rainDropsRef)
- [x] 9.2.2 Implement rain drops (spawnRainDrops, drawRain)
- [x] 9.2.3 Add occasional lightning flash (triggerLightning)
- [x] 9.2.4 Screen shake on thunder (delayed after flash)

### 9.3 Enhanced Star Twinkle
- [ ] 9.3.1 Enhance star rendering with glow
- [ ] 9.3.2 Add shooting stars (occasional)
- [ ] 9.3.3 Constellation patterns (Easter egg)

### 9.4 Additional Environment Polish
- [x] 9.4.1 Sunset sun rays effect (drawCelestialBody with rays)
- [x] 9.4.2 Vignette effect (drawVignette)

---

## Phase 10: Viral Share System (14 tasks) ✅

### 10.1 Canvas Screenshot Generation
- [x] 10.1.1 Implement generateShareImage function
- [x] 10.1.2 Include game screenshot
- [x] 10.1.3 Overlay score prominently
- [x] 10.1.4 Add branding

### 10.2 Challenge Link System
- [x] 10.2.1 Implement generateChallengeLink (encodeChallenge)
- [x] 10.2.2 Parse challenge parameters on load (decodeChallenge useEffect)
- [x] 10.2.3 Show challenge toast (challengeTarget state)
- [x] 10.2.4 Display target score during gameplay (challenge banner)
- [x] 10.2.5 Celebrate when challenge beaten (challengeBeaten state)

### 10.3 One-Tap Share
- [x] 10.3.1 Implement shareScore function (handleNativeShare)
- [x] 10.3.2 Use Web Share API where available
- [x] 10.3.3 Fallback to clipboard copy (handleCopyLink)
- [x] 10.3.4 Add share button to game over screen

### 10.4 Share UI
- [x] 10.4.1 Share button design (fo-share-btn CSS)
- [x] 10.4.2 Share confirmation toast (showToast)

---

## Phase 11: Sound System Overhaul (12 tasks)

### 11.1 Sound Variation System
- [ ] 11.1.1 Create SOUND_VARIATIONS config
- [ ] 11.1.2 Implement variation tracking
- [ ] 11.1.3 Apply to flap sounds
- [ ] 11.1.4 Apply to pass sounds

### 11.2 Environment Ambient Audio
- [ ] 11.2.1 Create ambient audio configs
- [ ] 11.2.2 Implement ambient crossfade
- [ ] 11.2.3 Generate or load ambient sounds
- [ ] 11.2.4 Trigger on environment change

### 11.3 Milestone Sounds
- [ ] 11.3.1 Create distinct milestone sounds
- [ ] 11.3.2 Environment change sounds
- [ ] 11.3.3 Fire mode start/end sounds
- [ ] 11.3.4 Death impact sound (separate from game over)

---

## Phase 12: Polish & Optimization (10 tasks)

- [ ] 12.1 Object pooling for particles (performance)
- [ ] 12.2 RequestAnimationFrame optimization
- [ ] 12.3 Canvas layer separation (static vs dynamic)
- [ ] 12.4 Reduced motion support (prefers-reduced-motion)
- [ ] 12.5 Sound toggle persistence
- [ ] 12.6 Particle count limits (max 100)
- [ ] 12.7 Memory cleanup on unmount
- [ ] 12.8 Mobile touch offset adjustment
- [ ] 12.9 High DPI canvas support
- [ ] 12.10 Final integration testing

---

## Phase 13: Playbook Bonus Techniques (18 tasks) 🔶

**From Universal Game Juice Playbook**

### 13.1 Touch Point Ripple
- [x] 13.1.1 Add touchRipples ref array (touchRipplesRef)
- [x] 13.1.2 Implement createTouchRipple function (spawnTouchRipple)
- [x] 13.1.3 Update ripples in game loop
- [x] 13.1.4 Draw ripples on canvas (drawTouchRipples)
- [x] 13.1.5 Trigger on every tap/click (handleTap)

### 13.2 Combo Timeout Bar
- [ ] 13.2.1 Add lastPassTime tracking
- [ ] 13.2.2 Implement drawComboMeter function
- [ ] 13.2.3 Show meter when streak >= 2
- [ ] 13.2.4 Color changes by streak level

### 13.3 Anticipation Sound Loop
- [ ] 13.3.1 Create MILESTONE_ANTICIPATION config
- [ ] 13.3.2 Implement anticipation loop start/stop
- [ ] 13.3.3 Call checkAnticipation on score change
- [ ] 13.3.4 Fade out on milestone reached

### 13.4 Score Counter Animation
- [ ] 13.4.1 Add displayScore ref (separate from actual score)
- [ ] 13.4.2 Implement animateScoreChange function
- [ ] 13.4.3 Use displayScore for rendering
- [ ] 13.4.4 Trigger on score increase

### 13.5 Time Dilation on Perfect Moments
- [ ] 13.5.1 Create DILATION_TRIGGERS config
- [ ] 13.5.2 Add timeDilation ref
- [ ] 13.5.3 Implement triggerTimeDilation
- [ ] 13.5.4 Apply timeScale in physics loop
- [ ] 13.5.5 Add golden vignette overlay

---

---

## Phase D1: Character Personality (12 tasks)

### D1.1 Eye Tracking System
- [ ] D1.1.1 Create EyeState interface
- [ ] D1.1.2 Create EYE_CONFIG constants
- [ ] D1.1.3 Implement updateEyeTracking function
- [ ] D1.1.4 Modify drawBird to use pupil offsets
- [ ] D1.1.5 Add eye shine that moves with pupil

### D1.2 Facial Expressions
- [ ] D1.2.1 Create Expression type and config
- [ ] D1.2.2 Implement getExpression logic
- [ ] D1.2.3 Draw different mouth shapes
- [ ] D1.2.4 Add eyebrow rendering
- [ ] D1.2.5 Smooth transitions between expressions

### D1.3 Idle Breathing Animation
- [ ] D1.3.1 Create BREATHING_CONFIG
- [ ] D1.3.2 Implement getBreathingOffset
- [ ] D1.3.3 Apply to bird Y position
- [ ] D1.3.4 Apply subtle scale pulse

### D1.4 Premium Trail Effect
- [ ] D1.4.1 Create TrailSegment interface
- [ ] D1.4.2 Create TRAIL_CONFIG
- [ ] D1.4.3 Implement updateTrail function
- [ ] D1.4.4 Implement drawTrail with ribbon shape
- [ ] D1.4.5 Add glow effect to trail

---

## Phase D2: Environment Depth (14 tasks)

### D2.1 Enhanced Parallax Layers
- [ ] D2.1.1 Create ParallaxLayer interface
- [ ] D2.1.2 Define 7 parallax layers
- [ ] D2.1.3 Implement layer offset calculation

### D2.2 Dynamic Mountain Silhouettes
- [ ] D2.2.1 Create drawMountainLayer function
- [ ] D2.2.2 Add procedural peak generation
- [ ] D2.2.3 Environment-specific mountain colors

### D2.3 Volumetric Clouds
- [ ] D2.3.1 Create Cloud and CloudPuff interfaces
- [ ] D2.3.2 Implement generateCloud function
- [ ] D2.3.3 Implement drawCloud with radial gradients
- [ ] D2.3.4 Add cloud parallax movement
- [ ] D2.3.5 Environment-specific cloud colors

### D2.4 Atmospheric Light Rays
- [ ] D2.4.1 Implement drawLightRays function
- [ ] D2.4.2 Add sun position calculation
- [ ] D2.4.3 Animate ray rotation subtly
- [ ] D2.4.4 Environment-specific ray colors

### D2.5 Enhanced Ground with Texture
- [ ] D2.5.1 Create drawEnhancedGround function
- [ ] D2.5.2 Add grass tuft parallax
- [ ] D2.5.3 Add subtle texture dots
- [ ] D2.5.4 Environment-specific ground colors

---

## Phase D3: Modern Pipe Design (10 tasks)

### D3.1 Gradient Pipes with Lighting
- [ ] D3.1.1 Create PIPE_DESIGN constants
- [ ] D3.1.2 Implement drawModernPipe function
- [ ] D3.1.3 Add gradient body with lighting
- [ ] D3.1.4 Add pipe cap with rounded corners
- [ ] D3.1.5 Environment-specific pipe colors

### D3.2 Gap Safe Zone Glow
- [ ] D3.2.1 Implement drawGapHighlight
- [ ] D3.2.2 Intensity based on distance
- [ ] D3.2.3 Integrate into render loop

### D3.3 Pipe Polish
- [ ] D3.3.1 Add subtle pipe shadow
- [ ] D3.3.2 Pipe edge shimmer effect

---

## Phase D4: Premium UI Design (12 tasks)

### D4.1 Modern Score Display
- [ ] D4.1.1 Create SCORE_UI config
- [ ] D4.1.2 Implement modern drawScore
- [ ] D4.1.3 Add shadow and outline
- [ ] D4.1.4 Add milestone glow effect

### D4.2 Animated Score Popup
- [ ] D4.2.1 Create ScorePopup interface
- [ ] D4.2.2 Implement createScorePopup with types
- [ ] D4.2.3 Implement drawScorePopup with easing
- [ ] D4.2.4 Add pop-in scale animation
- [ ] D4.2.5 Add glow effect

### D4.3 Modern Game Over Screen
- [ ] D4.3.1 Implement drawGameOverScreen
- [ ] D4.3.2 Add card slide-up animation
- [ ] D4.3.3 Add shadow and rounded corners
- [ ] D4.3.4 Style retry button
- [ ] D4.3.5 Add new best celebration

---

## Phase D5: Atmospheric Effects (8 tasks)

### D5.1 Dynamic Vignette
- [ ] D5.1.1 Implement drawVignette
- [ ] D5.1.2 Environment-specific vignette colors

### D5.2 Rain Effect (Storm)
- [ ] D5.2.1 Create RainDrop interface
- [ ] D5.2.2 Implement rain particle system
- [ ] D5.2.3 Add wind angle to rain
- [ ] D5.2.4 Only show during storm environment

### D5.3 Lightning Flash (Storm)
- [ ] D5.3.1 Implement triggerLightning
- [ ] D5.3.2 Add multi-flash sequence
- [ ] D5.3.3 Add delayed thunder + shake

---

## Quick Stats

- **Total Juice Tasks:** 160
- **Total Design Tasks:** 56
- **Grand Total:** 216
- **Completed:** 131
- **Remaining:** 85
- **Progress:** 60.6%

---

## Notes

### Priority Order

**Juice (Maximum Impact First):**
1. **Phase 2 (Death)** → Freeze + tumble = instant premium feel
2. **Phase 1 (Flap)** → Core interaction must feel powerful
3. **Phase 4 (Pass)** → Musical scale is addictive
4. **Phase 3 (Near-Miss)** → Unique engagement hook
5. **Phase 6 (Fire Mode)** → "One more try" addiction
6. **Phase 13 (Playbook)** → Extra polish layer

**Design (Visual Premium):**
1. **Phase D1 (Character)** → Eye tracking makes orange lovable
2. **Phase D3 (Pipes)** → Modern gradient look
3. **Phase D4 (UI)** → Premium game over screen
4. **Phase D2 (Environment)** → 7-layer parallax depth
5. **Phase D5 (Atmosphere)** → Rain, lightning, vignette

### Key Metrics to Watch
- Retry Rate: Target 85%+
- Share Rate: Target 15%+
- Avg Session: Target 5+ min

### Testing Checklist
- [ ] Test on mobile (touch responsiveness)
- [ ] Test with sound off (still satisfying?)
- [ ] Test reduced motion preference
- [ ] Verify haptics work on iOS + Android
- [ ] Check particle count doesn't lag on low-end devices
- [ ] Ensure restart is < 0.5 seconds

---

## Future Features (Beyond Juice)

**Phase 14: Viral Growth** (see implementation guide)
- [ ] Ghost Racing vs Friends
- [ ] Auto-Highlight Recording (TikTok clips)
- [ ] Quick Restart Optimization

**Phase 15: Retention Systems**
- [ ] Daily Challenges
- [ ] Streak System (7/14/30 day rewards)
- [ ] Wojak Skin Unlocks (NFT integration!)

**Phase 16: Advanced**
- [ ] Battle Royale Mode (100 players)
- [ ] Seasonal Events
- [ ] Thumb Zone Optimization
