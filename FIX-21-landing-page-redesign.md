# FIX-21: Landing Page Redesign - Premium Immersive Experience

## Overview

Complete redesign of the landing page with premium immersive experience. Every section features floating NFTs, smooth scrolling, parallax effects, and real-time data integration.

**Priority**: HIGH
**Complexity**: High
**Style**: Gaming/NFT Premium - Bold colors, dynamic animations, futuristic vibes

---

## Table of Contents
1. [Global Changes](#global-changes)
2. [Section 1: Hero](#section-1-hero)
3. [Section 2: Gallery](#section-2-gallery)
4. [Section 3: BigPulp](#section-3-bigpulp)
5. [Section 4: Generator](#section-4-generator)
6. [Section 5: Games](#section-5-games)
7. [Section 6: Treasury](#section-6-treasury)
8. [Section 7: Final CTA](#section-7-final-cta)

---

## Global Changes

### 1. Smooth Scroll (Remove Snap Behavior)

**Problem**: Current scroll-snap causes jarring "jumps" between sections.
**Solution**: Implement smooth scroll with Lenis for premium feel.

#### File: `src/pages/Landing.tsx` (MODIFY)

Remove any CSS scroll-snap and add Lenis:

```typescript
// Add import at top:
import Lenis from '@studio-freight/lenis';
import { useEffect, useRef } from 'react';

// Inside the component, add Lenis setup:
useEffect(() => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  return () => {
    lenis.destroy();
  };
}, []);
```

#### File: `src/pages/Landing.css` (MODIFY)

Remove scroll-snap:

```css
/* REMOVE these if they exist: */
/* scroll-snap-type: y mandatory; */
/* scroll-snap-align: start; */

/* ADD smooth scroll behavior: */
.landing-page {
  scroll-behavior: smooth;
}

.landing-section {
  /* Remove scroll-snap-align if present */
}
```

---

### 2. Global Floating NFTs Component

Every section should have subtle floating NFTs in the background. Create a reusable component:

#### File: `src/components/landing/SectionFloatingNFTs.tsx` (NEW)

```typescript
/**
 * Section Floating NFTs
 *
 * Subtle floating NFT decorations for any section.
 * Fewer and smaller than hero, positioned at edges.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const NFT_IMAGE_POOL = [
  '/assets/gallery-previews/alien-wojak.png',
  '/assets/gallery-previews/alien-baddie.png',
  '/assets/gallery-previews/alien-soyjak.png',
  '/assets/gallery-previews/alien-waifu.png',
  '/assets/gallery-previews/baddie.png',
  '/assets/gallery-previews/bepe-baddie.png',
  '/assets/gallery-previews/bepe-soyjak.png',
  '/assets/gallery-previews/bepe-waifu.png',
  '/assets/gallery-previews/bepe-wojak.png',
  '/assets/gallery-previews/monkey-zoo.png',
  '/assets/gallery-previews/papa-tang.png',
  '/assets/gallery-previews/soyjak.png',
  '/assets/gallery-previews/waifu.png',
  '/assets/gallery-previews/wojak.png',
];

interface Position {
  x: string;
  y: string;
  size: string;
  delay: number;
}

interface SectionFloatingNFTsProps {
  /** Number of NFTs to show (default: 4) */
  count?: number;
  /** Opacity of NFTs (default: 0.3 for subtle) */
  opacity?: number;
  /** Custom positions (optional) */
  positions?: Position[];
}

const DEFAULT_POSITIONS: Position[] = [
  { x: '2%', y: '15%', size: '60px', delay: 0 },
  { x: '92%', y: '25%', size: '50px', delay: 0.5 },
  { x: '5%', y: '75%', size: '55px', delay: 1 },
  { x: '88%', y: '80%', size: '45px', delay: 1.5 },
];

function getRandomImages(count: number): string[] {
  const shuffled = [...NFT_IMAGE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const SectionFloatingNFTs: React.FC<SectionFloatingNFTsProps> = ({
  count = 4,
  opacity = 0.3,
  positions = DEFAULT_POSITIONS,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [images, setImages] = useState<string[]>(() => getRandomImages(count));

  // Rotate images periodically
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setImages(prev => {
        const newImages = [...prev];
        const randomIndex = Math.floor(Math.random() * count);
        const currentSet = new Set(newImages);
        const available = NFT_IMAGE_POOL.filter(img => !currentSet.has(img));
        if (available.length > 0) {
          newImages[randomIndex] = available[Math.floor(Math.random() * available.length)];
        }
        return newImages;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [count, prefersReducedMotion]);

  return (
    <div className="section-floating-nfts">
      {positions.slice(0, count).map((pos, index) => (
        <motion.div
          key={index}
          className="section-floating-nft"
          style={{
            left: pos.x,
            top: pos.y,
            width: pos.size,
            height: pos.size,
            opacity,
          }}
          animate={
            !prefersReducedMotion
              ? { y: [0, -8, 0], rotate: [-2, 2, -2] }
              : {}
          }
          transition={{
            y: { duration: 4 + pos.delay, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 6 + pos.delay, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={images[index]}
              src={images[index]}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default SectionFloatingNFTs;
```

#### CSS for Section Floating NFTs

```css
/* ===== SECTION FLOATING NFTS ===== */

.section-floating-nfts {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.section-floating-nft {
  position: absolute;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.section-floating-nft img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .section-floating-nfts {
    display: none; /* Hide on mobile for performance */
  }
}
```

---

## Section 1: Hero

(Already detailed in previous version - includes QuickAccessBar, floating NFTs, rotating taglines)

### Key Points:
- QuickAccessBar with 4 buttons at top
- "Welcome to the Grove" barely touching BigPulp's crown
- Rotating taglines: "4,200 Unique Wojaks on Chia" | "Banger NFTs on Chia" | "Art for the Grove" | "Wojak Farmer's Plot"
- "Enter the Grove" button below BigPulp
- Floating NFTs with random rotation and crossfade

---

## Section 2: Gallery

### Banner Image
Save the provided banner to: `/public/assets/banners/gallery-banner.png`

### File: `src/components/landing/CollectionPreview.tsx` (REPLACE)

```typescript
/**
 * Collection Preview - Gallery Section
 *
 * Features:
 * - Banner image (Wojak Farmers Plot artwork)
 * - Collection stats with real numbers
 * - Floating NFT previews with rotation
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NFT_IMAGE_POOL = [
  '/assets/gallery-previews/alien-wojak.png',
  '/assets/gallery-previews/alien-baddie.png',
  '/assets/gallery-previews/alien-soyjak.png',
  '/assets/gallery-previews/alien-waifu.png',
  '/assets/gallery-previews/baddie.png',
  '/assets/gallery-previews/bepe-baddie.png',
  '/assets/gallery-previews/bepe-soyjak.png',
  '/assets/gallery-previews/bepe-waifu.png',
  '/assets/gallery-previews/bepe-wojak.png',
  '/assets/gallery-previews/monkey-zoo.png',
  '/assets/gallery-previews/papa-tang.png',
  '/assets/gallery-previews/soyjak.png',
  '/assets/gallery-previews/waifu.png',
  '/assets/gallery-previews/wojak.png',
];

// Collection stats
const COLLECTION_STATS = {
  baseCharacters: 14,
  totalTraits: 179,
  categories: [
    { name: 'Base', count: 14 },
    { name: 'Face', count: 6 },
    { name: 'Mouth', count: 20 },
    { name: 'Face Wear', count: 18 },
    { name: 'Head', count: 40 },
    { name: 'Clothes', count: 36 },
    { name: 'Background', count: 45 },
  ],
};

function getRandomImages(count: number): string[] {
  const shuffled = [...NFT_IMAGE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const CollectionPreview: React.FC = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [previewImages, setPreviewImages] = useState<string[]>(() => getRandomImages(3));

  // Rotate preview images
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setPreviewImages(prev => {
        const newImages = [...prev];
        const randomIndex = Math.floor(Math.random() * 3);
        const currentSet = new Set(newImages);
        const available = NFT_IMAGE_POOL.filter(img => !currentSet.has(img));
        if (available.length > 0) {
          newImages[randomIndex] = available[Math.floor(Math.random() * available.length)];
        }
        return newImages;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <div className="collection-preview">
      {/* Banner Image */}
      <motion.div
        className="collection-banner"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <img
          src="/assets/banners/gallery-banner.png"
          alt="Wojak Farmers Plot Collection"
          loading="lazy"
        />
      </motion.div>

      {/* Floating NFT Previews */}
      <div className="collection-nft-previews">
        {previewImages.map((src, index) => (
          <motion.div
            key={index}
            className="preview-nft-card"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            animate={
              !prefersReducedMotion
                ? {
                    y: [0, -10, 0],
                    rotate: index === 1 ? [0, 0, 0] : [-2, 2, -2],
                  }
                : {}
            }
            whileHover={{ scale: 1.05, zIndex: 10 }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={src}
                src={src}
                alt=""
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Collection Stats */}
      <motion.div
        className="collection-stats"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <p className="stats-headline">
          <span className="stat-number">{COLLECTION_STATS.baseCharacters}</span> base characters
          <span className="stat-divider">•</span>
          <span className="stat-number">{COLLECTION_STATS.totalTraits}</span> unique traits
        </p>
        <p className="stats-tagline">Each NFT is a unique piece of art</p>
      </motion.div>
    </div>
  );
};

export default CollectionPreview;
```

### CSS for Collection Preview

```css
/* ===== COLLECTION PREVIEW ===== */

.collection-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 100%;
  max-width: 800px;
}

.collection-banner {
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(249, 115, 22, 0.2);
  border: 2px solid rgba(249, 115, 22, 0.3);
}

.collection-banner img {
  width: 100%;
  height: auto;
  display: block;
}

.collection-nft-previews {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.preview-nft-card {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.4),
    0 0 25px rgba(249, 115, 22, 0.2);
  border: 2px solid rgba(249, 115, 22, 0.4);
  cursor: pointer;
  transition: border-color 0.3s;
}

.preview-nft-card:hover {
  border-color: rgba(249, 115, 22, 0.8);
}

.preview-nft-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collection-stats {
  text-align: center;
}

.stats-headline {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 8px 0;
}

.stat-number {
  color: #F97316;
  font-weight: 700;
}

.stat-divider {
  margin: 0 12px;
  color: rgba(255, 255, 255, 0.4);
}

.stats-tagline {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  margin: 0;
}

@media (max-width: 600px) {
  .preview-nft-card {
    width: 90px;
    height: 90px;
  }

  .stats-headline {
    font-size: 1.1rem;
  }
}
```

### Section 2 Text Update

In `Landing.tsx`, update the Gallery section:

```typescript
<section id="collection" className="landing-section">
  <SectionFloatingNFTs count={4} opacity={0.2} />
  <FeatureSection
    title="The Collection"
    description="Explore the complete Wojak Farmer's Plot collection. 4,200 unique NFTs waiting to be discovered."
    icon="" // Remove emoji, we have banner now
    ctaText="Browse Gallery"
    onCTA={() => navigate('/gallery')}
  >
    <CollectionPreview />
  </FeatureSection>
</section>
```

---

## Section 3: BigPulp

### Changes:
- Bigger BigPulp image
- Speech bubble animates separately from BigPulp
- Updated description text

### File: `src/components/landing/BigPulpPreview.tsx` (REPLACE)

```typescript
/**
 * BigPulp Preview - Landing Section
 *
 * Features:
 * - Larger BigPulp image
 * - Speech bubble with SEPARATE animation
 * - Typing effect for AI responses
 */

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const SAMPLE_INSIGHTS = [
  "This Wojak has a 0.8% rarity score...",
  "Crown + Wizard combo appears in only 12 NFTs...",
  "Average sale price for Alien base: 2.4 XCH...",
  "This trait combination is ultra rare...",
];

export const BigPulpPreview: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [insightIndex, setInsightIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');

  // Typing effect for insights
  useEffect(() => {
    const fullText = SAMPLE_INSIGHTS[insightIndex];
    let charIndex = 0;
    setDisplayText('');

    const typingInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayText(fullText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        // Move to next insight after delay
        setTimeout(() => {
          setInsightIndex((prev) => (prev + 1) % SAMPLE_INSIGHTS.length);
        }, 3000);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [insightIndex]);

  return (
    <div className="bigpulp-preview">
      {/* BigPulp Character - Larger */}
      <motion.div
        className="bigpulp-character-large"
        animate={
          !prefersReducedMotion
            ? { y: [0, -12, 0] }
            : {}
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <img
          src="/assets/BigPulp/art/BigP_crown.png"
          alt="BigPulp AI Analyst"
          loading="lazy"
        />
      </motion.div>

      {/* Speech Bubble - SEPARATE Animation */}
      <motion.div
        className="bigpulp-speech-bubble"
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        whileInView={{ opacity: 1, scale: 1, x: 0 }}
        viewport={{ once: true }}
        animate={
          !prefersReducedMotion
            ? {
                y: [0, -6, 0],
                rotate: [0, 1, 0],
              }
            : {}
        }
        transition={{
          y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
          rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <div className="speech-bubble-content">
          <span className="typing-text">{displayText}</span>
          <span className="typing-cursor">|</span>
        </div>
        <div className="speech-bubble-tail" />
      </motion.div>
    </div>
  );
};

export default BigPulpPreview;
```

### CSS for BigPulp Preview

```css
/* ===== BIGPULP PREVIEW ===== */

.bigpulp-preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.bigpulp-character-large {
  width: clamp(250px, 40vw, 400px);
  filter: drop-shadow(0 0 60px rgba(249, 115, 22, 0.4));
}

.bigpulp-character-large img {
  width: 100%;
  height: auto;
}

.bigpulp-speech-bubble {
  position: absolute;
  top: 10%;
  right: -20%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 16px 20px;
  max-width: 250px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.speech-bubble-content {
  color: #1a1a2e;
  font-size: 0.95rem;
  line-height: 1.4;
}

.typing-cursor {
  animation: blink 1s infinite;
  color: #F97316;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.speech-bubble-tail {
  position: absolute;
  bottom: 30%;
  left: -10px;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 15px solid rgba(255, 255, 255, 0.95);
}

@media (max-width: 768px) {
  .bigpulp-speech-bubble {
    position: relative;
    top: auto;
    right: auto;
    margin-top: 20px;
  }

  .speech-bubble-tail {
    display: none;
  }
}
```

### Section 3 Text Update

```typescript
<section id="bigpulp" className="landing-section">
  <SectionFloatingNFTs count={4} opacity={0.15} />
  <FeatureSection
    title="Meet BigPulp"
    description="Your AI-powered NFT analyst. Get instant insights on any Wojak—rarity rankings, market analysis, trade breakdowns, and more. Discover patterns and data not even the artist could tell you. With constant data fetching, BigPulp reveals average prices by attribute, historical trends, and collection-wide analytics that only AI can derive."
    icon="🍊"
    ctaText="Ask BigPulp"
    onCTA={() => navigate('/bigpulp')}
    reverse
  >
    <BigPulpPreview />
  </FeatureSection>
</section>
```

---

## Section 4: Generator

### File: `src/components/landing/GeneratorPreview.tsx` (MODIFY)

Update the attribute labels to use correct metadata:

```typescript
/**
 * Generator Preview
 *
 * Shows the 7 correct metadata attributes
 */

const ATTRIBUTES = [
  { name: 'Background', count: 45, icon: '🌄' },
  { name: 'Base', count: 14, icon: '👤' },
  { name: 'Clothes', count: 36, icon: '👕' },
  { name: 'Face', count: 6, icon: '😶' },
  { name: 'Mouth', count: 20, icon: '👄' },
  { name: 'Face Wear', count: 18, icon: '👓' },
  { name: 'Head', count: 40, icon: '👑' },
];

// In the render, show these as clickable pills/tags
```

### Section 4 Text Update

```typescript
<section id="generator" className="landing-section">
  <SectionFloatingNFTs count={4} opacity={0.2} />
  <FeatureSection
    title="Build Your Wojak"
    description="Create your custom Wojak using the same base layers the artist used to craft 4,200 unique pieces. Mix and match Background, Base, Clothes, Face, Mouth, Face Wear, and Head attributes. Step into the artist's shoes and discover how much fun it is to design your perfect profile picture."
    icon="🎨"
    ctaText="Start Creating"
    onCTA={() => navigate('/generator')}
  >
    <GeneratorPreview />
  </FeatureSection>
</section>
```

---

## Section 5: Games

### Section 5 Text Update

```typescript
<section id="games" className="landing-section">
  <SectionFloatingNFTs count={4} opacity={0.2} />
  <FeatureSection
    title="Play & Have Fun"
    description="Play games with the community! Compete on individual and guild leaderboards—guilds carried over from One Grove Gaming. Earn 🍊 Oranges and 💎 Gems to personalize your account, vote on community decisions, and unlock items in the shop. Most importantly—have fun!"
    icon="🎮"
    ctaText="Start Playing"
    onCTA={() => navigate('/games')}
    reverse
  >
    <GamesPreview />
  </FeatureSection>
</section>
```

---

## Section 6: Treasury (with Real-Time API Data)

### File: `src/components/landing/CommunityPreview.tsx` (REPLACE)

```typescript
/**
 * Community/Treasury Preview
 *
 * Shows real-time collection stats from MintGarden API
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const COLLECTION_ID = 'col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';

interface CollectionStats {
  tradeCount: number;
  marketCap: number;
  volume: number;
  floorPrice: number;
  isLoading: boolean;
  error: string | null;
}

export const CommunityPreview: React.FC = () => {
  const [stats, setStats] = useState<CollectionStats>({
    tradeCount: 0,
    marketCap: 0,
    volume: 0,
    floorPrice: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `https://api.mintgarden.io/collections/${COLLECTION_ID}`
        );

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();

        // Calculate market cap: floor × supply
        const floor = data.floor || 0;
        const supply = data.supply || 4200;
        const marketCap = floor * supply;

        setStats({
          tradeCount: data.trade_count || 0,
          marketCap: marketCap,
          volume: data.volume || 0,
          floorPrice: floor,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: 'Unable to load stats',
        }));
      }
    };

    fetchStats();

    // Refresh every 2 minutes
    const interval = setInterval(fetchStats, 120000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(decimals);
  };

  return (
    <div className="community-preview">
      <div className="community-stats-grid">
        {/* Total Trades */}
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0 }}
        >
          <span className="stat-value">
            {stats.isLoading ? '...' : formatNumber(stats.tradeCount, 0)}
          </span>
          <span className="stat-label">Total Trades</span>
        </motion.div>

        {/* Market Cap */}
        <motion.div
          className="stat-card featured"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <span className="stat-value">
            {stats.isLoading ? '...' : formatNumber(stats.marketCap)}
            <span className="stat-unit">XCH</span>
          </span>
          <span className="stat-label">Market Cap</span>
        </motion.div>

        {/* Volume */}
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <span className="stat-value">
            {stats.isLoading ? '...' : formatNumber(stats.volume)}
            <span className="stat-unit">XCH</span>
          </span>
          <span className="stat-label">Total Volume</span>
        </motion.div>
      </div>

      {stats.error && (
        <p className="stats-error">{stats.error}</p>
      )}
    </div>
  );
};

export default CommunityPreview;
```

### CSS for Community Preview

```css
/* ===== COMMUNITY PREVIEW ===== */

.community-preview {
  width: 100%;
  max-width: 600px;
}

.community-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 16px;
  padding: 24px 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: rgba(249, 115, 22, 0.5);
  transform: translateY(-4px);
}

