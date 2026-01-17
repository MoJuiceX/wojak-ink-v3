# Landing Page - Immersive Scrollytelling Experience

## Vision
A Pudgy Penguins-inspired landing page that introduces users to the entire Wojak.ink ecosystem through an engaging scroll-driven narrative with parallax effects and animated reveals.

**Reference:** [Pudgy Penguins](https://pudgypenguins.com/) - Awwwards Site of the Year 2024

---

## Page Structure

### Section 0: Hero (Above the Fold)
- BigPulp character front and center
- Animated tagline
- "Explore" scroll indicator
- Floating NFT previews in background

### Section 1: The Collection (Gallery)
- Parallax NFT grid floating in
- "4,200 Unique Wojaks" headline
- Character type previews
- CTA: "Browse Gallery"

### Section 2: BigPulp Intelligence
- BigPulp character animation
- AI analysis demo/preview
- "Your NFT Analyst" messaging
- CTA: "Ask BigPulp"

### Section 3: Create (Generator)
- Layer composition animation
- Live avatar builder preview
- "Build Your Wojak" headline
- CTA: "Start Creating"

### Section 4: Play (Games)
- Game icons floating/bouncing
- Mini gameplay previews
- "Compete & Earn" messaging
- CTA: "Play Games"

### Section 5: Community (Treasury/Guild)
- Crypto bubbles visualization
- Community stats
- "Join the Grove" headline
- CTA: "View Treasury"

### Section 6: Final CTA
- Connect wallet prompt
- All navigation options
- Social links

---

## Technical Implementation

### 1. Scroll-Linked Animations with Framer Motion

```tsx
import { motion, useScroll, useTransform } from 'framer-motion';

const LandingPage = () => {
  const { scrollYProgress } = useScroll();

  return (
    <div className="landing-page">
      <HeroSection scrollProgress={scrollYProgress} />
      <CollectionSection scrollProgress={scrollYProgress} />
      <BigPulpSection scrollProgress={scrollYProgress} />
      <GeneratorSection scrollProgress={scrollYProgress} />
      <GamesSection scrollProgress={scrollYProgress} />
      <CommunitySection scrollProgress={scrollYProgress} />
      <FinalCTASection />
    </div>
  );
};
```

### 2. Parallax Section Component

```tsx
interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number; // 0.5 = half speed, 2 = double speed
  className?: string;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.5,
  className
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <motion.section
      ref={ref}
      className={className}
      style={{ y, opacity }}
    >
      {children}
    </motion.section>
  );
};
```

### 3. Hero Section

```tsx
const HeroSection = ({ scrollProgress }) => {
  // Parallax layers at different speeds
  const bgY = useTransform(scrollProgress, [0, 0.3], [0, -150]);
  const midY = useTransform(scrollProgress, [0, 0.3], [0, -80]);
  const frontY = useTransform(scrollProgress, [0, 0.3], [0, -30]);
  const textOpacity = useTransform(scrollProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollProgress, [0, 0.2], [1, 0.9]);

  return (
    <section className="hero-section">
      {/* Background layer - orange grove */}
      <motion.div
        className="hero-bg-layer"
        style={{ y: bgY }}
      >
        <img src="/assets/grove-background.png" alt="" />
      </motion.div>

      {/* Mid layer - floating NFTs */}
      <motion.div
        className="hero-mid-layer"
        style={{ y: midY }}
      >
        <FloatingNFTs />
      </motion.div>

      {/* Front layer - BigPulp */}
      <motion.div
        className="hero-front-layer"
        style={{ y: frontY, scale }}
      >
        <motion.div
          className="bigpulp-hero"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img src="/assets/bigpulp-hero.png" alt="BigPulp" />
        </motion.div>
      </motion.div>

      {/* Text content */}
      <motion.div
        className="hero-content"
        style={{ opacity: textOpacity }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Welcome to the Grove
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          4,200 Unique Wojaks on Chia Blockchain
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="scroll-indicator"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ opacity: textOpacity }}
      >
        <span>Scroll to Explore</span>
        <div className="scroll-arrow">↓</div>
      </motion.div>
    </section>
  );
};
```

```css
.hero-section {
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-bg-layer,
.hero-mid-layer,
.hero-front-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-bg-layer {
  z-index: 1;
}

.hero-mid-layer {
  z-index: 2;
}

.hero-front-layer {
  z-index: 3;
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
}

.hero-content h1 {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 800;
  text-shadow: 0 0 40px rgba(249, 115, 22, 0.5);
  margin-bottom: 16px;
}

.hero-content p {
  font-size: clamp(1rem, 3vw, 1.5rem);
  opacity: 0.8;
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.scroll-arrow {
  font-size: 24px;
  margin-top: 8px;
}
```

### 4. Floating NFTs Component

```tsx
const FloatingNFTs = () => {
  const nftPreviews = [
    { id: 1, src: '/assets/nft-preview-1.png', x: '10%', y: '20%', delay: 0 },
    { id: 2, src: '/assets/nft-preview-2.png', x: '85%', y: '15%', delay: 0.5 },
    { id: 3, src: '/assets/nft-preview-3.png', x: '75%', y: '70%', delay: 1 },
    { id: 4, src: '/assets/nft-preview-4.png', x: '15%', y: '65%', delay: 1.5 },
  ];

  return (
    <>
      {nftPreviews.map((nft) => (
        <motion.div
          key={nft.id}
          className="floating-nft"
          style={{ left: nft.x, top: nft.y }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0.6, 0.8, 0.6],
            y: [0, -20, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            delay: nft.delay,
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img src={nft.src} alt="" />
        </motion.div>
      ))}
    </>
  );
};
```

```css
.floating-nft {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(249, 115, 22, 0.2);
}

.floating-nft img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### 5. Feature Section Template

```tsx
interface FeatureSectionProps {
  title: string;
  description: string;
  icon: string;
  ctaText: string;
  ctaLink: string;
  children: React.ReactNode;
  reverse?: boolean;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  description,
  icon,
  ctaText,
  ctaLink,
  children,
  reverse = false
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className={`feature-section ${reverse ? 'reverse' : ''}`}
    >
      <motion.div
        className="feature-content"
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span className="feature-icon">{icon}</span>
        <h2>{title}</h2>
        <p>{description}</p>
        <motion.a
          href={ctaLink}
          className="feature-cta"
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          {ctaText} →
        </motion.a>
      </motion.div>

      <motion.div
        className="feature-visual"
        initial={{ opacity: 0, x: reverse ? -50 : 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        {children}
      </motion.div>
    </section>
  );
};
```

```css
.feature-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 80px 5%;
  gap: 60px;
}

.feature-section.reverse {
  flex-direction: row-reverse;
}

.feature-content {
  flex: 1;
  max-width: 500px;
}

.feature-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 20px rgba(249, 115, 22, 0.5));
}

