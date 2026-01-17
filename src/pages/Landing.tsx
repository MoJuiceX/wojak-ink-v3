/**
 * Landing Page - Immersive Scrollytelling Experience
 *
 * Pudgy Penguins-inspired landing page introducing the Wojak.ink ecosystem
 * through scroll-driven parallax animations and animated reveals.
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
import './Landing.css';

const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'collection', label: 'Gallery' },
  { id: 'bigpulp', label: 'BigPulp' },
  { id: 'generator', label: 'Create' },
  { id: 'games', label: 'Play' },
  { id: 'community', label: 'Community' },
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
        <FeatureSection
          title="4,200 Unique Wojaks"
          description="Explore the complete Wojak Farmers Plot collection. 14 character types, infinite possibilities. Each NFT is a unique piece of Chia blockchain history."
          icon="🖼️"
          ctaText="Browse Gallery"
          onCTA={() => handleCTA('/gallery')}
        >
          <CollectionPreview />
        </FeatureSection>
      </section>

      {/* BigPulp Intelligence Section */}
      <section id="bigpulp" className="landing-section">
        <FeatureSection
          title="Meet BigPulp"
          description="Your AI-powered NFT analyst. Get instant insights on any Wojak - rarity rankings, market analysis, trait breakdowns, and personalized recommendations."
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
        <FeatureSection
          title="Build Your Wojak"
          description="Create custom Wojak avatars with our layer-based generator. Mix and match backgrounds, bases, accessories, and more to design your perfect profile picture."
          icon="🎨"
          ctaText="Start Creating"
          onCTA={() => handleCTA('/generator')}
        >
          <GeneratorPreview />
        </FeatureSection>
      </section>

      {/* Games Section */}
      <section id="games" className="landing-section">
        <FeatureSection
          title="Compete & Earn"
          description="Play mini-games, climb the leaderboard, and earn bragging rights. Brick by Brick, Memory Match, Wojak Runner, and more await!"
          icon="🎮"
          ctaText="Play Games"
          onCTA={() => handleCTA('/games')}
          reverse
        >
          <GamesPreview />
        </FeatureSection>
      </section>

      {/* Community / Treasury Section */}
      <section id="community" className="landing-section">
        <FeatureSection
          title="Join the Grove"
          description="Connect with fellow collectors, join a guild, and track the community treasury. Together we grow stronger."
          icon="🌳"
          ctaText="View Treasury"
          onCTA={() => handleCTA('/treasury')}
        >
          <CommunityPreview />
        </FeatureSection>
      </section>

      {/* Final CTA Section */}
      <section id="cta" className="landing-section final-cta-section">
        <FinalCTA onNavigate={handleCTA} />
      </section>
    </div>
  );
};

export default Landing;