.stat-card.featured {
  background: rgba(249, 115, 22, 0.1);
  border-color: rgba(249, 115, 22, 0.4);
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: #F97316;
  margin-bottom: 8px;
}

.stat-unit {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 4px;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stats-error {
  text-align: center;
  color: rgba(255, 100, 100, 0.8);
  font-size: 0.9rem;
  margin-top: 16px;
}

@media (max-width: 600px) {
  .community-stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-value {
    font-size: 1.6rem;
  }
}
```

### Section 6 Text Update

```typescript
<section id="treasury" className="landing-section">
  <SectionFloatingNFTs count={4} opacity={0.2} />
  <FeatureSection
    title="Join the Grove"
    description="Connect with fellow collectors, join a guild, and track the community's treasury. Watch the collection grow in real-time. Together, we grow stronger."
    icon="🏦"
    ctaText="View Treasury"
    onCTA={() => navigate('/treasury')}
  >
    <CommunityPreview />
  </FeatureSection>
</section>
```

---

## Section 7: Final CTA

### File: `src/components/landing/FinalCTA.tsx` (REPLACE)

```typescript
/**
 * Final CTA Section
 *
 * - Centered "Enter the Grove" button
 * - Floating NFTs on left and right
 * - No wallet connect button
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NFT_IMAGE_POOL = [
  '/assets/gallery-previews/alien-wojak.png',
  '/assets/gallery-previews/alien-baddie.png',
  '/assets/gallery-previews/bepe-waifu.png',
  '/assets/gallery-previews/bepe-wojak.png',
  '/assets/gallery-previews/monkey-zoo.png',
  '/assets/gallery-previews/papa-tang.png',
  '/assets/gallery-previews/soyjak.png',
  '/assets/gallery-previews/waifu.png',
  '/assets/gallery-previews/wojak.png',
];

const POSITIONS = {
  left: [
    { x: '5%', y: '20%', size: 100, delay: 0 },
    { x: '8%', y: '50%', size: 80, delay: 0.3 },
    { x: '3%', y: '75%', size: 90, delay: 0.6 },
  ],
  right: [
    { x: '85%', y: '15%', size: 90, delay: 0.2 },
    { x: '88%', y: '45%', size: 85, delay: 0.5 },
    { x: '82%', y: '70%', size: 95, delay: 0.8 },
  ],
};

function getRandomImages(count: number): string[] {
  const shuffled = [...NFT_IMAGE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [leftImages, setLeftImages] = useState<string[]>(() => getRandomImages(3));
  const [rightImages, setRightImages] = useState<string[]>(() => getRandomImages(3));

  // Rotate images
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      const side = Math.random() > 0.5 ? 'left' : 'right';
      const setter = side === 'left' ? setLeftImages : setRightImages;

      setter(prev => {
        const newImages = [...prev];
        const randomIndex = Math.floor(Math.random() * 3);
        const currentSet = new Set([...leftImages, ...rightImages]);
        const available = NFT_IMAGE_POOL.filter(img => !currentSet.has(img));
        if (available.length > 0) {
          newImages[randomIndex] = available[Math.floor(Math.random() * available.length)];
        }
        return newImages;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, leftImages, rightImages]);

  return (
    <div className="final-cta-section">
      {/* Left Floating NFTs */}
      <div className="cta-floating-nfts left">
        {POSITIONS.left.map((pos, index) => (
          <motion.div
            key={`left-${index}`}
            className="cta-floating-nft"
            style={{
              left: pos.x,
              top: pos.y,
              width: pos.size,
              height: pos.size,
            }}
            animate={
              !prefersReducedMotion
                ? {
                    y: [0, -15, 0],
                    rotate: [-5, 5, -5],
                  }
                : {}
            }
            transition={{
              y: { duration: 4 + pos.delay, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 5 + pos.delay, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={leftImages[index]}
                src={leftImages[index]}
                alt=""
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              />
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Right Floating NFTs */}
      <div className="cta-floating-nfts right">
        {POSITIONS.right.map((pos, index) => (
          <motion.div
            key={`right-${index}`}
            className="cta-floating-nft"
            style={{
              left: pos.x,
              top: pos.y,
              width: pos.size,
              height: pos.size,
            }}
            animate={
              !prefersReducedMotion
                ? {
                    y: [0, -12, 0],
                    rotate: [5, -5, 5],
                  }
                : {}
            }
            transition={{
              y: { duration: 3.5 + pos.delay, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 4.5 + pos.delay, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={rightImages[index]}
                src={rightImages[index]}
                alt=""
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              />
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Centered CTA Content */}
      <motion.div
        className="cta-content-centered"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2>Ready to Join?</h2>
        <p>Become part of the Wojak Farmer's Plot community</p>

        <motion.button
          className="enter-grove-btn large"
          onClick={() => navigate('/gallery')}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 50px rgba(249, 115, 22, 0.6)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="btn-glow" />
          <span className="btn-text">Enter the Grove</span>
          <span className="btn-arrow">→</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default FinalCTA;
```

### CSS for Final CTA

```css
/* ===== FINAL CTA SECTION ===== */

.final-cta-section {
  position: relative;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-floating-nfts {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cta-floating-nft {
  position: absolute;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(249, 115, 22, 0.2);
  border: 2px solid rgba(249, 115, 22, 0.3);
}

.cta-floating-nft img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cta-content-centered {
  text-align: center;
  z-index: 10;
}

.cta-content-centered h2 {
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 800;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #fff 0%, #F97316 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cta-content-centered p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px 0;
}

.enter-grove-btn.large {
  padding: 22px 50px;
  font-size: 1.4rem;
}

@media (max-width: 768px) {
  .cta-floating-nfts {
    display: none;
  }
}
```

---

## Testing Checklist

### Global
- [ ] Smooth scroll works (no snap jumping)
- [ ] Lenis initialized correctly
- [ ] Floating NFTs appear on all sections (desktop)
- [ ] Reduced motion preferences respected

### Section 1: Hero
- [ ] QuickAccessBar at top
- [ ] Rotating taglines every 4 seconds
- [ ] BigPulp floating animation
- [ ] "Enter the Grove" button works

### Section 2: Gallery
- [ ] Banner image displays correctly
- [ ] 3 floating NFT previews
- [ ] Stats show: "14 base characters • 179 traits"
- [ ] "Each NFT is a unique piece of art" tagline

### Section 3: BigPulp
- [ ] Larger BigPulp image
- [ ] Speech bubble animates SEPARATELY
- [ ] Typing effect works
- [ ] Updated description text

### Section 4: Generator
- [ ] Shows 7 correct attributes
- [ ] Updated description text

### Section 5: Games
- [ ] "Play & Have Fun" heading
- [ ] Mentions oranges and gems
- [ ] Updated description

### Section 6: Treasury
- [ ] Real-time data loads from MintGarden API
- [ ] Shows: Total Trades, Market Cap, Volume
- [ ] Loading states work
- [ ] Error handling works

### Section 7: Final CTA
- [ ] NO wallet connect button
- [ ] "Enter the Grove" centered
- [ ] Floating NFTs on left and right

---

## Package Dependencies

Ensure these are installed:

```bash
npm install @studio-freight/lenis
```

If not already installed:
```bash
npm install framer-motion
```

---

## Files Summary

| File | Action |
|------|--------|
| `public/assets/banners/gallery-banner.png` | ADD (from user) |
| `src/pages/Landing.tsx` | MODIFY (add Lenis, update sections) |
| `src/pages/Landing.css` | MODIFY (remove snap, add styles) |
| `src/components/landing/QuickAccessBar.tsx` | CREATE |
| `src/components/landing/SectionFloatingNFTs.tsx` | CREATE |
| `src/components/landing/HeroSection.tsx` | MODIFY (already updated) |
| `src/components/landing/FloatingNFTs.tsx` | REPLACE |
| `src/components/landing/CollectionPreview.tsx` | REPLACE |
| `src/components/landing/BigPulpPreview.tsx` | REPLACE |
| `src/components/landing/GeneratorPreview.tsx` | MODIFY |
| `src/components/landing/GamesPreview.tsx` | MODIFY (if needed) |
| `src/components/landing/CommunityPreview.tsx` | REPLACE |
| `src/components/landing/FinalCTA.tsx` | REPLACE |
