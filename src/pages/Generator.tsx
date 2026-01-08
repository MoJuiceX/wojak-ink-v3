import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSpinner,
  IonModal,
} from '@ionic/react';
import { shuffle, sparkles, banOutline, openOutline, heartOutline, heart, trashOutline, close, pencilOutline, checkmarkOutline } from 'ionicons/icons';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Media } from '@capacitor-community/media';
import './Generator.css';

// Layer configuration for tabs (UI order)
const LAYERS = [
  { name: 'Base', folder: 'BASE', prefix: 'BASE_' },
  { name: 'Head', folder: 'HEAD', prefix: 'HEAD_' },
  { name: 'Eyes', folder: 'EYE', prefix: 'EYE_' },
  { name: 'Mouth', folder: 'MOUTH', prefix: 'MOUTH_' },
  { name: 'Clothes', folder: 'CLOTHES', prefix: 'CLOTHES_' },
  { name: 'Background', folder: 'BACKGROUND', prefix: 'BACKGROUND_' },
];

// Render order (z-index, bottom to top)
const RENDER_ORDER = ['Background', 'Base', 'Clothes', 'Mouth', 'Eyes', 'Head'];

// Special layer rules for Astronaut suit
const ASTRONAUT_BLOCKED_LAYERS = ['Head'];
const ASTRONAUT_BLOCKED_TRAITS = {
  Mouth: ['Bandana-Mask', 'Bubble-Gum', 'Pipe', 'Pizza', 'Cig', 'Cohiba', 'Joint', 'Copium-Mask', 'Neckbeard', 'stach'],
};

// Mouth trait categories for multi-selection logic
// Underlay mouth traits: rendered UNDER all other mouth layers (facial hair)
const MOUTH_UNDERLAY_TRAITS = ['Neckbeard', 'stach'];
// Base mouth traits: rendered above underlay
const MOUTH_BASE_TRAITS = ['numb', 'screeming', 'smile', 'Teeth', 'Gold-Teeth'];
// Overlay mouth traits: rendered on top, can combine with base traits
const MOUTH_OVERLAY_TRAITS = ['Joint', 'Cohiba', 'Cig', 'Copium-Mask'];
// Overlays that REQUIRE a base trait (default to numb if none selected)
const MOUTH_OVERLAYS_REQUIRING_BASE = ['Cig', 'Cohiba', 'Joint'];
// Underlays that REQUIRE a base trait (default to numb if none selected)
const MOUTH_UNDERLAYS_REQUIRING_BASE = ['Neckbeard', 'stach'];
// Exclusive mouth traits: cannot combine with anything
const MOUTH_EXCLUSIVE_TRAITS = ['Bandana-Mask', 'Bubble-Gum', 'Pipe', 'Pizza'];
// Special: Hannibal-Mask forces numb underneath
const MOUTH_HANNIBAL = 'Hannibal-Mask';

// Mouth traits that render ON TOP of Centurion head
const MOUTH_OVER_CENTURION = ['stach', 'Pizza', 'Bubble-Gum', 'Pipe', 'Joint', 'Cohiba', 'Sick'];

// Secondary mouth traits (can be combined with base traits)
const MOUTH_SECONDARY_TRAITS = [...MOUTH_OVERLAY_TRAITS, ...MOUTH_UNDERLAY_TRAITS];

// Mouth masks that require Centurion to use the mask variant
const MOUTH_MASKS_FOR_CENTURION = ['Hannibal-Mask', 'Bandana-Mask'];

// Custom display order for Base grid
const BASE_DISPLAY_ORDER = [
  'classic',
  'rekt',
  'rugged',
  'bleeding',
  'terminator',
];

// Base traits that show numb mouth overlay in grid preview
const BASE_WITH_NUMB_OVERLAY = ['classic', 'rekt', 'rugged', 'bleeding', 'terminator'];
const NUMB_MOUTH_PATH = '/assets/wojak-layers/MOUTH/MOUTH_numb.png';

// Custom display order for Background grid
const BACKGROUND_DISPLAY_ORDER = [
  'Chia Green',
  'Green Candle',
  'Golden Hour',
  'Hot Coral',
  'Mellow Yellow',
  'Sky Shock Blue',
  'Tangerine Pop',
  'Neo Mint',
  'Radioactive Forest',
  'Sky Dive',
  // Scene backgrounds
  'Bepe Barracks',
  'Chia Farm',
  'Hell',
  'Matrix',
  'Basement',
  'Moon',
  'NYSE Dump',
  'NYSE Pump',
  'Nesting Grounds',
  'One Market',
  'Orange Grove',
  'Ronin Dojo',
  'Route 66',
  'Silicon',
  'Spell Room',
  'White House',
  // $CASHTAG backgrounds
  '$BEPE',
  '$CASTER',
  '$HOA',
  '$PIZZA',
  '$HONK',
  '$NECKCOIN',
  '$LOVE',
  '$CHIA',
];

// Custom display order for Mouth grid
const MOUTH_DISPLAY_ORDER = [
  'numb',
  'smile',
  'Teeth',
  'Gold-Teeth',
  'screeming',
  'Cig',
  'Cohiba',
  'Joint',
  'Pipe',
  'Bubble-Gum',
  'Pizza',
  'Neckbeard',
  'stach',
  'Copium-Mask',
  'Hannibal-Mask',
  'Bandana-Mask',
];

// Check which mouth category a trait belongs to
function getMouthTraitCategory(path: string): 'underlay' | 'base' | 'overlay' | 'exclusive' | 'hannibal' | null {
  if (path.includes(MOUTH_HANNIBAL)) return 'hannibal';
  if (MOUTH_EXCLUSIVE_TRAITS.some(t => path.includes(t))) return 'exclusive';
  if (MOUTH_OVERLAY_TRAITS.some(t => path.includes(t))) return 'overlay';
  if (MOUTH_UNDERLAY_TRAITS.some(t => path.includes(t))) return 'underlay';
  if (MOUTH_BASE_TRAITS.some(t => path.includes(t))) return 'base';
  return null;
}

// Check if a trait is blocked when Astronaut is selected
function isBlockedByAstronaut(layerName: string, path?: string): boolean {
  if (ASTRONAUT_BLOCKED_LAYERS.includes(layerName)) return true;
  if (path) {
    const blockedTraits = ASTRONAUT_BLOCKED_TRAITS[layerName as keyof typeof ASTRONAUT_BLOCKED_TRAITS];
    if (blockedTraits) {
      return blockedTraits.some(trait => path.includes(trait));
    }
  }
  return false;
}

// Check if Astronaut suit is selected
function isAstronautSelected(selections: Record<string, string | string[]>): boolean {
  const clothes = selections.Clothes;
  if (Array.isArray(clothes)) return clothes.some(c => c.includes('Astronaut'));
  return clothes?.includes('Astronaut') || false;
}

