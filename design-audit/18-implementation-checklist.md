# Implementation Checklist - Quick Reference

## Overview of All Design Audit Files

| File | Description | Priority | Effort |
|------|-------------|----------|--------|
| 00-DESIGN-AUDIT-OVERVIEW | Executive summary | Reference | - |
| 01-gallery-redesign | NFT gallery improvements | High | Medium |
| 02-generator-redesign | Avatar generator polish | High | Medium |
| 03-header-navbar-redesign | Navigation improvements | High | Low |
| 04-media-hub-redesign | Videos/music section | Medium | Medium |
| 05-leaderboard-redesign | Competition page | Medium | Low |
| 06-account-guild-shop-redesign | User pages | Medium | Medium |
| 07-global-animations-effects | Site-wide animations | High | Low |
| 08-avatar-nft-connection-flow | Wallet connection UX | High | High |
| 09-landing-page-scrollytelling | New landing page | High | High |
| 10-animation-libraries-reference | Library guide | Reference | - |
| 11-design-token-system | CSS variables | High | Low |
| 12-bigpulp-navigation-prominence | AI chat visibility | High | Low |
| 13-mobile-touch-optimizations | Mobile UX | High | Medium |
| 14-loading-states-skeletons | Loading experience | Medium | Low |
| 15-toast-notifications-feedback | User feedback | Medium | Low |
| 16-games-ui-audit | All games polish | Low | High |
| 17-accessibility-performance | A11y & perf | Medium | Medium |

---

## Recommended Implementation Order

### Phase 1: Foundation (Do First)
Quick wins that improve the entire site immediately.

1. **Design Token System (11)**
   ```
   Read 11-design-token-system.md and create src/styles/tokens.css with all CSS custom properties
   ```

2. **Global Animations (07)**
   ```
   Read 07-global-animations-effects.md and implement the animated gradient background and page transitions
   ```

3. **Header/Navbar (03)**
   ```
   Read 03-header-navbar-redesign.md and update the header with glassmorphism and improved navigation
   ```

4. **BigPulp Navigation (12)**
   ```
   Read 12-bigpulp-navigation-prominence.md and move BigPulp to position 2 with special styling
   ```

### Phase 2: Core Pages (High Impact)
Main pages that users see most often.

5. **Gallery Redesign (01)**
   ```
   Read 01-gallery-redesign.md and implement glassmorphism cards with hover effects
   ```

6. **Generator Redesign (02)**
   ```
   Read 02-generator-redesign.md and add the pulsing avatar glow and trait animations
   ```

7. **Landing Page (09)**
   ```
   Read 09-landing-page-scrollytelling.md and build the parallax landing page with scroll sections
   ```

### Phase 3: User Experience
Features that improve engagement.

8. **Avatar/NFT Connection (08)**
   ```
   Read 08-avatar-nft-connection-flow.md and implement the avatar upgrade prompts
   ```

9. **Loading States (14)**
   ```
   Read 14-loading-states-skeletons.md and add skeleton screens throughout the app
   ```

10. **Toast Notifications (15)**
    ```
    Read 15-toast-notifications-feedback.md and implement the toast provider
    ```

11. **Mobile Optimizations (13)**
    ```
    Read 13-mobile-touch-optimizations.md and implement touch-friendly improvements
    ```

### Phase 4: Secondary Pages

12. **Leaderboard (05)**
    ```
    Read 05-leaderboard-redesign.md and add the gradient shimmer title and game dropdown
    ```

13. **Account/Guild/Shop (06)**
    ```
    Read 06-account-guild-shop-redesign.md and update profile cards and shop layouts
    ```

14. **Media Hub (04)**
    ```
    Read 04-media-hub-redesign.md and add video card hover effects
    ```

### Phase 5: Polish

15. **Games UI (16)**
    ```
    Read 16-games-ui-audit.md and implement GameChrome and enhanced game over screens
    ```

16. **Accessibility (17)**
    ```
    Read 17-accessibility-performance.md and add reduced motion support and focus styles
    ```

---

## Quick Copy-Paste Commands

### Install Required Dependencies
```bash
# Confetti for celebrations
bun add canvas-confetti
bun add -D @types/canvas-confetti

# Optional: Particles background
bun add @tsparticles/react @tsparticles/slim
```

### Create Token Files
```bash
touch src/styles/tokens.css
touch src/config/tokens.ts
```

### Common One-Liners

**Implement design tokens:**
```
Read /wojak-ink/design-audit/11-design-token-system.md and create src/styles/tokens.css with all the CSS custom properties
```

**Add global animations:**
```
Read /wojak-ink/design-audit/07-global-animations-effects.md and implement the animated background gradient with noise texture
```

**Fix navigation:**
```
Read /wojak-ink/design-audit/03-header-navbar-redesign.md and update the header component with glassmorphism styling
```

