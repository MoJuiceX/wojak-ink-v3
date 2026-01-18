# PROMPT: Landing Page Diagnostic & Information Gathering

## Your Task

I need to redesign the landing page to be immersive, interactive, and premium-feeling. Before I can create the implementation plan, I need you to gather specific information about the current codebase.

**DO NOT make any changes yet. Only research and report back.**

---

## Information I Need

### 1. Current Landing Page Structure

Read and summarize the structure of these files:

```
src/pages/LandingPage.tsx (or Landing.tsx or Home.tsx)
src/components/landing/*.tsx (all files in this folder)
src/styles/landing.css (or landing.scss, or wherever landing styles live)
```

For each component, tell me:
- What it renders
- What props it accepts
- What animations/effects it currently has
- Any dependencies (framer-motion, GSAP, etc.)

---

### 2. Current Sections

List ALL sections currently on the landing page in order. For each section:
- Component name
- What content it displays
- Does it have a CTA button? Where does it link?
- What animations does it have?

---

### 3. Routing Information

Read the router configuration and tell me:
- What is the route to Gallery? (`/gallery` or something else?)
- What is the route to Games? (`/games` or `/games-hub`?)
- What is the route to Generator? (`/generator` or `/wojak-generator`?)
- What is the route to BigPulp? (`/bigpulp` or `/pulp`?)
- What is the route to Treasury? (`/treasury`?)

I need exact routes for navigation buttons.

---

### 4. Assets Available

Check what assets exist for each section:

**BigPulp:**
```
ls -la public/assets/BigPulp/art/
```
What BigPulp images are available? (List filenames)

**NFTs for floating display:**
```
ls public/nfts/ (or wherever NFT images are stored)
```
How many NFT images are available? Are they optimized (webp)?

**Section backgrounds or graphics:**
Do any sections have dedicated background images or decorative assets?

---

### 5. Animation Libraries Installed

Check package.json and tell me:
- Is `framer-motion` installed? What version?
- Is `gsap` installed?
- Is `lenis` or `@studio-freight/lenis` installed?
- Any other animation libraries?

---

### 6. Current CSS/Styling Approach

Tell me:
- Is the project using Tailwind CSS?
- Is it using CSS modules?
- Is it using styled-components?
- Where are landing page styles defined?
- What CSS variables exist for colors? (look in globals.css or theme files)

---

### 7. Navigation Component

Read the main navigation/header component:
- Does a sticky header exist?
- What links are currently in the nav?
- How does mobile navigation work?

---

### 8. Scroll Behavior

Check if any smooth scroll library is configured:
- Is Lenis set up anywhere?
- Is there a scroll context or provider?
- How does the current "Scroll to Explore" button work?

---

## Output Format

Return your findings in this structure:

```
## 1. Landing Page Structure
[Your findings]

## 2. Current Sections
1. HeroSection - [description]
2. [Next section] - [description]
...

## 3. Routes
- Gallery: /[route]
- Games: /[route]
- Generator: /[route]
- BigPulp: /[route]
- Treasury: /[route]

## 4. Assets
- BigPulp images: [list]
- NFT images: [count and location]
- Other assets: [list]

## 5. Animation Libraries
- framer-motion: [version or not installed]
- gsap: [version or not installed]
- lenis: [version or not installed]

## 6. Styling
- Approach: [Tailwind/CSS Modules/etc]
- Style file: [path]
- Key CSS variables: [list]

## 7. Navigation
- Header component: [path]
- Current nav links: [list]
- Mobile: [description]

## 8. Scroll Behavior
- Smooth scroll: [yes/no, library]
- Scroll provider: [path or none]
```

---

## Files to Read

Priority order:
1. `src/pages/LandingPage.tsx` (or similar)
2. `src/components/landing/index.ts` (to see exports)
3. `src/components/landing/HeroSection.tsx`
4. `src/components/landing/FloatingNFTs.tsx`
5. All other files in `src/components/landing/`
6. `src/App.tsx` or router config
7. `src/styles/landing.css` or equivalent
8. `src/styles/globals.css`
9. `package.json` (for dependencies)
10. `src/components/layout/Header.tsx` or navigation component

---

**Remember: Research only, no changes. Report back with all findings.**
