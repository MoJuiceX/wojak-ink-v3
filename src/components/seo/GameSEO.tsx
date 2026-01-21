/**
 * GameSEO Component
 *
 * Provides SEO optimization for game pages including:
 * - Visually hidden H1 tag
 * - VideoGame structured data (JSON-LD)
 */

import { useEffect } from 'react';

interface GameSEOProps {
  gameName: string;
  gameSlug: string;
  description: string;
  genre?: string;
}

export function GameSEO({ gameName, gameSlug, description, genre = 'Casual' }: GameSEOProps) {
  useEffect(() => {
    // Add VideoGame structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `game-schema-${gameSlug}`;
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': ['VideoGame', 'WebApplication'],
      name: gameName,
      description: description,
      url: `https://wojak.ink/games/${gameSlug}`,
      genre: genre,
      gamePlatform: 'Web Browser',
      applicationCategory: 'Game',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      author: {
        '@type': 'Organization',
        name: 'Wojak.ink',
        url: 'https://wojak.ink',
      },
    });
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(`game-schema-${gameSlug}`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [gameName, gameSlug, description, genre]);

  return (
    <h1 className="sr-only">
      {gameName} - Free Online Arcade Game | Wojak.ink
    </h1>
  );
}

export default GameSEO;