function isCenturionSelected(selections: Record<string, string | string[]>): boolean {
  const head = selections.Head;
  if (Array.isArray(head)) return head.some(h => h.toLowerCase().includes('centurion'));
  return head?.toLowerCase().includes('centurion') || false;
}

function isMouthOverCenturion(path: string): boolean {
  return MOUTH_OVER_CENTURION.some(trait => path.includes(trait));
}

function needsCenturionMask(selections: Record<string, string | string[]>): boolean {
  const mouth = selections.Mouth;
  if (!mouth) return false;
  const mouthPaths = Array.isArray(mouth) ? mouth : [mouth];
  return mouthPaths.some(path => MOUTH_MASKS_FOR_CENTURION.some(mask => path.includes(mask)));
}

function getCenturionPath(selections: Record<string, string | string[]>, originalPath: string): string {
  if (needsCenturionMask(selections)) {
    return originalPath.replace('HEAD_Centurion_.png', 'HEAD_Centurion_mask.png');
  }
  return originalPath;
}

// Check if a base trait path needs numb mouth overlay in grid preview
function baseNeedsNumbOverlay(path: string): boolean {
  const pathLower = path.toLowerCase();
  return BASE_WITH_NUMB_OVERLAY.some(base => pathLower.includes(base.toLowerCase()));
}

// Check if a mouth trait is a secondary (combinable) attribute
function isSecondaryMouthTrait(path: string): boolean {
  return MOUTH_SECONDARY_TRAITS.some(trait => path.includes(trait));
}

interface LayerImage {
  filename: string;
  displayName: string;
  path: string;
}

interface LayerData {
  name: string;
  folder: string;
  images: LayerImage[];
}

// Capitalize first letter of each word
function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Parse filename to get display name
function parseDisplayName(filename: string, prefix: string, folder: string): string {
  let name = filename;

  // For MOUTH folder, handle both MOUTH_ and EXTRA_MOUTH_ prefixes
  if (folder === 'MOUTH') {
    if (filename.startsWith('EXTRA_MOUTH_')) {
      name = filename.replace('EXTRA_MOUTH_', '');
    } else {
      name = filename.replace(prefix, '');
    }
    name = name.replace('.png', '');
  } else {
    // Remove prefix and extension
    name = filename.replace(prefix, '').replace('.png', '');
  }

  // For BASE layer, only show the last part
  if (folder === 'BASE') {
    const parts = name.split(/[_-]/);
    name = parts[parts.length - 1] || name;
    if (parts.length >= 2 && parts[parts.length - 2] === 'bleeding') {
      name = 'Bleeding Bags';
    } else {
      name = toTitleCase(name);
    }
  } else {
    // Replace underscores and dashes with spaces
    name = name.replace(/[_-]/g, ' ').trim();
  }

  // Apply name fixes to match NFT metadata
  const nameLower = name.toLowerCase();

  // Wizard Hat Man → Wizard + color (e.g., "Wizard Orange")
  if (nameLower.includes('wizard') && nameLower.includes('hat')) {
    const colors = ['orange', 'blue', 'green', 'pink', 'purple', 'red'];
    for (const color of colors) {
      if (nameLower.includes(color)) {
        return `Wizard ${color.charAt(0).toUpperCase() + color.slice(1)}`;
      }
    }
    return 'Wizard';
  }

  // Super Mario + color
  if (nameLower.includes('super') && nameLower.includes('mario')) {
    const colors = ['green', 'purple', 'red'];
    for (const color of colors) {
      if (nameLower.includes(color)) {
        return `Super Mario ${color.charAt(0).toUpperCase() + color.slice(1)}`;
      }
    }
    return 'Super Mario';
  }

  // Standard Cut + color
  if (nameLower.includes('standard') && nameLower.includes('cut')) {
    if (nameLower.includes('blond')) return 'Standard Cut Blonde';
    if (nameLower.includes('brown')) return 'Standard Cut Brown';
    return 'Standard Cut';
  }

  // Fedora (colors) → Fedora
  if (nameLower.includes('fedora')) {
    return 'Fedora';
  }

  // Cowboy Hat (colors) → Cowboy Hat
  if (nameLower.includes('cowboy') && nameLower.includes('hat')) {
    return 'Cowboy Hat';
  }

  // Anarchy Spikes → Spikes + color
  if (nameLower.includes('spikes')) {
    if (nameLower.includes('pink')) return 'Spikes Pink';
    if (nameLower.includes('red')) return 'Spikes Red';
    return 'Spikes';
  }

  // SWAT Helmet - keep full name
  if (nameLower.includes('swat') && nameLower.includes('helmet')) {
    return 'SWAT Helmet';
  }

  // Super Saiyan - keep as is (not "Super Saiyan Uniform")
  if (nameLower.includes('super') && nameLower.includes('saiyan')) {
    return 'Super Saiyan';
  }

  // Fix typo: screeming → Screaming
  if (nameLower === 'screeming') {
    return 'Screaming';
  }

  // Fix abbreviation: stach → Stache
  if (nameLower === 'stach') {
    return 'Stache';
  }

  // Apply title case to ensure proper capitalization
  let result = toTitleCase(name) || 'Default';

  // Keep MOG uppercase (after title case)
  if (result.toLowerCase().includes('mog')) {
    result = result.replace(/mog/gi, 'MOG');
  }

  return result;
}