**Make BigPulp prominent:**
```
Read /wojak-ink/design-audit/12-bigpulp-navigation-prominence.md and move BigPulp to position 2 in navigation with pulsing glow
```

**Add skeleton screens:**
```
Read /wojak-ink/design-audit/14-loading-states-skeletons.md and create skeleton components for cards, lists, and images
```

**Create toast system:**
```
Read /wojak-ink/design-audit/15-toast-notifications-feedback.md and implement the ToastProvider with success/error variants
```

---

## Testing Checklist

After each implementation, verify:

### Visual
- [ ] Looks correct on desktop (1920x1080)
- [ ] Looks correct on tablet (768x1024)
- [ ] Looks correct on mobile (390x844)
- [ ] Dark theme colors are consistent
- [ ] Animations are smooth (60fps)
- [ ] No layout shifts during loading

### Functional
- [ ] All buttons/links work
- [ ] No console errors
- [ ] Loading states appear correctly
- [ ] Transitions don't break navigation

### Performance
- [ ] Page loads in < 3 seconds on 4G
- [ ] No memory leaks (check Chrome DevTools)
- [ ] Bundle size hasn't increased significantly

### Accessibility
- [ ] Can navigate with keyboard
- [ ] Screen reader announcements work
- [ ] Focus states are visible
- [ ] Reduced motion is respected

---

## File Locations Reference

### Styles
- `src/styles/tokens.css` - Design tokens
- `src/styles/global.css` - Global styles
- `src/styles/animations.css` - Animation keyframes

### Components
- `src/components/layout/` - Header, Navbar, PageTransition
- `src/components/ui/` - Buttons, Cards, Inputs
- `src/components/feedback/` - Toast, Skeleton, LoadingStates
- `src/components/media/` - Game-related components

### Pages
- `src/pages/` - All page components
- `src/pages/GamesHub.tsx` - Games listing
- `src/pages/Gallery.tsx` - NFT gallery
- `src/pages/Generator.tsx` - Avatar generator

### Hooks
- `src/hooks/useLayout.ts` - Layout utilities
- `src/hooks/usePrefersReducedMotion.ts` - A11y hook
- `src/contexts/ToastContext.tsx` - Toast provider

---

## Notes

1. **Always test on mobile first** - iPhone is the primary target
2. **Use existing patterns** - The codebase already uses Framer Motion, follow those patterns
3. **Keep performance in mind** - Mobile users may have slower devices
4. **Commit frequently** - Make small, focused commits for each feature
5. **Ask for help** - Use BigPulp AI if you get stuck on implementation

---

## Progress Tracker

Use this to track which files have been implemented:

- [x] 00-DESIGN-AUDIT-OVERVIEW (Reference only)
- [x] 01-gallery-redesign (glassmorphism cards, gradient text, animated background, 3D hover, stagger animation - already implemented)
- [x] 02-generator-redesign (pulsing glow, layer tab glow, trait cards, action bar glass - already implemented)
- [x] 03-header-navbar-redesign (glassmorphism, logo pulse, connect shine, nav indicators - already implemented)
- [x] 04-media-hub-redesign (VideoCard hover/glow, staggered grid, MusicPlayer equalizer, shimmer, section headers - already implemented)
- [x] 05-leaderboard-redesign (gradient shimmer title, animated dropdown, sliding time filters, epic empty state, podium - already implemented)
- [x] 06-account-guild-shop-redesign (glassmorphism profile, avatar ring, wallet shine, guild hero, rarity glows, legendary pulse - already implemented)
- [x] 07-global-animations-effects (animations.css, utilities.css, PageTransition, useScrollReveal, useRipple, AmbientBackground)
- [x] 08-avatar-nft-connection-flow (generic emoji w/ upgrade indicator, NFT glow, upgrade banner, leaderboard gate, success celebration - already implemented)
- [x] 09-landing-page-scrollytelling (HeroSection parallax, FloatingNFTs, FeatureSection, ScrollNav, all preview components - already implemented)
- [x] 10-animation-libraries-reference (Reference only)
- [x] 11-design-token-system (tokens.css, tokens.ts, springs.ts)
- [x] 12-bigpulp-navigation-prominence (BigPulp at #2, featured: true, FAB-style mobile, badge indicator - already implemented)
- [x] 13-mobile-touch-optimizations (44px targets, tap feedback, momentum scroll, safe areas, BottomSheet, useKeyboardVisible, blur placeholders - already implemented)
- [x] 14-loading-states-skeletons (Skeleton.tsx, NFTCardSkeleton, GalleryGridSkeleton, BigPulpSkeleton, etc. - already implemented)
- [x] 15-toast-notifications-feedback (Toast.tsx, ConfirmModal, SuccessCheck, CopyButton - existed already)
- [x] 16-games-ui-audit (GameChrome, GameOverOverlay, GameIdleScreen, PauseMenu)
- [x] 17-accessibility-performance (usePrefersReducedMotion, SkipLink, OptimizedImage, useAnnounce)
