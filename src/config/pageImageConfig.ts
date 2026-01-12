/**
 * Page Image Configuration
 *
 * Defines the static image requirements for each page.
 * Dynamic images (like NFT lists) are registered by the pages themselves.
 */

import { CHARACTER_TYPES } from './characters';
import type { PageId } from '@/services/preloadCoordinator';

// ============ Static Images Per Page ============

export interface PageStaticImages {
  pageId: PageId;
  // Images that should load immediately when page is shown
  critical: string[];
  // Images that should preload when user might navigate to this page
  navigation: string[];
}

// Gallery page: character preview images
const galleryImages: PageStaticImages = {
  pageId: 'gallery',
  critical: CHARACTER_TYPES.map((c) => c.previewImage),
  navigation: CHARACTER_TYPES.slice(0, 6).map((c) => c.previewImage), // First 6 for nav preload
};

// Treasury page: token icons
const treasuryImages: PageStaticImages = {
  pageId: 'treasury',
  critical: [], // Token icons are loaded dynamically
  navigation: [],
};

// BigPulp page: character guides and UI images
const bigpulpImages: PageStaticImages = {
  pageId: 'bigpulp',
  critical: [], // NFT images loaded dynamically during analysis
  navigation: [],
};

// Generator page: layer/trait images
const generatorImages: PageStaticImages = {
  pageId: 'generator',
  critical: [], // Trait images loaded dynamically
  navigation: [],
};

// Media page: video thumbnails
const mediaImages: PageStaticImages = {
  pageId: 'media',
  critical: ['/assets/placeholder-video.jpg'], // Fallback placeholder
  navigation: ['/assets/placeholder-video.jpg'],
};

// Settings page: minimal images
const settingsImages: PageStaticImages = {
  pageId: 'settings',
  critical: [],
  navigation: [],
};

// ============ Export ============

export const PAGE_IMAGE_CONFIG: Record<PageId, PageStaticImages> = {
  gallery: galleryImages,
  treasury: treasuryImages,
  bigpulp: bigpulpImages,
  generator: generatorImages,
  media: mediaImages,
  settings: settingsImages,
};

/**
 * Get all critical images for a page
 */
export function getCriticalImages(pageId: PageId): string[] {
  return PAGE_IMAGE_CONFIG[pageId]?.critical || [];
}

/**
 * Get navigation preload images for a page
 */
export function getNavigationImages(pageId: PageId): string[] {
  return PAGE_IMAGE_CONFIG[pageId]?.navigation || [];
}

/**
 * Get all static images across all pages
 */
export function getAllStaticImages(): string[] {
  const images: string[] = [];
  for (const config of Object.values(PAGE_IMAGE_CONFIG)) {
    images.push(...config.critical, ...config.navigation);
  }
  return [...new Set(images)]; // Dedupe
}
