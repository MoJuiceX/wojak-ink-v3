/**
 * Generator Service
 *
 * Loads Wojak layer data from manifest.json for the character generator.
 * Implements the complex layer categorization from wojak-ink-mobile.
 */

import type { Trait } from '@/types/generator';
import { UI_LAYER_NAMES, type UILayerName } from '@/lib/memeLayers';
import { formatDisplayLabel, cleanDisplayName } from '@/lib/traitOptions';

// ============ Types ============

type ManifestData = Record<string, string[]>;

export interface LayerImage {
  path: string;
  name: string;
  displayName: string;
  category?: string;
}

// ============ Cache ============

let manifestCache: ManifestData | null = null;
const layerImagesCache: Map<UILayerName, LayerImage[]> = new Map();

// ============ Mouth Item Classification ============

// Items from MOUTH folder that belong to MouthBase
const MOUTH_BASE_PATTERNS = ['numb', 'smile', 'screeming', 'teeth', 'gold-teeth', 'pizza', 'pipe', 'bubble-gum'];

// Items from MOUTH folder that belong to MouthItem (EXTRA_MOUTH prefix with these names)
const MOUTH_ITEM_PATTERNS = ['cig', 'cohiba', 'joint'];

// Items from MOUTH folder that belong to Mask
const MASK_PATTERNS = ['bandana-mask', 'hannibal-mask', 'copium-mask'];

// Items from MOUTH folder (EXTRA_MOUTH prefix) that belong to FacialHair
const FACIAL_HAIR_PATTERNS = ['neckbeard', 'stach'];

// Base layer sort order
const BASE_SORT_ORDER = ['classic', 'rekt', 'rugged', 'bleeding', 'terminator'];

// Background cashtag sort order (within $CASHTAG folder)
const BACKGROUND_CASHTAG_ORDER = ['bepe', 'caster', 'hoa', 'pizza', 'honk', 'neck', 'chia', 'love'];

// Background category order: $CASHTAG first, then Plain Backgrounds, then Scene
const BACKGROUND_CATEGORY_ORDER = ['$cashtag', 'plain', 'scene'];

// ============ Loaders ============

async function loadManifest(): Promise<ManifestData> {
  if (manifestCache) return manifestCache;

  try {
    const response = await fetch('/assets/wojak-layers/manifest.json');
    if (!response.ok) throw new Error('Failed to load layer manifest');
    manifestCache = await response.json();
    return manifestCache!;
  } catch (error) {
    console.error('Failed to load manifest:', error);
    return {};
  }
}

function parseDisplayName(filepath: string): string {
  const cleaned = cleanDisplayName(filepath);
  return formatDisplayLabel(cleaned);
}

function classifyMouthItem(filepath: string): UILayerName | null {
  const lower = filepath.toLowerCase();
  const filename = filepath.split('/').pop()?.toLowerCase() || '';

  // Check for EXTRA_MOUTH items first
  if (filename.startsWith('extra_mouth')) {
    // FacialHair items
    for (const pattern of FACIAL_HAIR_PATTERNS) {
      if (lower.includes(pattern)) {
        return 'FacialHair';
      }
    }
    // Mask items (Copium)
    for (const pattern of MASK_PATTERNS) {
      if (lower.includes(pattern)) {
        return 'Mask';
      }
    }
    // MouthItem items (Cig, Joint, Cohiba)
    for (const pattern of MOUTH_ITEM_PATTERNS) {
      if (lower.includes(pattern)) {
        return 'MouthItem';
      }
    }
    return null;
  }

  // Regular MOUTH items
  // Mask items (Bandana, Hannibal)
  for (const pattern of MASK_PATTERNS) {
    if (lower.includes(pattern)) {
      return 'Mask';
    }
  }

  // MouthBase items
  for (const pattern of MOUTH_BASE_PATTERNS) {
    if (lower.includes(pattern)) {
      return 'MouthBase';
    }
  }

  return null;
}

