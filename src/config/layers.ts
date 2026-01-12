/**
 * Layer Configuration
 *
 * Configuration for the Wojak generator layer system.
 */

import type { UILayerName } from '@/lib/wojakRules';
import type { LayerConfig, RandomizationConfig } from '@/types/generator';

// ============ Layer Definitions ============

export const LAYER_CONFIG: Record<UILayerName, LayerConfig> = {
  Background: {
    order: 0,
    required: false,
    label: 'Background',
    icon: 'Image',
    description: '',
  },
  Base: {
    order: 1,
    required: true,
    label: 'Base',
    icon: 'User',
    description: '',
  },
  Clothes: {
    order: 2,
    required: false,
    label: 'Clothes',
    icon: 'Shirt',
    description: '',
  },
  FacialHair: {
    order: 3,
    required: false,
    label: 'Facial Hair',
    icon: 'Smile',
    description: 'Neckbeard and Stache - renders under mouth',
  },
  MouthBase: {
    order: 4,
    required: false,
    label: 'Mouth',
    icon: 'Smile',
    description: 'Base mouth expressions - Numb, Smile, Teeth, etc.',
  },
  MouthItem: {
    order: 5,
    required: false,
    label: 'Mouth Item',
    icon: 'Cigarette',
    description: 'Cigarettes, Joint, Cohiba - renders on top of mouth',
  },
  Mask: {
    order: 6,
    required: false,
    label: 'Mask',
    icon: 'Mask',
    description: '',
  },
  Eyes: {
    order: 7,
    required: false,
    label: 'Eyes',
    icon: 'Eye',
    description: '',
  },
  Head: {
    order: 8,
    required: false,
    label: 'Head',
    icon: 'Crown',
    description: '',
  },
} as const;

// ============ Layer Order for UI ============

export const LAYER_ORDER: UILayerName[] = [
  'Base',
  'Clothes',
  'MouthBase',
  'MouthItem',
  'FacialHair',
  'Mask',
  'Eyes',
  'Head',
  'Background',
];

// ============ Base Types ============

export const BASE_TYPES = [
  { id: 'classic', name: 'Classic', rarity: 0.4 },
  { id: 'rekt', name: 'Rekt', rarity: 0.25 },
  { id: 'rugged', name: 'Rugged', rarity: 0.2 },
  { id: 'bleeding', name: 'Bleeding', rarity: 0.1 },
  { id: 'terminator', name: 'Terminator', rarity: 0.05 },
] as const;

// ============ Canvas Dimensions ============

export const CANVAS_CONFIG = {
  renderSize: 1024, // Internal render resolution
  displaySize: 512, // Default display size
  thumbnailSize: 256, // Favorites thumbnail size
  exportSizes: {
    '512': { width: 512, height: 512 },
    '1024': { width: 1024, height: 1024 },
    '2048': { width: 2048, height: 2048 },
  },
} as const;

// ============ Randomization Config ============

export const RANDOMIZATION_CONFIG: RandomizationConfig = {
  optionalLayerChance: 0.6, // 60% chance to select optional layer
  mouthExclusiveChance: 0.3, // 30% chance to pick exclusive mouth item
  underlayChance: 0.3, // 30% chance for facial hair
  baseChance: 0.7, // 70% chance for base mouth expression
  overlayChance: 0.3, // 30% chance for mouth item
} as const;

// ============ Helper Functions ============

/**
 * Get layer config by name
 */
export function getLayerConfig(name: UILayerName): LayerConfig {
  return LAYER_CONFIG[name];
}

/**
 * Check if a layer is required
 */
export function isLayerRequired(name: UILayerName): boolean {
  return LAYER_CONFIG[name].required;
}