.feature-content h2 {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: white;
  margin-bottom: 16px;
}

.feature-content p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  margin-bottom: 24px;
}

.feature-cta {
  display: inline-flex;
  align-items: center;
  padding: 14px 28px;
  background: linear-gradient(135deg, #F97316, #EA580C);
  border-radius: 12px;
  color: white;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
}

.feature-visual {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mobile */
@media (max-width: 768px) {
  .feature-section,
  .feature-section.reverse {
    flex-direction: column;
    text-align: center;
  }

  .feature-content {
    max-width: 100%;
  }
}
```

### 6. Collection Section (Gallery Preview)

```tsx
const CollectionSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Staggered parallax for each character card
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [150, -50]);
  const y3 = useTransform(scrollYProgress, [0, 1], [80, -120]);

  return (
    <FeatureSection
      title="4,200 Unique Wojaks"
      description="Explore the complete Wojak Farmers Plot collection. 14 character types, infinite possibilities. Each NFT is a unique piece of Chia blockchain history."
      icon="🖼️"
      ctaText="Browse Gallery"
      ctaLink="/gallery"
    >
      <div ref={ref} className="collection-preview">
        <motion.div className="preview-card" style={{ y: y1 }}>
          <img src="/assets/preview-wojak.png" alt="Wojak" />
        </motion.div>
        <motion.div className="preview-card featured" style={{ y: y2 }}>
          <img src="/assets/preview-soyjak.png" alt="Soyjak" />
        </motion.div>
        <motion.div className="preview-card" style={{ y: y3 }}>
          <img src="/assets/preview-waifu.png" alt="Waifu" />
        </motion.div>
      </div>
    </FeatureSection>
  );
};
```

```css
.collection-preview {
  display: flex;
  gap: 20px;
  perspective: 1000px;
}

.preview-card {
  width: 150px;
  height: 150px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(249, 115, 22, 0.2);
  transform: rotateY(-5deg);
}

