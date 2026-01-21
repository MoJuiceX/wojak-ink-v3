/**
 * GameSEO Component
 *
 * Provides SEO optimization for game pages including:
 * - Dynamic meta tags via react-helmet-async
 * - VideoGame structured data (JSON-LD)
 * - Visually hidden H1 tag for accessibility
 */

import { Helmet } from 'react-helmet-async';

interface GameSEOProps {
  gameName: string;
  gameSlug: string;
  description: string;
  genre?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

const BASE_URL = 'https://wojak.ink';
const SITE_NAME = 'Wojak.ink';
const TWITTER_HANDLE = '@MoJuiceX';

export function GameSEO({
  gameName,
  gameSlug,
  description,
  genre = 'Arcade',
  difficulty = 'Medium',
}: GameSEOProps) {
  const fullUrl = `${BASE_URL}/games/${gameSlug}`;
  const fullTitle = `${gameName} - Free Online ${genre} Game | ${SITE_NAME}`;
  const fullDescription = `${description} Play free in your browser on Wojak.ink - no download required!`;

  // VideoGame structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: gameName,
    description: description,
    url: fullUrl,
    genre: [genre, 'Casual', 'Browser Game'],
    gamePlatform: ['Web Browser', 'Mobile Browser'],
    applicationCategory: 'Game',
    operatingSystem: 'Any',
    playMode: 'SinglePlayer',
    numberOfPlayers: {
      '@type': 'QuantitativeValue',
      value: 1,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    author: {
      '@type': 'Organization',
      name: 'Wojak.ink',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Wojak.ink',
      url: BASE_URL,
    },
    inLanguage: 'en',
    isFamilyFriendly: true,
    accessibilityFeature: ['touchInput', 'mouseInput'],
    contentRating: 'Everyone',
    // Custom property to indicate difficulty
    ...(difficulty && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'difficulty',
        value: difficulty,
      }
    }),
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={fullDescription} />
        <link rel="canonical" href={fullUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={fullDescription} />
        <meta property="og:site_name" content={SITE_NAME} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content={fullUrl} />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={fullDescription} />
        <meta name="twitter:site" content={TWITTER_HANDLE} />

        {/* Game-specific meta */}
        <meta name="application-name" content={gameName} />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Visually hidden H1 for SEO and accessibility */}
      <h1 className="sr-only">
        {gameName} - Free Online {genre} Game
      </h1>
    </>
  );
}

export default GameSEO;