function buildLayerImages(manifest: ManifestData): void {
  // Clear cache
  layerImagesCache.clear();

  // Initialize all UI layers
  for (const layerName of UI_LAYER_NAMES) {
    layerImagesCache.set(layerName as UILayerName, []);
  }

  // Process BACKGROUND
  if (manifest['BACKGROUND']) {
    const images: LayerImage[] = manifest['BACKGROUND'].map((filepath) => ({
      path: `/assets/wojak-layers/BACKGROUND/${filepath}`,
      name: filepath.split('/').pop()?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || '',
      displayName: parseDisplayName(filepath),
      category: filepath.includes('/') ? filepath.split('/')[0] : undefined,
    }));
    // Sort backgrounds: $CASHTAG (in specific order), then Plain Backgrounds, then Scene
    images.sort((a, b) => {
      const aPath = a.path.toLowerCase();
      const bPath = b.path.toLowerCase();

      // Determine category index
      const getCategoryIndex = (path: string): number => {
        for (let i = 0; i < BACKGROUND_CATEGORY_ORDER.length; i++) {
          if (path.includes(BACKGROUND_CATEGORY_ORDER[i])) return i;
        }
        return 999;
      };

      const aCatIndex = getCategoryIndex(aPath);
      const bCatIndex = getCategoryIndex(bPath);

      // If different categories, sort by category
      if (aCatIndex !== bCatIndex) {
        return aCatIndex - bCatIndex;
      }

      // If both are $CASHTAG, sort by specific order
      if (aCatIndex === 0) {
        const aTagIndex = BACKGROUND_CASHTAG_ORDER.findIndex((tag) => aPath.includes(tag));
        const bTagIndex = BACKGROUND_CASHTAG_ORDER.findIndex((tag) => bPath.includes(tag));
        return (aTagIndex === -1 ? 999 : aTagIndex) - (bTagIndex === -1 ? 999 : bTagIndex);
      }

      // Otherwise keep original order
      return 0;
    });
    layerImagesCache.set('Background', images);
  }

  // Process BASE
  if (manifest['BASE']) {
    const images: LayerImage[] = manifest['BASE'].map((filepath) => ({
      path: `/assets/wojak-layers/BASE/${filepath}`,
      name: filepath.split('/').pop()?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || '',
      displayName: parseDisplayName(filepath),
    }));
    // Sort base images by predefined order
    images.sort((a, b) => {
      const aLower = a.path.toLowerCase();
      const bLower = b.path.toLowerCase();
      const aIndex = BASE_SORT_ORDER.findIndex((name) => aLower.includes(name));
      const bIndex = BASE_SORT_ORDER.findIndex((name) => bLower.includes(name));
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
    layerImagesCache.set('Base', images);
  }

  // Process CLOTHES
  if (manifest['CLOTHES']) {
    const images: LayerImage[] = manifest['CLOTHES'].map((filepath) => ({
      path: `/assets/wojak-layers/CLOTHES/${filepath}`,
      name: filepath.split('/').pop()?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || '',
      displayName: parseDisplayName(filepath),
    }));
    layerImagesCache.set('Clothes', images);
  }

  // Process EYE -> Eyes
  if (manifest['EYE']) {
    const images: LayerImage[] = manifest['EYE']
      .map((filepath) => ({
        path: `/assets/wojak-layers/EYE/${filepath}`,
        name: filepath.split('/').pop()?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || '',
        displayName: parseDisplayName(filepath),
      }));
    layerImagesCache.set('Eyes', images);
  }

  // Process HEAD
  if (manifest['HEAD']) {
    const images: LayerImage[] = manifest['HEAD'].map((filepath) => ({
      path: `/assets/wojak-layers/HEAD/${filepath}`,
      name: filepath.split('/').pop()?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || '',
      displayName: parseDisplayName(filepath),
    }));
    layerImagesCache.set('Head', images);
  }

  // Process MOUTH -> categorize into MouthBase, MouthItem, Mask, FacialHair
  if (manifest['MOUTH']) {
    const mouthBaseImages: LayerImage[] = [];
    const mouthItemImages: LayerImage[] = [];
    const maskImages: LayerImage[] = [];
    const facialHairImages: LayerImage[] = [];

    for (const filepath of manifest['MOUTH']) {
      const category = classifyMouthItem(filepath);
      const image: LayerImage = {
        path: `/assets/wojak-layers/MOUTH/${filepath}`,
        name: filepath.split('/').pop()?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || '',
        displayName: parseDisplayName(filepath),
      };

      switch (category) {
        case 'MouthBase':
          mouthBaseImages.push(image);
          break;
        case 'MouthItem':
          mouthItemImages.push(image);
          break;
        case 'Mask':
          maskImages.push(image);
          break;
        case 'FacialHair':
          facialHairImages.push(image);
          break;
      }
    }

    layerImagesCache.set('MouthBase', mouthBaseImages);
    layerImagesCache.set('MouthItem', mouthItemImages);
    layerImagesCache.set('Mask', maskImages);
    layerImagesCache.set('FacialHair', facialHairImages);
  }

  // Process MASK folder (skull masks, etc.) - add to existing Mask images
  if (manifest['MASK']) {
    const existingMaskImages = layerImagesCache.get('Mask') || [];
    const newMaskImages: LayerImage[] = manifest['MASK'].map((filepath) => ({
      path: `/assets/wojak-layers/MASK/${filepath}`,
      name: filepath.split('/').pop()?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || '',
      displayName: parseDisplayName(filepath),
    }));
    layerImagesCache.set('Mask', [...existingMaskImages, ...newMaskImages]);
  }
}

// ============ Public API ============

export function getAllLayerImages(layerName: UILayerName): LayerImage[] {
  return layerImagesCache.get(layerName) || [];
}

export function getLayerImageByPath(layerName: UILayerName, path: string): LayerImage | undefined {
  const images = layerImagesCache.get(layerName);
  return images?.find((img) => img.path === path);
}

// ============ Service Interface ============

export interface IGeneratorService {
  getAllTraits(): Promise<Trait[]>;
  getTraitsByLayer(layer: UILayerName): Promise<Trait[]>;
  getTraitById(id: string): Promise<Trait | null>;
  prefetchLayers(): Promise<void>;
  getLayerImages(layer: UILayerName): Promise<LayerImage[]>;
}

function convertToTrait(image: LayerImage, layer: UILayerName, index: number): Trait {
  return {
    id: `${layer.toLowerCase()}-${index}`,
    name: image.name,
    layer: layer.toLowerCase() as Trait['layer'],
    imagePath: image.path,
    thumbnailPath: image.path,
    rarity: 0,
    tags: image.category ? [image.category] : [],
  };
}

class GeneratorService implements IGeneratorService {
  private initialized = false;

  async prefetchLayers(): Promise<void> {
    if (this.initialized) return;

    const manifest = await loadManifest();
    buildLayerImages(manifest);
    this.initialized = true;
  }

  async getLayerImages(layer: UILayerName): Promise<LayerImage[]> {
    await this.prefetchLayers();
    return getAllLayerImages(layer);
  }

  async getAllTraits(): Promise<Trait[]> {
    await this.prefetchLayers();

    const allTraits: Trait[] = [];

    for (const layerName of UI_LAYER_NAMES) {
      const images = getAllLayerImages(layerName as UILayerName);
      images.forEach((image, index) => {
        allTraits.push(convertToTrait(image, layerName as UILayerName, index));
      });
    }

    return allTraits;
  }

  async getTraitsByLayer(layer: UILayerName): Promise<Trait[]> {
    await this.prefetchLayers();

    const images = getAllLayerImages(layer);
    return images.map((image, index) => convertToTrait(image, layer, index));
  }

  async getTraitById(id: string): Promise<Trait | null> {
    const allTraits = await this.getAllTraits();
    return allTraits.find((t) => t.id === id) || null;
  }
}

// Singleton instance
export const generatorService = new GeneratorService();