const Generator: React.FC = () => {
  const [layerData, setLayerData] = useState<LayerData[]>([]);
  const [selections, setSelections] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState<string>('Base');
  const [showMiniPreview, setShowMiniPreview] = useState(false);
  const [animatingLayer, setAnimatingLayer] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Array<{ name: string; selections: Record<string, string | string[]> }>>(() => {
    const saved = localStorage.getItem('wojakFavorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [exporting, setExporting] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [editingFavoriteIndex, setEditingFavoriteIndex] = useState<number | null>(null);
  const [editingFavoriteName, setEditingFavoriteName] = useState('');

  const previewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  // Observe when main preview scrolls out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show mini preview when main preview is less than 20% visible
        setShowMiniPreview(!entry.isIntersecting || entry.intersectionRatio < 0.2);
      },
      { threshold: [0, 0.2, 1] }
    );

    if (previewRef.current) {
      observer.observe(previewRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Clear animation after it plays
  useEffect(() => {
    if (animatingLayer) {
      const timer = setTimeout(() => setAnimatingLayer(null), 200);
      return () => clearTimeout(timer);
    }
  }, [animatingLayer]);

  // Generate combined preview image for long-press saving
  useEffect(() => {
    const generatePreview = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 512; // Good quality for preview
      canvas.width = size;
      canvas.height = size;

      // Collect all layers to render
      const layersToRender: { path: string; zIndex: number }[] = [];

      RENDER_ORDER.forEach(layerName => {
        if (layerName === 'Mouth') {
          const mouth = selections.Mouth;
          if (!mouth) return;
          const mouthPaths = Array.isArray(mouth) ? mouth : [mouth];
          const sorted = [...mouthPaths].sort((a, b) => {
            const catA = getMouthTraitCategory(a);
            const catB = getMouthTraitCategory(b);
            const order: Record<string, number> = { underlay: 0, base: 1, exclusive: 1, hannibal: 2, overlay: 3 };
            return (order[catA || 'base'] || 1) - (order[catB || 'base'] || 1);
          });

          const hasRektBase = (selections.Base as string)?.includes('rekt');

          const hasCenturion = isCenturionSelected(selections);

          sorted.forEach((path, index) => {
            const isBubbleGum = path.includes('Bubble-Gum');
            let layerZIndex = isBubbleGum ? RENDER_ORDER.indexOf('Eyes') + 1 : RENDER_ORDER.indexOf('Mouth') + index;

            // If Centurion is selected, certain mouth traits render on top of Head
            if (hasCenturion && isMouthOverCenturion(path)) {
              layerZIndex = RENDER_ORDER.indexOf('Head') + 1;
            }

            layersToRender.push({ path, zIndex: layerZIndex });

            if (isBubbleGum && hasRektBase) {
              layersToRender.push({
                path: '/assets/wojak-layers/MOUTH/MOUTH_Bubble-Gum_rekt.png',
                zIndex: layerZIndex + 1
              });
            }
          });
          return;
        }

        const selection = selections[layerName];
        if (!selection || (Array.isArray(selection) && selection.length === 0)) return;

        let path = Array.isArray(selection) ? selection[0] : selection;
        let zIndex = RENDER_ORDER.indexOf(layerName);

        // Centurion mask variant when Hannibal or Bandana mask is selected
        if (layerName === 'Head' && path.includes('Centurion')) {
          path = getCenturionPath(selections, path);
        }

        if (layerName === 'Clothes' && isAstronautSelected(selections)) {
          zIndex = RENDER_ORDER.length + 10;
        }

        const mouthSelection = selections.Mouth;
        const hasBubbleGum = Array.isArray(mouthSelection)
          ? mouthSelection.some(m => m.includes('Bubble-Gum'))
          : mouthSelection?.includes('Bubble-Gum');
        const isLaserEyes = layerName === 'Eyes' && path.includes('Laser-Eyes');

        if (isLaserEyes && hasBubbleGum) {
          zIndex = RENDER_ORDER.indexOf('Eyes') + 3;
        }

        layersToRender.push({ path, zIndex });
      });

      if (layersToRender.length === 0) {
        setPreviewDataUrl(null);
        return;
      }

      // Sort by z-index
      layersToRender.sort((a, b) => a.zIndex - b.zIndex);

      // Load and draw all images
      try {
        for (const layer of layersToRender) {
          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              ctx.drawImage(img, 0, 0, size, size);
              resolve();
            };
            img.onerror = reject;
            img.src = layer.path;
          });
        }

        setPreviewDataUrl(canvas.toDataURL('image/png'));
      } catch (error) {
        console.error('Preview generation failed:', error);
      }
    };

    generatePreview();
  }, [selections]);

  // Load layer images from manifest
  useEffect(() => {
    const loadLayers = async () => {
      try {
        const response = await fetch('/assets/wojak-layers/manifest.json');
        const manifest: Record<string, string[]> = await response.json();

        const layers: LayerData[] = LAYERS.map(layer => {
          const files = manifest[layer.folder] || [];
          const images: LayerImage[] = files.map(filePath => {
            const filename = filePath.split('/').pop() || filePath;
            return {
              filename,
              displayName: parseDisplayName(filename, layer.prefix, layer.folder),
              path: `/assets/wojak-layers/${layer.folder}/${filePath}`,
            };
          });

          // Sort: custom order for Base, Mouth, and Background, alphabetical for others
          if (layer.name === 'Base') {
            images.sort((a, b) => {
              const indexA = BASE_DISPLAY_ORDER.findIndex(t => a.path.includes(t));
              const indexB = BASE_DISPLAY_ORDER.findIndex(t => b.path.includes(t));
              const orderA = indexA === -1 ? 999 : indexA;
              const orderB = indexB === -1 ? 999 : indexB;
              return orderA - orderB;
            });
          } else if (layer.name === 'Mouth') {
            images.sort((a, b) => {
              const indexA = MOUTH_DISPLAY_ORDER.findIndex(t => a.path.includes(t));
              const indexB = MOUTH_DISPLAY_ORDER.findIndex(t => b.path.includes(t));
              const orderA = indexA === -1 ? 999 : indexA;
              const orderB = indexB === -1 ? 999 : indexB;
              return orderA - orderB;
            });
          } else if (layer.name === 'Background') {
            images.sort((a, b) => {
              const indexA = BACKGROUND_DISPLAY_ORDER.findIndex(t => a.path.includes(t));
              const indexB = BACKGROUND_DISPLAY_ORDER.findIndex(t => b.path.includes(t));
              const orderA = indexA === -1 ? 999 : indexA;
              const orderB = indexB === -1 ? 999 : indexB;
              return orderA - orderB;
            });
          } else {
            images.sort((a, b) => a.displayName.localeCompare(b.displayName));
          }

          return {
            name: layer.name,
            folder: layer.folder,
            images,
          };
        });

        setLayerData(layers);

        // Set specific default selections (numb is default for Mouth)
        const defaultTraits: Record<string, string> = {
          Base: 'Base-Wojak_classic',
          Head: 'Cap_blue',
          Eyes: '',
          Mouth: 'numb',
          Clothes: 'Tee_blue',
          Background: '',
        };

        const defaults: Record<string, string | string[]> = {};
        layers.forEach(layer => {
          const traitName = defaultTraits[layer.name];
          if (traitName) {
            const match = layer.images.find(img => img.path.includes(traitName));
            if (match) {
              // Mouth uses array for multi-selection
              if (layer.name === 'Mouth') {
                defaults[layer.name] = [match.path];
              } else {
                defaults[layer.name] = match.path;
              }
            }
          }
        });

        setSelections(defaults);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load layer manifest:', error);
        setLoading(false);
      }
    };

    loadLayers();
  }, []);

  // Get current layer options
  const currentLayerData = useMemo(() => {
    return layerData.find(l => l.name === activeLayer);
  }, [layerData, activeLayer]);

  // Handle trait selection
  const handleSelect = (layerName: string, path: string) => {
    setSelections(prev => {
      // Block selection if Astronaut is active and this trait is blocked
      if (isAstronautSelected(prev) && isBlockedByAstronaut(layerName, path)) {
        return prev;
      }

      // Trigger animation for this layer
      setAnimatingLayer(layerName);

      // Special handling for Mouth layer (multi-selection)
      if (layerName === 'Mouth') {
        return handleMouthSelect(prev, path);
      }

      const next = { ...prev, [layerName]: path };

      // If selecting Astronaut suit, clear blocked traits
      if (layerName === 'Clothes' && path.includes('Astronaut')) {
        delete next.Head;
        const mouthSelections = next.Mouth;
        if (Array.isArray(mouthSelections)) {
          const filtered = mouthSelections.filter(m => !isBlockedByAstronaut('Mouth', m));
          next.Mouth = filtered.length > 0 ? filtered : [];
        } else if (mouthSelections && isBlockedByAstronaut('Mouth', mouthSelections)) {
          delete next.Mouth;
        }
      }

      return next;
    });
  };

  // Handle mouth multi-selection logic
  const handleMouthSelect = (prev: Record<string, string | string[]>, path: string): Record<string, string | string[]> => {
    const currentMouth = prev.Mouth;
    const currentArray = Array.isArray(currentMouth) ? currentMouth : currentMouth ? [currentMouth] : [];
    const category = getMouthTraitCategory(path);

    // If clicking on already selected trait, deselect it
    if (currentArray.includes(path)) {
      const remaining = currentArray.filter(p => p !== path);

      // Don't allow empty mouth selection - keep at least numb
      if (remaining.length === 0) {
        const mouthLayer = layerData.find(l => l.name === 'Mouth');
        const numbPath = mouthLayer?.images.find(img => img.path.includes('numb'))?.path;
        return { ...prev, Mouth: numbPath ? [numbPath] : [] };
      }

      // If deselecting a base trait but an overlay or underlay requiring base remains, add numb
      const deselectedCategory = getMouthTraitCategory(path);
      if (deselectedCategory === 'base') {
        const remainingOverlay = remaining.find(p => getMouthTraitCategory(p) === 'overlay');
        const remainingUnderlay = remaining.find(p => getMouthTraitCategory(p) === 'underlay');

        const overlayNeedsBase = remainingOverlay && MOUTH_OVERLAYS_REQUIRING_BASE.some(t => remainingOverlay.includes(t));
        const underlayNeedsBase = remainingUnderlay && MOUTH_UNDERLAYS_REQUIRING_BASE.some(t => remainingUnderlay.includes(t));

        if (overlayNeedsBase || underlayNeedsBase) {
          const mouthLayer = layerData.find(l => l.name === 'Mouth');
          const numbPath = mouthLayer?.images.find(img => img.path.includes('numb'))?.path;
          if (numbPath) {
            const newMouth = [numbPath];
            if (remainingUnderlay) newMouth.unshift(remainingUnderlay);
            if (remainingOverlay) newMouth.push(remainingOverlay);
            return { ...prev, Mouth: newMouth };
          }
        }
      }

      return { ...prev, Mouth: remaining };
    }

    // Handle based on category
    switch (category) {
      case 'exclusive':
        // Exclusive traits: clear everything, select only this
        return { ...prev, Mouth: [path] };

      case 'hannibal':
        // Hannibal: forces numb underneath
        const mouthLayer = layerData.find(l => l.name === 'Mouth');
        const numbPath = mouthLayer?.images.find(img => img.path.includes('numb'))?.path;
        return { ...prev, Mouth: numbPath ? [numbPath, path] : [path] };

      case 'base':
        // Base trait: replace any existing base trait, keep underlay and overlay if present
        const existingOverlay = currentArray.find(p => getMouthTraitCategory(p) === 'overlay');
        const existingUnderlayForBase = currentArray.find(p => getMouthTraitCategory(p) === 'underlay');
        // Check if current selection is exclusive or hannibal - if so, replace entirely
        const currentCategory = currentArray.length > 0 ? getMouthTraitCategory(currentArray[0]) : null;
        if (currentCategory === 'exclusive' || currentCategory === 'hannibal') {
          return { ...prev, Mouth: [path] };
        }
        const newMouthForBase = [path];
        if (existingOverlay) newMouthForBase.push(existingOverlay);
        if (existingUnderlayForBase) newMouthForBase.unshift(existingUnderlayForBase);
        return { ...prev, Mouth: newMouthForBase };

      case 'underlay':
        // Underlay trait (facial hair): can combine with base and overlay
        // Replace any existing underlay, keep base and overlay
        const existingBaseForUnderlay = currentArray.find(p => getMouthTraitCategory(p) === 'base');
        const existingOverlayForUnderlay = currentArray.find(p => getMouthTraitCategory(p) === 'overlay');
        const currCatForUnderlay = currentArray.length > 0 ? getMouthTraitCategory(currentArray[0]) : null;

        // Check if this underlay requires a base trait
        const underlayRequiresBase = MOUTH_UNDERLAYS_REQUIRING_BASE.some(t => path.includes(t));

        if (currCatForUnderlay === 'exclusive' || currCatForUnderlay === 'hannibal') {
          // When replacing exclusive/hannibal with underlay, add numb as base if required
          if (underlayRequiresBase) {
            const mLayer = layerData.find(l => l.name === 'Mouth');
            const nPath = mLayer?.images.find(img => img.path.includes('numb'))?.path;
            return { ...prev, Mouth: nPath ? [path, nPath] : [path] };
          }
          return { ...prev, Mouth: [path] };
        }

        const newMouthForUnderlay = [path];

        // If no base exists and this underlay requires one, add numb
        if (!existingBaseForUnderlay && underlayRequiresBase) {
          const mLayer = layerData.find(l => l.name === 'Mouth');
          const nPath = mLayer?.images.find(img => img.path.includes('numb'))?.path;
          if (nPath) newMouthForUnderlay.push(nPath);
        } else if (existingBaseForUnderlay) {
          newMouthForUnderlay.push(existingBaseForUnderlay);
        }

        if (existingOverlayForUnderlay) newMouthForUnderlay.push(existingOverlayForUnderlay);
        return { ...prev, Mouth: newMouthForUnderlay };

      case 'overlay':
        // Overlay trait: replace any existing overlay, keep base and underlay if present
        const existingBase = currentArray.find(p => getMouthTraitCategory(p) === 'base');
        const existingUnderlay = currentArray.find(p => getMouthTraitCategory(p) === 'underlay');
        // Check if current selection is exclusive or hannibal - if so, replace entirely
        const currCategory = currentArray.length > 0 ? getMouthTraitCategory(currentArray[0]) : null;

        // Check if this overlay requires a base trait
        const requiresBase = MOUTH_OVERLAYS_REQUIRING_BASE.some(t => path.includes(t));

        if (currCategory === 'exclusive' || currCategory === 'hannibal') {
          // When replacing exclusive/hannibal with overlay, add numb as base if required
          if (requiresBase) {
            const mLayer = layerData.find(l => l.name === 'Mouth');
            const nPath = mLayer?.images.find(img => img.path.includes('numb'))?.path;
            return { ...prev, Mouth: nPath ? [nPath, path] : [path] };
          }
          return { ...prev, Mouth: [path] };
        }

        // If no base exists and this overlay requires one, add numb
        if (!existingBase && requiresBase) {
          const mLayer = layerData.find(l => l.name === 'Mouth');
          const nPath = mLayer?.images.find(img => img.path.includes('numb'))?.path;
          const newMouth = nPath ? [nPath, path] : [path];
          if (existingUnderlay) newMouth.unshift(existingUnderlay);
          return { ...prev, Mouth: newMouth };
        }

        const newMouthForOverlay = existingBase ? [existingBase, path] : [path];
        if (existingUnderlay) newMouthForOverlay.unshift(existingUnderlay);
        return { ...prev, Mouth: newMouthForOverlay };

      default:
        return { ...prev, Mouth: [path] };
    }
  };

  // Clear a layer
  const handleClear = (layerName: string) => {
    setSelections(prev => {
      const next = { ...prev };
      delete next[layerName];
      return next;
    });
  };

  // Check if a mouth trait is selected
  const isMouthSelected = (path: string): boolean => {
    const mouth = selections.Mouth;
    if (Array.isArray(mouth)) {
      return mouth.includes(path);
    }
    return mouth === path;
  };

  // Randomize all layers
  const handleRandomize = () => {
    const newSelections: Record<string, string | string[]> = {};
    // Background always selected when randomizing, Eyes and Head are optional
    const optionalLayers = ['Eyes', 'Head'];

    layerData.forEach(layer => {
      if (layer.images.length > 0) {
        if (optionalLayers.includes(layer.name) && Math.random() < 0.5) {
          return;
        }

        if (layer.name === 'Mouth') {
          // For mouth, randomly select base + maybe underlay + maybe overlay
          const baseTraits = layer.images.filter(img => getMouthTraitCategory(img.path) === 'base');
          const underlayTraits = layer.images.filter(img => getMouthTraitCategory(img.path) === 'underlay');
          const overlayTraits = layer.images.filter(img => getMouthTraitCategory(img.path) === 'overlay');

          if (baseTraits.length > 0) {
            const randomBase = baseTraits[Math.floor(Math.random() * baseTraits.length)];
            const mouthSelections = [randomBase.path];

            // 20% chance to add an underlay (facial hair)
            if (underlayTraits.length > 0 && Math.random() < 0.2) {
              const randomUnderlay = underlayTraits[Math.floor(Math.random() * underlayTraits.length)];
              mouthSelections.unshift(randomUnderlay.path);
            }

            // 30% chance to add an overlay
            if (overlayTraits.length > 0 && Math.random() < 0.3) {
              const randomOverlay = overlayTraits[Math.floor(Math.random() * overlayTraits.length)];
              mouthSelections.push(randomOverlay.path);
            }

            newSelections.Mouth = mouthSelections;
          }
        } else {
          const randomIndex = Math.floor(Math.random() * layer.images.length);
          newSelections[layer.name] = layer.images[randomIndex].path;
        }
      }
    });

    // If Astronaut is selected, apply restrictions
    if (newSelections.Clothes && (newSelections.Clothes as string).includes('Astronaut')) {
      delete newSelections.Head;
      const mouthSelections = newSelections.Mouth;
      if (Array.isArray(mouthSelections)) {
        const filtered = mouthSelections.filter(m => !isBlockedByAstronaut('Mouth', m));
        newSelections.Mouth = filtered.length > 0 ? filtered : [];
      }
    }

    setSelections(newSelections);
  };

  // Export/download the Wojak as PNG
  const handleExport = useCallback(async () => {
    if (exporting) return;
    setExporting(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setExporting(false);
      return;
    }

    // Use 1024x1024 for high quality export
    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    // Collect all layers to render in order
    const layersToRender: { path: string; zIndex: number }[] = [];

    RENDER_ORDER.forEach(layerName => {
      if (layerName === 'Mouth') {
        const mouth = selections.Mouth;
        if (!mouth) return;
        const mouthPaths = Array.isArray(mouth) ? mouth : [mouth];
        const sorted = [...mouthPaths].sort((a, b) => {
          const catA = getMouthTraitCategory(a);
          const catB = getMouthTraitCategory(b);
          const order: Record<string, number> = { underlay: 0, base: 1, exclusive: 1, hannibal: 2, overlay: 3 };
          return (order[catA || 'base'] || 1) - (order[catB || 'base'] || 1);
        });

        const hasRektBase = (selections.Base as string)?.includes('rekt');

        sorted.forEach((path, index) => {
          const isBubbleGum = path.includes('Bubble-Gum');
          const layerZIndex = isBubbleGum ? RENDER_ORDER.indexOf('Eyes') + 1 : RENDER_ORDER.indexOf('Mouth') + index;
          layersToRender.push({ path, zIndex: layerZIndex });

          // Add Bubble-Gum rekt overlay if needed
          if (isBubbleGum && hasRektBase) {
            layersToRender.push({
              path: '/assets/wojak-layers/MOUTH/MOUTH_Bubble-Gum_rekt.png',
              zIndex: layerZIndex + 1
            });
          }
        });
        return;
      }

      const selection = selections[layerName];
      if (!selection || (Array.isArray(selection) && selection.length === 0)) return;

      let path = Array.isArray(selection) ? selection[0] : selection;
      let zIndex = RENDER_ORDER.indexOf(layerName);

      // Centurion mask variant when Hannibal or Bandana mask is selected
      if (layerName === 'Head' && path.includes('Centurion')) {
        path = getCenturionPath(selections, path);
      }

      if (layerName === 'Clothes' && isAstronautSelected(selections)) {
        zIndex = RENDER_ORDER.length + 10;
      }

      // Laser Eyes render on top of Bubble-Gum
      const mouthSelection = selections.Mouth;
      const hasBubbleGum = Array.isArray(mouthSelection)
        ? mouthSelection.some(m => m.includes('Bubble-Gum'))
        : mouthSelection?.includes('Bubble-Gum');
      const isLaserEyes = layerName === 'Eyes' && path.includes('Laser-Eyes');

      if (isLaserEyes && hasBubbleGum) {
        zIndex = RENDER_ORDER.indexOf('Eyes') + 3;
      }

      layersToRender.push({ path, zIndex });
    });

    // Sort by z-index
    layersToRender.sort((a, b) => a.zIndex - b.zIndex);

    // Load and draw all images
    try {
      for (const layer of layersToRender) {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            resolve();
          };
          img.onerror = reject;
          img.src = layer.path;
        });
      }

      // Save the image
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        // Native app: Save to Photo gallery
        const base64Data = canvas.toDataURL('image/png').split(',')[1];
        const fileName = `wojak-${Date.now()}.png`;

        // First save to cache
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });

        // Then save to Photos
        await Media.savePhoto({
          path: savedFile.uri
        });

        // Clean up cache file
        try {
          await Filesystem.deleteFile({
            path: fileName,
            directory: Directory.Cache
          });
        } catch (e) {
          // Ignore cleanup errors
        }
      } else {
        // Browser: Download as file
        const link = document.createElement('a');
        link.download = `wojak-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }

    setExporting(false);
  }, [selections, exporting]);

  // Share the Wojak image to X.com
  const handleShareToX = useCallback(async () => {
    if (exporting) return;
    setExporting(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setExporting(false);
      return;
    }

    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    // Collect all layers to render in order (same as export)
    const layersToRender: { path: string; zIndex: number }[] = [];

    RENDER_ORDER.forEach(layerName => {
      if (layerName === 'Mouth') {
        const mouth = selections.Mouth;
        if (!mouth) return;
        const mouthPaths = Array.isArray(mouth) ? mouth : [mouth];
        const sorted = [...mouthPaths].sort((a, b) => {
          const catA = getMouthTraitCategory(a);
          const catB = getMouthTraitCategory(b);
          const order: Record<string, number> = { underlay: 0, base: 1, exclusive: 1, hannibal: 2, overlay: 3 };
          return (order[catA || 'base'] || 1) - (order[catB || 'base'] || 1);
        });

        const hasRektBase = (selections.Base as string)?.includes('rekt');

        sorted.forEach((path, index) => {
          const isBubbleGum = path.includes('Bubble-Gum');
          const layerZIndex = isBubbleGum ? RENDER_ORDER.indexOf('Eyes') + 1 : RENDER_ORDER.indexOf('Mouth') + index;
          layersToRender.push({ path, zIndex: layerZIndex });

          if (isBubbleGum && hasRektBase) {
            layersToRender.push({
              path: '/assets/wojak-layers/MOUTH/MOUTH_Bubble-Gum_rekt.png',
              zIndex: layerZIndex + 1
            });
          }
        });
        return;
      }

      const selection = selections[layerName];
      if (!selection || (Array.isArray(selection) && selection.length === 0)) return;

      let path = Array.isArray(selection) ? selection[0] : selection;
      let zIndex = RENDER_ORDER.indexOf(layerName);

      // Centurion mask variant when Hannibal or Bandana mask is selected
      if (layerName === 'Head' && path.includes('Centurion')) {
        path = getCenturionPath(selections, path);
      }

      if (layerName === 'Clothes' && isAstronautSelected(selections)) {
        zIndex = RENDER_ORDER.length + 10;
      }

      const mouthSelection = selections.Mouth;
      const hasBubbleGum = Array.isArray(mouthSelection)
        ? mouthSelection.some(m => m.includes('Bubble-Gum'))
        : mouthSelection?.includes('Bubble-Gum');
      const isLaserEyes = layerName === 'Eyes' && path.includes('Laser-Eyes');

      if (isLaserEyes && hasBubbleGum) {
        zIndex = RENDER_ORDER.indexOf('Eyes') + 3;
      }

      layersToRender.push({ path, zIndex });
    });

    layersToRender.sort((a, b) => a.zIndex - b.zIndex);

    try {
      for (const layer of layersToRender) {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            resolve();
          };
          img.onerror = reject;
          img.src = layer.path;
        });
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });

      if (blob) {
        const shareText = 'Check out my Wojak! Made with wojak.ink 🎨';
        const isNative = Capacitor.isNativePlatform();

        if (isNative) {
          // Native app: Use Capacitor Share with file
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve(base64);
            };
            reader.readAsDataURL(blob);
          });
          const base64Data = await base64Promise;

          const fileName = `wojak-${Date.now()}.png`;
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache
          });

          await Share.share({
            title: 'My Wojak',
            text: shareText,
            files: [savedFile.uri],
            dialogTitle: 'Share your Wojak'
          });

          // Clean up
          try {
            await Filesystem.deleteFile({
              path: fileName,
              directory: Directory.Cache
            });
          } catch (e) {
            // Ignore cleanup errors
          }
        } else {
          // Browser: Download image and open X.com
          const link = document.createElement('a');
          link.download = 'wojak.png';
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);

          // Open X.com compose
          const tweetText = encodeURIComponent(shareText);
          window.open(`https://x.com/intent/tweet?text=${tweetText}`, '_blank');
        }
      }
    } catch (error) {
      console.error('Share to X failed:', error);
    }

    setExporting(false);
  }, [selections, exporting]);

  // Save current selections as a favorite
  const handleSaveFavorite = useCallback(() => {
    const name = `Wojak ${favorites.length + 1}`;
    const newFavorites = [...favorites, { name, selections: { ...selections } }];
    setFavorites(newFavorites);
    localStorage.setItem('wojakFavorites', JSON.stringify(newFavorites));

    // Send anonymous analytics (fire and forget)
    fetch('https://wojak-mobile-trade-fetcher.abitsolvesthis.workers.dev/api/favorite-stats/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attributes: selections }),
    }).catch(() => {}); // Silently ignore errors
  }, [favorites, selections]);

  // Load a favorite
  const handleLoadFavorite = useCallback((index: number) => {
    const favorite = favorites[index];
    if (favorite) {
      setSelections(favorite.selections);
      setShowFavorites(false);
    }
  }, [favorites]);

  // Delete a favorite
  const handleDeleteFavorite = useCallback((index: number) => {
    const newFavorites = favorites.filter((_, i) => i !== index);
    setFavorites(newFavorites);
    localStorage.setItem('wojakFavorites', JSON.stringify(newFavorites));
  }, [favorites]);

  // Start editing a favorite name
  const handleStartRename = useCallback((index: number) => {
    setEditingFavoriteIndex(index);
    setEditingFavoriteName(favorites[index].name);
  }, [favorites]);

  // Save the renamed favorite
  const handleSaveRename = useCallback(() => {
    if (editingFavoriteIndex === null) return;
    const newFavorites = [...favorites];
    newFavorites[editingFavoriteIndex] = {
      ...newFavorites[editingFavoriteIndex],
      name: editingFavoriteName.trim() || `Wojak ${editingFavoriteIndex + 1}`
    };
    setFavorites(newFavorites);
    localStorage.setItem('wojakFavorites', JSON.stringify(newFavorites));
    setEditingFavoriteIndex(null);
    setEditingFavoriteName('');
  }, [editingFavoriteIndex, editingFavoriteName, favorites]);

  // Check if current selections match a favorite
  const isCurrentFavorite = useMemo(() => {
    return favorites.some(fav =>
      JSON.stringify(fav.selections) === JSON.stringify(selections)
    );
  }, [favorites, selections]);

  // Open image in new window for easy saving
  const handleOpenImage = useCallback(() => {
    if (!previewDataUrl) return;

    fetch(previewDataUrl)
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Save Your Wojak</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                * { box-sizing: border-box; }
                body {
                  margin: 0;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: flex-start;
                  min-height: 100vh;
                  background: #111;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  padding: 20px;
                  padding-top: 40px;
                }
                .instructions {
                  color: #fff;
                  font-size: 16px;
                  text-align: center;
                  margin-bottom: 20px;
                  opacity: 0.9;
                }
                .image-container {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                img {
                  max-width: 100%;
                  max-height: calc(100vh - 100px);
                  border-radius: 12px;
                }
              </style>
            </head>
            <body>
              <p class="instructions">Press and hold the image to save to Photos</p>
              <div class="image-container">
                <img src="${blobUrl}" alt="Wojak" />
              </div>
            </body>
            </html>
          `);
          newWindow.document.close();
        }
      });
  }, [previewDataUrl]);

  // Render mouth layers (handles array)
  const renderMouthLayers = (baseZIndex: number, mini = false) => {
    const mouth = selections.Mouth;
    if (!mouth) return null;

    const mouthPaths = Array.isArray(mouth) ? mouth : [mouth];
    if (mouthPaths.length === 0) return null;

    // Sort: underlay first, then base, then hannibal, then overlays
    const sorted = [...mouthPaths].sort((a, b) => {
      const catA = getMouthTraitCategory(a);
      const catB = getMouthTraitCategory(b);
      const order: Record<string, number> = { underlay: 0, base: 1, exclusive: 1, hannibal: 2, overlay: 3 };
      return (order[catA || 'base'] || 1) - (order[catB || 'base'] || 1);
    });

    // Check for Bubble-Gum rekt overlay
    const hasBubbleGum = sorted.some(p => p.includes('Bubble-Gum'));
    const hasRektBase = (selections.Base as string)?.includes('rekt');
    const isMouthAnimating = animatingLayer === 'Mouth';

    const hasCenturion = isCenturionSelected(selections);

    return (
      <>
        {sorted.map((path, index) => {
          // Bubble-Gum renders above Eyes (z-index 4), so use higher z-index
          const isBubbleGum = path.includes('Bubble-Gum');
          let layerZIndex = isBubbleGum ? RENDER_ORDER.indexOf('Eyes') + 1 : baseZIndex + index;

          // If Centurion is selected, certain mouth traits render on top of Head
          if (hasCenturion && isMouthOverCenturion(path)) {
            layerZIndex = RENDER_ORDER.indexOf('Head') + 1;
          }

          const layerClass = mini ? 'mini-layer' : 'layer-image';
          const animClass = isMouthAnimating ? 'layer-pop' : '';

          return (
            <React.Fragment key={path}>
              <img
                src={path}
                alt={`Mouth layer ${index}`}
                className={`${layerClass} ${animClass}`}
                style={{ zIndex: layerZIndex }}
              />
              {/* Bubble-Gum rekt overlay - renders on top when Base is rekt */}
              {isBubbleGum && hasRektBase && (
                <img
                  src="/assets/wojak-layers/MOUTH/MOUTH_Bubble-Gum_rekt.png"
                  alt="Bubble Gum rekt overlay"
                  className={`${layerClass} ${animClass}`}
                  style={{ zIndex: layerZIndex + 1 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };

  return (
    <IonPage>
      <IonContent fullscreen className="generator-content" ref={contentRef}>
        {/* Action bar moved from header */}
        <div className="generator-action-bar">
          <IonButton fill="clear" onClick={handleSaveFavorite} disabled={isCurrentFavorite}>
            <IonIcon icon={isCurrentFavorite ? heart : heartOutline} />
          </IonButton>
          <IonButton fill="clear" onClick={() => setShowFavorites(true)} disabled={favorites.length === 0}>
            <span className="favorites-badge">{favorites.length > 0 && favorites.length}</span>
          </IonButton>
          <IonButton fill="clear" onClick={handleOpenImage} disabled={!previewDataUrl}>
            <IonIcon icon={openOutline} />
          </IonButton>
          <IonButton fill="clear" onClick={handleRandomize}>
            <IonIcon icon={shuffle} />
          </IonButton>
        </div>
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading layers...</p>
          </div>
        ) : (
          <div className="generator-container">
            {/* Preview */}
            <div className="preview-section" ref={previewRef}>
              <div className="wojak-preview">
                {RENDER_ORDER.map(layerName => {
                  // Skip Mouth here - we handle it separately
                  if (layerName === 'Mouth') {
                    const baseZIndex = RENDER_ORDER.indexOf('Mouth');
                    return <React.Fragment key="Mouth">{renderMouthLayers(baseZIndex)}</React.Fragment>;
                  }

                  const selection = selections[layerName];
                  if (!selection || (Array.isArray(selection) && selection.length === 0)) return null;

                  let path = Array.isArray(selection) ? selection[0] : selection;
                  let zIndex = RENDER_ORDER.indexOf(layerName);

                  // Centurion mask variant when Hannibal or Bandana mask is selected
                  if (layerName === 'Head' && path.includes('Centurion')) {
                    path = getCenturionPath(selections, path);
                  }

                  if (layerName === 'Clothes' && isAstronautSelected(selections)) {
                    zIndex = RENDER_ORDER.length + 10;
                  }

                  // Laser Eyes render on top of Bubble-Gum
                  const mouthSelection = selections.Mouth;
                  const hasBubbleGum = Array.isArray(mouthSelection)
                    ? mouthSelection.some(m => m.includes('Bubble-Gum'))
                    : mouthSelection?.includes('Bubble-Gum');
                  const isLaserEyes = layerName === 'Eyes' && path.includes('Laser-Eyes');

                  if (isLaserEyes && hasBubbleGum) {
                    zIndex = RENDER_ORDER.indexOf('Eyes') + 3; // Above Bubble-Gum (5) and Bubble-Gum rekt (6)
                  }

                  const isAnimating = animatingLayer === layerName;

                  return (
                    <img
                      key={layerName}
                      src={path}
                      alt={layerName}
                      className={`layer-image ${isAnimating ? 'layer-pop' : ''}`}
                      style={{ zIndex }}
                    />
                  );
                })}
                {Object.keys(selections).length === 0 && (
                  <div className="empty-preview">
                    <IonIcon icon={sparkles} />
                    <p>Select layers below</p>
                  </div>
                )}
                {/* Combined image overlay for long-press saving */}
                {previewDataUrl && (
                  <img
                    src={previewDataUrl}
                    alt="Wojak Preview"
                    className="preview-overlay"
                  />
                )}
              </div>
            </div>

            {/* Layer Tabs */}
            <div className="layer-tabs-container">
              <div className="layer-tabs">
                {LAYERS.map(layer => (
                  <button
                    key={layer.name}
                    className={`layer-tab ${activeLayer === layer.name ? 'active' : ''}`}
                    onClick={() => setActiveLayer(layer.name)}
                  >
                    {layer.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Trait Selector */}
            <div className="trait-selector">
              {/* Hints shown inline when needed */}
              {(activeLayer === 'Mouth' || (isAstronautSelected(selections) && ASTRONAUT_BLOCKED_LAYERS.includes(activeLayer))) && (
                <div className="trait-hints">
                  {activeLayer === 'Mouth' && (
                    <span className="multi-select-hint"><span className="hint-plus">+</span> Secondary attribute</span>
                  )}
                  {isAstronautSelected(selections) && ASTRONAUT_BLOCKED_LAYERS.includes(activeLayer) && (
                    <span className="blocked-notice">Blocked by Astronaut</span>
                  )}
                </div>
              )}
              <div className={`trait-grid layer-${activeLayer.toLowerCase()}`}>
                {/* "None" option for optional layers: Background, Eyes, Head */}
                {['Background', 'Eyes', 'Head'].includes(activeLayer) && (
                  <div
                    className={`trait-option none-option ${!selections[activeLayer] ? 'selected' : ''}`}
                    onClick={() => handleClear(activeLayer)}
                  >
                    <div className="none-icon">
                      <IonIcon icon={banOutline} style={{ color: 'inherit' }} />
                    </div>
                    <span className="trait-name">None</span>
                  </div>
                )}
                {currentLayerData?.images.map(image => {
                  const isBlocked = isAstronautSelected(selections) && isBlockedByAstronaut(activeLayer, image.path);
                  const isSelected = activeLayer === 'Mouth'
                    ? isMouthSelected(image.path)
                    : selections[activeLayer] === image.path;
                  const showNumbOverlay = activeLayer === 'Base' && baseNeedsNumbOverlay(image.path);
                  const isSecondary = activeLayer === 'Mouth' && isSecondaryMouthTrait(image.path);

                  return (
                    <div
                      key={image.filename}
                      className={`trait-option ${isSelected ? 'selected' : ''} ${isBlocked ? 'blocked' : ''}`}
                      onClick={() => handleSelect(activeLayer, image.path)}
                    >
                      <div className="trait-image-container">
                        <img src={image.path} alt={image.displayName} loading="lazy" className="trait-base-image" />
                        {showNumbOverlay && (
                          <img
                            src={NUMB_MOUTH_PATH}
                            alt=""
                            className="trait-overlay-mouth"
                            loading="lazy"
                          />
                        )}
                        {isSecondary && (
                          <span className="secondary-badge">+</span>
                        )}
                      </div>
                      <span className="trait-name">{image.displayName}</span>
                    </div>
                  );
                })}
                {currentLayerData?.images.length === 0 && (
                  <p className="no-traits">No traits available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mini Preview - shows when main preview scrolls out of view */}
        <div
          className={`mini-preview ${showMiniPreview ? 'visible' : ''}`}
          onClick={() => contentRef.current?.scrollToTop(300)}
        >
          <div className="mini-preview-inner">
            {RENDER_ORDER.map(layerName => {
              if (layerName === 'Mouth') {
                return <React.Fragment key="Mouth">{renderMouthLayers(3, true)}</React.Fragment>;
              }

              const selection = selections[layerName];
              if (!selection || (Array.isArray(selection) && selection.length === 0)) return null;

              let path = Array.isArray(selection) ? selection[0] : selection;
              let zIndex = RENDER_ORDER.indexOf(layerName);

              // Centurion mask variant when Hannibal or Bandana mask is selected
              if (layerName === 'Head' && path.includes('Centurion')) {
                path = getCenturionPath(selections, path);
              }

              if (layerName === 'Clothes' && isAstronautSelected(selections)) {
                zIndex = 16;
              }

              const mouthSelection = selections.Mouth;
              const hasBubbleGum = Array.isArray(mouthSelection)
                ? mouthSelection.some(m => m.includes('Bubble-Gum'))
                : mouthSelection?.includes('Bubble-Gum');
              const isLaserEyes = layerName === 'Eyes' && path.includes('Laser-Eyes');

              if (isLaserEyes && hasBubbleGum) {
                zIndex = 7;
              }

              const isAnimating = animatingLayer === layerName;

              return (
                <img
                  key={layerName}
                  src={path}
                  alt={layerName}
                  className={`mini-layer ${isAnimating ? 'layer-pop' : ''}`}
                  style={{ zIndex }}
                />
              );
            })}
          </div>
        </div>
      </IonContent>

      {/* Favorites Modal */}
      <IonModal isOpen={showFavorites} onDidDismiss={() => setShowFavorites(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Saved Wojaks</IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setShowFavorites(false)}>
              <IonIcon icon={close} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="favorites-modal-content">
          <div className="favorites-grid">
            {favorites.map((favorite, index) => (
              <div key={index} className="favorite-card">
                <div className="favorite-preview" onClick={() => handleLoadFavorite(index)}>
                  {RENDER_ORDER.map(layerName => {
                    if (layerName === 'Mouth') {
                      const mouth = favorite.selections.Mouth;
                      if (!mouth) return null;
                      const mouthPaths = Array.isArray(mouth) ? mouth : [mouth];
                      return mouthPaths.map((path, idx) => (
                        <img key={path} src={path} alt="Mouth" className="favorite-layer" style={{ zIndex: 3 + idx }} />
                      ));
                    }
                    const selection = favorite.selections[layerName];
                    if (!selection || (Array.isArray(selection) && selection.length === 0)) return null;
                    const path = Array.isArray(selection) ? selection[0] : selection;
                    let zIndex = RENDER_ORDER.indexOf(layerName);
                    if (layerName === 'Clothes' && (selection as string)?.includes('Astronaut')) {
                      zIndex = 16;
                    }
                    return (
                      <img key={layerName} src={path} alt={layerName} className="favorite-layer" style={{ zIndex }} />
                    );
                  })}
                </div>
                <div className="favorite-actions">
                  {editingFavoriteIndex === index ? (
                    <>
                      <input
                        type="text"
                        className="favorite-name-input"
                        value={editingFavoriteName}
                        onChange={(e) => setEditingFavoriteName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                        autoFocus
                      />
                      <button className="favorite-save" onClick={handleSaveRename}>
                        <IonIcon icon={checkmarkOutline} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="favorite-name">{favorite.name}</span>
                      <button className="favorite-rename" onClick={() => handleStartRename(index)}>
                        <IonIcon icon={pencilOutline} />
                      </button>
                      <button className="favorite-delete" onClick={() => handleDeleteFavorite(index)}>
                        <IonIcon icon={trashOutline} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {favorites.length === 0 && (
            <div className="no-favorites">
              <IonIcon icon={heartOutline} />
              <p>No saved Wojaks yet</p>
              <p>Tap the heart icon to save your creation</p>
            </div>
          )}
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Generator;
