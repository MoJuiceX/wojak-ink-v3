/**
 * Landing Page - Immersive Scrollytelling Experience
 *
 * Premium landing page with Lenis smooth scroll, floating NFTs,
 * and real-time API data integration.
 */

import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScroll } from 'framer-motion';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureSection } from '@/components/landing/FeatureSection';
import { CollectionPreview } from '@/components/landing/CollectionPreview';
import { BigPulpPreview } from '@/components/landing/BigPulpPreview';
import { GeneratorPreview } from '@/components/landing/GeneratorPreview';
import { GamesPreview } from '@/components/landing/GamesPreview';
import { CommunityPreview } from '@/components/landing/CommunityPreview';
import { ScrollNav } from '@/components/landing/ScrollNav';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { SectionFloatingNFTs } from '@/components/landing/SectionFloatingNFTs';
import './Landing.css';

const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'collection', label: 'Gallery' },
  { id: 'bigpulp', label: 'BigPulp' },
  { id: 'generator', label: 'Create' },
  { id: 'games', label: 'Play' },
  { id: 'treasury', label: 'Treasury' },
  { id: 'cta', label: 'Join' },
];

export const Landing = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);

  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  // Track active section based on scroll position
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      const sectionIndex = Math.min(
        Math.floor(value * SECTIONS.length),
        SECTIONS.length - 1
      );
      setActiveSection(sectionIndex);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  const scrollToSection = (index: number) => {
    const sections = containerRef.current?.querySelectorAll('.landing-section');
    sections?.[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCTA = (path: string) => {
    navigate(path);
  };

  return (
    <div className="landing-page" ref={containerRef}>
      {/* Side Navigation Dots */}
      <ScrollNav
        sections={SECTIONS}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      {/* Hero Section */}
      <section id="hero" className="landing-section hero-section">
        <HeroSection
          scrollProgress={scrollYProgress}
          onExplore={() => scrollToSection(1)}
        />
      </section>

      {/* Collection / Gallery Section */}
      <section id="collection" className="landing-section">
        <SectionFloatingNFTs count={4} opacity={0.2} />
        <FeatureSection
          title="The Collection"
          description={<>Explore the complete Wojak Farmer's Plot collection.<br />4,200 unique NFTs waiting to be discovered.</>}
          icon=""
          ctaText="Browse Gallery"
          onCTA={() => handleCTA('/gallery')}
        >
          <CollectionPreview />
        </FeatureSection>
      </section>

      {/* BigPulp Intelligence Section */}
      <section id="bigpulp" className="landing-section">
        <SectionFloatingNFTs count={4} opacity={0.15} />
        <FeatureSection
          title="Meet BigPulp"
          description="Your AI-powered NFT analyst. Get instant insights on any Wojak—rarity rankings, market analysis, trade breakdowns, and more. Discover patterns and data not even the artist could tell you."
          icon="🍊"
          ctaText="Ask BigPulp"
          onCTA={() => handleCTA('/bigpulp')}
          reverse
        >
          <BigPulpPreview />
        </FeatureSection>
      </section>

      {/* Generator Section */}
      <section id="generator" className="landing-section">
        <SectionFloatingNFTs count={4} opacity={0.2} />
        <FeatureSection
          title="Build Your Wojak"
          description="Create your custom Wojak using the same base layers the artist used to craft 4,200 unique pieces. Mix and match Background, Base, Clothes, Face, Mouth, Face Wear, and Head attributes."
          icon="🎨"
          ctaText="Start Creating"
          onCTA={() => handleCTA('/generator')}
        >
          <GeneratorPreview />
        </FeatureSection>
      </section>

      {/* Games Section */}
      <section id="games" className="landing-section">
        <SectionFloatingNFTs count={4} opacity={0.2} />
        <FeatureSection
          title="Play & Have Fun"
          description="Play games with the community! Compete on individual and guild leaderboards. Earn 🍊 Oranges and 💎 Gems to personalize your account, vote on community decisions, and unlock items in the shop."
          icon="🎮"
          ctaText="Start Playing"
          onCTA={() => handleCTA('/games')}
          reverse
        >
          <GamesPreview />
        </FeatureSection>
      </section>

      {/* Treasury Section */}
      <section id="treasury" className="landing-section">
        <SectionFloatingNFTs count={4} opacity={0.2} />
        <FeatureSection
          title="Join the Grove"
          description="Connect with fellow collectors, join a guild, and track the community's treasury. Watch the collection grow in real-time. Together, we grow stronger."
          icon="🏦"
          ctaText="View Treasury"
          onCTA={() => handleCTA('/treasury')}
        >
          <CommunityPreview />
        </FeatureSection>
      </section>

      {/* Final CTA Section */}
      <section id="cta" className="landing-section final-cta-section">
        <FinalCTA />
      </section>
    </div>
  );
};

export default Landing;