.preview-card.featured {
  width: 200px;
  height: 200px;
  transform: rotateY(0deg) scale(1.1);
  z-index: 2;
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(249, 115, 22, 0.3);
}

.preview-card:last-child {
  transform: rotateY(5deg);
}

.preview-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### 7. BigPulp Section

```tsx
const BigPulpSection = () => {
  return (
    <FeatureSection
      title="Meet BigPulp"
      description="Your AI-powered NFT analyst. Get instant insights on any Wojak - rarity rankings, market analysis, trait breakdowns, and personalized recommendations."
      icon="🍊"
      ctaText="Ask BigPulp"
      ctaLink="/bigpulp"
      reverse
    >
      <div className="bigpulp-preview">
        <motion.div
          className="bigpulp-character"
          animate={{
            y: [0, -15, 0],
            rotate: [-2, 2, -2]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img src="/assets/bigpulp-character.png" alt="BigPulp" />

          {/* Speech bubble */}
          <motion.div
            className="speech-bubble"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            "Let me analyze that for you!"
          </motion.div>
        </motion.div>
      </div>
    </FeatureSection>
  );
};
```

### 8. Navigation Dots (Side Indicator)

```tsx
const ScrollNav = ({ sections, activeSection }) => {
  return (
    <div className="scroll-nav">
      {sections.map((section, index) => (
        <motion.button
          key={section.id}
          className={`scroll-nav-dot ${activeSection === index ? 'active' : ''}`}
          onClick={() => scrollToSection(index)}
          whileHover={{ scale: 1.3 }}
        >
          <span className="dot-label">{section.label}</span>
        </motion.button>
      ))}
    </div>
  );
};
```

```css
.scroll-nav {
  position: fixed;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 100;
}

.scroll-nav-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.scroll-nav-dot.active {
  background: #F97316;
  box-shadow: 0 0 15px #F97316;
}

.scroll-nav-dot:hover .dot-label {
  opacity: 1;
  transform: translateX(-10px);
}

.dot-label {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%) translateX(0);
  background: rgba(0, 0, 0, 0.8);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: white;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s;
  pointer-events: none;
}
```

---

## Mobile Considerations

### Simplified Parallax on Mobile
```tsx
const isMobile = useMediaQuery('(max-width: 768px)');

// Reduce parallax intensity on mobile for performance
const parallaxMultiplier = isMobile ? 0.3 : 1;
const y = useTransform(scrollYProgress, [0, 1], [100 * parallaxMultiplier, -100 * parallaxMultiplier]);
```

### Touch-Friendly Scroll Indicators
- Larger touch targets
- Swipe hints instead of scroll arrows
- Snap scrolling between sections (optional)

---

## Performance Considerations

1. **will-change** - Add to animated elements
2. **transform-only** - Avoid animating width/height
3. **Image optimization** - Use WebP, lazy load below fold
4. **Reduce motion** - Respect prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .parallax-element {
    transform: none !important;
  }
}
```

---

## Implementation Checklist

- [ ] Create LandingPage component with section structure
- [ ] Implement Hero section with 3-layer parallax
- [ ] Add FloatingNFTs component with staggered animations
- [ ] Build FeatureSection reusable component
- [ ] Create Collection preview with parallax cards
- [ ] Create BigPulp section with character animation
- [ ] Create Generator section with layer preview
- [ ] Create Games section with bouncing icons
- [ ] Create Community/Treasury section
- [ ] Add ScrollNav dots indicator
- [ ] Implement mobile optimizations
- [ ] Add scroll-triggered animations with useInView
- [ ] Performance test on mobile devices

---

## Files to Create

1. `src/pages/Landing.tsx` - Main landing page
2. `src/components/landing/HeroSection.tsx`
3. `src/components/landing/FeatureSection.tsx`
4. `src/components/landing/FloatingNFTs.tsx`
5. `src/components/landing/ScrollNav.tsx`
6. `src/components/landing/CollectionPreview.tsx`
7. `src/components/landing/BigPulpPreview.tsx`
8. Update router to show Landing at `/` route

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/09-landing-page-scrollytelling.md and create a new immersive landing page with scroll-driven parallax animations. Start with the Hero section featuring BigPulp and floating NFTs, then add FeatureSection components for Gallery, BigPulp Intelligence, Generator, Games, and Community. Use Framer Motion's useScroll and useTransform for parallax effects. The page should introduce all site features as the user scrolls down.
```
