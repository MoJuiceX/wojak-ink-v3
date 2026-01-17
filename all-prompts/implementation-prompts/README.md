# 🎮 Wojak Games - Complete Implementation System

This folder contains ALL prompts needed to build and maintain the Wojak Games platform with full player engagement features.

---

## 📁 Folder Contents

### 🏗️ Architecture (Run First)
| File | Purpose |
|------|---------|
| `00-shared-systems-architecture.md` | **RUN FIRST** - Creates shared systems (effects, UI, engagement hooks) that all games use |

### 🎮 Game Creation
| File | Purpose |
|------|---------|
| `MASTER-game-creation-template.md` | Template for creating ANY new game - already integrated with all systems |
| `SYNC-update-existing-games.md` | Migrate existing games to shared systems + keep them in sync |

### 👤 Player Engagement (Run After Architecture)
| # | File | Purpose |
|---|------|---------|
| 1 | `01-authentication-avatar-system.md` | Google OAuth + Emoji/NFT avatars |
| 2 | `02-nft-gated-leaderboard.md` | Leaderboards (NFT holders only compete) |
| 3 | `03-guild-system.md` | Guilds, guild leaderboards, member management |
| 4 | `04-currency-rewards-system.md` | Oranges 🍊, Gems 💎, daily rewards, shop |
| 5 | `05-push-notifications-future.md` | PWA push notifications (implement later) |

---

## 🚀 Implementation Order

### Phase 1: Foundation
```
1. 00-shared-systems-architecture.md    ← Creates shared systems
2. SYNC-update-existing-games.md        ← Migrate 9 existing games
```

### Phase 2: Engagement
```
3. 01-authentication-avatar-system.md   ← Users can log in
4. 02-nft-gated-leaderboard.md          ← Competition system
5. 03-guild-system.md                   ← Social/community
6. 04-currency-rewards-system.md        ← Economy
```

### Phase 3: New Games (Anytime After Phase 1)
```
Use MASTER-game-creation-template.md for each new game
```

### Phase 4: Polish (Later)
```
7. 05-push-notifications-future.md      ← Re-engagement
```

---

## 🎯 What Problem Does This Solve?

### Before (The Old Way)
```
❌ Each game has its own effect code (copy-paste)
❌ Each game has its own game over screen
❌ Each game has its own CSS (duplicated)
❌ To update effects, edit 9+ files
❌ New games don't connect to leaderboards
❌ No shared engagement system
```

### After (The New Way)
```
✅ Shared effects system - update once, all games benefit
✅ Shared UI components - consistent look & feel
✅ Shared engagement hooks - auto-connected to everything
✅ One change = all games updated
✅ New games automatically integrated
✅ Full engagement system (auth, leaderboards, guilds, currency)
```

---

## 📊 Architecture Overview

```
src/
├── systems/                      # SHARED (update once = all games benefit)
│   ├── effects/                  # Shockwave, confetti, combos, etc.
│   ├── game-ui/                  # GameShell, HUD, GameOver, Intro
│   ├── engagement/               # useGameSession (score, currency, leaderboard)
│   └── theme/                    # Colors, glassmorphism, animations
│
├── contexts/                     # App-wide state
│   ├── AuthContext.tsx           # Google OAuth, user state
│   ├── CurrencyContext.tsx       # Oranges, gems
│   ├── LeaderboardContext.tsx    # Scores, rankings
│   └── GuildContext.tsx          # Guilds, members
│
├── games/                        # Individual games (ONLY game-specific code)
│   ├── OrangeStack/
│   │   ├── index.tsx             # Uses shared systems
│   │   ├── useOrangeStackLogic.ts # Game-specific logic only
│   │   └── OrangeStack.game.css  # Game-specific styles only
│   ├── MemoryMatch/
│   └── ... (all games)
│
└── components/                   # Shared app components
    ├── GameIntroOverlay.tsx
    ├── Leaderboard/
    └── Shop/
```

---

## 🔄 How Updates Work

### Scenario: Improve Confetti Effect

**Old way (without shared systems):**
1. Open OrangeStack.css, find confetti, update
2. Open MemoryMatch.css, find confetti, update
3. Open OrangePong.css, find confetti, update
4. ... repeat for all 9 games
5. Hope you didn't miss any
6. Hope they all look the same

**New way (with shared systems):**
1. Open `src/systems/effects/components/Confetti.tsx`
2. Update the confetti
3. Done. All 9 games have better confetti.

### Scenario: Add New Achievement System

**Old way:**
1. Add achievement logic to each game manually
2. Add achievement UI to each game's game over screen
3. ... massive effort, inconsistent results

**New way:**
1. Create `src/systems/engagement/useAchievements.ts`
2. Add to `useGameSession` hook
3. Update `GameOverScreen` to show achievements
4. Done. All games have achievements.

---

## 📋 Current Games (Need Migration)

| Game | Status |
|------|--------|
| Orange Stack | 🔄 Migrate to shared systems |
| Memory Match | 🔄 Migrate to shared systems |
| Orange Pong | 🔄 Migrate to shared systems |
| Wojak Runner | 🔄 Migrate to shared systems |
| Juggle the Orange | 🔄 Migrate to shared systems |
| The Knife Game | 🔄 Migrate to shared systems |
| Color Reaction | 🔄 Migrate to shared systems |
| 2048 Merge | 🔄 Migrate to shared systems |
| Orange Wordle | 🔄 Migrate to shared systems |

After migration: ✅ All games use shared systems

---

## 🎮 Creating New Games

After shared systems are in place, creating a new game is simple:

1. Copy `MASTER-game-creation-template.md`
2. Fill in Section 1 (game-specific details)
3. Create the game files following the template
4. The game automatically has:
   - ✅ Premium effects system
   - ✅ Glassmorphism UI
   - ✅ Score tracking
   - ✅ Combo system
   - ✅ Leaderboard integration
   - ✅ Currency rewards
   - ✅ Achievement support
   - ✅ Intro screen
   - ✅ Game over screen
   - ✅ NFT gate awareness

**You only write the game-specific logic!**

---

## 🔑 Key Design Decisions

### NFT-Gated Competition
- Everyone can play and see personal stats
- Only NFT avatar holders appear on public leaderboards
- Creates utility for Wojak NFTs

### Dual Currency
- 🍊 Oranges: Soft currency, abundant, from gameplay
- 💎 Gems: Hard currency, scarce, for premium items

### Shared Effects
- Effects are centralized and preset-based
- Games trigger presets, not individual effects
- Easy to add new effects or improve existing ones

### Engagement Hooks
- `useGameSession` handles everything games need
- Games don't directly interact with auth, currency, or leaderboard contexts
- All integration happens through one clean hook

---

## ⚠️ Important Notes

1. **Run `00-shared-systems-architecture.md` FIRST** before anything else
2. **Migrate existing games** before adding engagement features
3. **Test after each prompt** before moving to the next
4. **Push notifications** are for later - implement after core is stable
5. **CAT tokens** (blockchain currency) are optional future enhancement

---

## 💡 Quick Start

1. Drop `00-shared-systems-architecture.md` into Claude Code
2. Let it create the shared systems
3. Drop `SYNC-update-existing-games.md` to migrate one game (e.g., Orange Stack)
4. Verify it works
5. Migrate remaining games
6. Continue with engagement prompts (01, 02, 03, 04)
7. Use `MASTER-game-creation-template.md` for any new games

Good luck! 🍊
