# Wojak.ink Fix Files Index

These files contain step-by-step instructions to fix issues found in the QA audit.
Drag and drop each file into Claude CLI one at a time, in order.

---

## Critical Fixes (Do First)

| # | File | Issue | Priority |
|---|------|-------|----------|
| 01 | `fix-01-react-hooks-games.md` | All 15 games crash due to React hooks error | 🔴 CRITICAL |
| 02 | `fix-02-landing-page-black.md` | Landing page renders black | 🔴 CRITICAL |
| 03 | `fix-03-leaderboard-not-rendering.md` | Leaderboard page blank | 🔴 CRITICAL |
| 04 | `fix-04-shop-not-rendering.md` | Shop page blank | 🔴 CRITICAL |
| 05 | `fix-05-guild-not-rendering.md` | Guild page blank | 🔴 CRITICAL |
| 06 | `fix-06-account-not-rendering.md` | Account page blank | 🔴 CRITICAL |
| 07 | `fix-07-media-not-rendering.md` | Media Hub page blank | 🔴 CRITICAL |

---

## High Priority Fixes

| # | File | Issue | Priority |
|---|------|-------|----------|
| 08 | `fix-08-add-error-boundaries.md` | Add Error Boundaries to catch silent failures | 🟠 HIGH |
| 09 | `fix-09-gallery-mobile-loading.md` | Gallery mobile slow load (3-5s black screen) | 🟠 HIGH |
| 14 | `fix-14-add-game-loading-states.md` | Add loading states for game pages | 🟠 HIGH |
| 15 | `fix-15-add-game-error-recovery.md` | Add game error recovery UI | 🟠 HIGH |

---

## Medium Priority Fixes

| # | File | Issue | Priority |
|---|------|-------|----------|
| 10 | `fix-10-gallery-header-overlap.md` | Mobile header text overlap | 🟡 MEDIUM |
| 11 | `fix-11-nft-modal-history-tab.md` | NFT modal History tab appears empty | 🟡 MEDIUM |
| 12 | `fix-12-bigpulp-mobile-search.md` | BigPulp mobile search truncation | 🟡 MEDIUM |
| 13 | `fix-13-user-profile-abort-error.md` | UserProfile context AbortError | 🟡 LOW |

---

## Recommended Order

### Day 1: Critical Fixes
1. `fix-01-react-hooks-games.md` - Fix this first, affects all games
2. `fix-08-add-error-boundaries.md` - Will help debug remaining issues
3. `fix-02-landing-page-black.md`
4. `fix-03-leaderboard-not-rendering.md`
5. `fix-04-shop-not-rendering.md`
6. `fix-05-guild-not-rendering.md`
7. `fix-06-account-not-rendering.md`
8. `fix-07-media-not-rendering.md`

### Day 2: High Priority
9. `fix-14-add-game-loading-states.md`
10. `fix-15-add-game-error-recovery.md`
11. `fix-09-gallery-mobile-loading.md`

### Day 3: Medium Priority
12. `fix-10-gallery-header-overlap.md`
13. `fix-11-nft-modal-history-tab.md`
14. `fix-12-bigpulp-mobile-search.md`
15. `fix-13-user-profile-abort-error.md`

---

## Usage

1. Open terminal with Claude CLI in the wojak-ink project
2. Drag and drop `fix-01-react-hooks-games.md` into the CLI
3. Follow the instructions Claude provides
4. Test the fix
5. Proceed to the next file

Each file is self-contained with:
- Problem description
- Steps to fix
- Files to check/modify
- Success criteria
