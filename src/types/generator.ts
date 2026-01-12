/**
 * Generator Types
 *
 * Type definitions for the Wojak avatar generator system.
 */

import type { UILayerName } from '@/lib/memeLayers';

// Re-export for convenience
export type { UILayerName, GeneratorLayerName } from '@/lib/memeLayers';

// ============ Layer System Types ============

// Simple string type for Trait.layer to maintain compatibility
export type LayerType =
  | 'background'
  | 'base'
  | 'clothes'
  | 'facialhair'
  | 'mouthbase'
  | 'mouthitem'
  | 'mask'
  | 'eyes'
  | 'head';

export interface Layer {
  type: UILayerName;
  order: number; // Rendering order (0 = bottom)
  required: boolean; // Must have a selection
  traits: Trait[];
  selectedTrait: Trait | null;
}

export interface Trait {
  id: string; // Unique identifier
  name: string; // Display name
  layer: LayerType;
  imagePath: string; // Path to trait image
  thumbnailPath: string; // Smaller preview image

  // Rendering properties
  zIndex?: number; // Override layer order
  offsetX?: number; // Position offset (px)
  offsetY?: number;

  // Combination rules
  rules?: TraitRules;

  // Metadata
  rarity?: number; // For randomization weighting (0-1)
  tags?: string[]; // For filtering/grouping
}

export interface TraitRules {
  // Mouth layer subtypes (legacy compatibility)
  mouthSubtype?: MouthSubtype;

  // Blocking rules
  blocks?: UILayerName[]; // This trait blocks other layers
  blockedBy?: string[]; // Trait IDs that block this trait

  // Dependency rules
  requires?: string[]; // Must have one of these traits
  requiresLayer?: UILayerName[]; // Must have selection in these layers

  // Combination rules
  exclusive?: boolean; // Can't combine with other mouth traits
  combinable?: boolean; // Can be combined with base mouth
}

// ============ Mouth Layer Specifics (Legacy) ============

export type MouthSubtype =
  | 'underlay' // Neckbeard, Stache (render below base)
  | 'base' // Numb, Smile, Teeth, Screaming
  | 'overlay' // Cig, Cohiba, Joint (render on top)
  | 'exclusive'; // Bandana-Mask, Bubble-Gum, Pipe, Pizza

export interface MouthSelection {
  underlay: Trait | null; // One underlay max
  base: Trait | null; // One base max
  overlay: Trait | null; // One overlay max (requires base)
  exclusive: Trait | null; // Replaces all others
}

export interface MouthValidation {
  isValid: boolean;
  warnings: MouthWarning[];
}

export interface MouthWarning {
  type: 'blocked' | 'requires' | 'exclusive' | 'incompatible';
  message: string;
  traitId: string;
}

export interface MouthSubtypeConfig {
  label: string;
  description: string;
  renderOrder: number;
  traits: string[];
  maxSelections: number;
  combinableWith: MouthSubtype[];
  requiresBase?: boolean;
  isExclusive?: boolean;
}

// ============ Generator State ============

export type SelectedLayers = Partial<Record<UILayerName, string>>;

export interface GeneratorState {
  selectedLayers: SelectedLayers;

  // UI state
  activeLayer: UILayerName;
  isRendering: boolean;
  hasUnsavedChanges: boolean;

  // Preview
  previewImage: string | null; // Data URL of current composition
  isPreviewStale: boolean; // Needs re-render

  // Sticky preview (mobile)
  showStickyPreview: boolean;
  scrollPosition: number;

  // Disabled state from rules engine
  disabledLayers: UILayerName[];
  disabledOptions: Partial<Record<UILayerName, string[]>>;
  disabledReasons: Record<string, string>;
}

// ============ Favorites System ============

export interface FavoriteWojak {
  id: string; // UUID
  name: string; // User-editable name
  createdAt: Date;
  updatedAt: Date;

  // Selection state
  selections: SelectedLayers;

  // Cached preview
  thumbnailDataUrl: string; // 256x256 preview
}

// ============ Export Types ============

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp';
  size: ExportSize;
  quality?: number; // 0-1 for lossy formats
  includeBackground: boolean;
}

export type ExportSize =
  | { preset: '512' } // 512x512
  | { preset: '1024' } // 1024x1024 (default)
  | { preset: '2048' } // 2048x2048
  | { custom: { width: number; height: number } };

// ============ Layer Config Types ============

export interface LayerConfig {
  order: number;
  required: boolean;
  label: string;
  icon: string; // Lucide icon name
  description: string;
  hasSubtypes?: boolean;
}

// ============ Blocking Rules ============

export interface BlockingRule {
  blocks: UILayerName[];
  message: string;
}

// ============ Randomization ============

export interface RandomizationConfig {
  optionalLayerChance: number; // 0-1 chance to select optional layer
  mouthExclusiveChance: number; // 0-1 chance to pick exclusive mouth
  underlayChance: number;
  baseChance: number;
  overlayChance: number;
}

// ============ History (Undo/Redo) ============

export interface HistoryEntry {
  selections: SelectedLayers;
  timestamp: number;
}

export interface HistoryState {
  past: HistoryEntry[];
  present: HistoryEntry;
  future: HistoryEntry[];
  maxHistory: number;
}
