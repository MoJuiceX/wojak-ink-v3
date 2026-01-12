/**
 * Canvas Renderer Service
 *
 * Handles compositing layers onto an HTML5 Canvas with caching.
 * Implements all special rendering logic from wojak-ink-mobile.
 */

import type { ExportOptions } from '@/types/generator';
import type { SelectedLayers, UILayerName } from '@/lib/wojakRules';
import { CANVAS_CONFIG } from '@/config/layers';

// ============ Types ============

interface RenderResult {
  dataUrl: string;
  width: number;
  height: number;
}

interface RenderLayer {
  path: string;
  zIndex: number;
  layerName: string;
  clipRightHalf?: boolean; // For BandanaMaskOverRonin and EyesOverHead
  clipLeftPercent?: number; // Clip left portion (e.g., 0.1 = 10% from left)
}

// ============ Constants ============

/**
 * Mouth traits that render ON TOP of Centurion head
 */
const MOUTH_OVER_CENTURION = ['stach', 'Pizza', 'Bubble-Gum', 'Pipe', 'Joint', 'Cohiba', 'Cig', 'Sick'];

/**
 * Any mask triggers Centurion mask variant
 * (Bandana, Hannibal, Copium - all masks in the system)
 */

/**
 * Masks that cover Ninja Turtle (require NinjaTurtleUnderMask virtual layer)
 */
const NINJA_COVERING_MASKS = ['copium', 'hannibal', 'bandana'];

/**
 * Full-face masks that render on top of everything (skull masks, fake it mask)
 */
const FULL_FACE_MASKS = ['skull_mask', 'skull-mask', 'fake_it', 'fake-it'];

/**
 * Heads that need EyesOverHead virtual layer (right half of eyes rendered above head)
 */
const HEADS_NEEDING_EYES_OVERLAY = ['clown', 'pirate', 'ronin', 'supa', 'saiyan'];

/**
 * Base z-index values for each layer (extended for virtual layers)
 */
const LAYER_Z_INDEX: Record<string, number> = {
  Background: 0,
  Base: 1,
  Clothes: 2,
  ClothesAddon: 3,
  FacialHair: 4,
  MouthBase: 5,
  BubbleGumRekt: 5.1,
  MouthItem: 6,
  TysonTattoo: 6.5,
  NinjaTurtleUnderMask: 6.6,
  Mask: 7,
  EyePatchUnderHannibal: 8,
  HannibalMask: 9,
  Eyes: 10,
  EyesOverHannibal: 10.5,
  MaskUnderAstronaut: 10.8, // Bandana and Hannibal masks render under Astronaut helmet
  Astronaut: 11,
  MaskOverAstronaut: 11.3, // Regular masks render over Astronaut helmet
  LaserEyesOverAstronaut: 11.5,
  Head: 12,
  BandanaMaskOverRonin: 13,
  EyesOverHead: 14,
  EyesOverStandardCut: 15,
  MaskOverStandardCut: 16,
  BubbleGumOverEyes: 60,
  FullFaceMask: 100, // Skull masks, Fake It mask - render on top of everything
};

// ============ Image Cache ============

const imageCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();

async function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const loading = loadingPromises.get(src);
  if (loading) return loading;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      imageCache.set(src, img);
      loadingPromises.delete(src);
      resolve(img);
    };

    img.onerror = () => {
      loadingPromises.delete(src);
      reject(new Error(`Failed to load image: ${src}`));
    };

    img.src = src;
  });

  loadingPromises.set(src, promise);
  return promise;
}

export function clearImageCache(): void {
  imageCache.clear();
}

export async function preloadImages(sources: string[]): Promise<void> {
  await Promise.allSettled(sources.map(loadImage));
}

// ============ Helper Functions ============

function pathContains(path: string | undefined, identifier: string): boolean {
  if (!path) return false;
  return path.toLowerCase().includes(identifier.toLowerCase());
}

// Centurion detection
function isCenturionSelected(selectedLayers: SelectedLayers): boolean {
  return pathContains(selectedLayers.Head, 'centurion');
}

function isMouthOverCenturion(path: string): boolean {
  return MOUTH_OVER_CENTURION.some((trait) => pathContains(path, trait));
}

function needsCenturionMaskVariant(selectedLayers: SelectedLayers): boolean {
  // Any mask triggers the Centurion mask variant
  return hasMask(selectedLayers);
}

function getCenturionPath(originalPath: string, needsMaskVariant: boolean): string {
  if (needsMaskVariant) {
    return originalPath.replace('HEAD_Centurion_.png', 'HEAD_Centurion_mask.png');
  }
  return originalPath;
}

// Base detection - check if base is specifically "rekt" (not classic, rugged, etc.)
function isRektBase(selectedLayers: SelectedLayers): boolean {
  const basePath = selectedLayers.Base;
  if (!basePath) return false;
  // Only match specifically "rekt" base, not other bases
  return pathContains(basePath, 'rekt') && !pathContains(basePath, 'rugged');
}

// Bubble Gum detection
function hasBubbleGum(selectedLayers: SelectedLayers): boolean {
  return pathContains(selectedLayers.MouthBase, 'Bubble-Gum');
}

// Ronin detection
function hasRoninHelmet(selectedLayers: SelectedLayers): boolean {
  return pathContains(selectedLayers.Head, 'ronin');
}

// Bandana detection
function hasBandanaMask(selectedLayers: SelectedLayers): boolean {
  return pathContains(selectedLayers.Mask, 'bandana');
}

// EyesOverHead detection - checks if head needs eyes overlay
function needsEyesOverHead(selectedLayers: SelectedLayers): boolean {
  const headPath = selectedLayers.Head;
  if (!headPath) return false;
  return HEADS_NEEDING_EYES_OVERLAY.some((head) => pathContains(headPath, head));
}

// Tyson Tattoo detection
function isTysonTattoo(path: string | undefined): boolean {
  if (!path) return false;
  return pathContains(path, 'tyson') || pathContains(path, 'tattoo');
}

// Ninja Turtle detection
function isNinjaTurtle(path: string | undefined): boolean {
  if (!path) return false;
  return pathContains(path, 'ninja') || pathContains(path, 'turtle');
}

// Check if mask covers Ninja Turtle
function isMaskThatCoversNinja(selectedLayers: SelectedLayers): boolean {
  const maskPath = selectedLayers.Mask;
  if (!maskPath) return false;
  return NINJA_COVERING_MASKS.some((mask) => pathContains(maskPath, mask));
}

// Astronaut detection
function isAstronautSelected(selectedLayers: SelectedLayers): boolean {
  return pathContains(selectedLayers.Clothes, 'astronaut');
}

// Chia Farmer detection
function isChiaFarmer(path: string | undefined): boolean {
  if (!path) return false;
  return pathContains(path, 'chia') && pathContains(path, 'farmer');
}

/**
 * Get the addon path for Chia Farmer clothes
 * Transforms CLOTHES_ChiaFarmer_.png to CLOTHES_ChiaFarmer_add.png
 */
function getChiaFarmerAddonPath(clothesPath: string): string {
  // Replace _.png with _add.png
  return clothesPath.replace(/(_?)\.png$/, '_add.png');
}

// Has any mask selected
function hasMask(selectedLayers: SelectedLayers): boolean {
  const maskPath = selectedLayers.Mask;
  return !!maskPath && maskPath !== '' && maskPath !== 'None';
}

// Hannibal Mask detection
function isHannibalMask(selectedLayers: SelectedLayers): boolean {
  return pathContains(selectedLayers.Mask, 'hannibal');
}

// Copium Mask detection
function isCopiumMask(selectedLayers: SelectedLayers): boolean {
  return pathContains(selectedLayers.Mask, 'copium');
}

// Standard Cut (Blonde or Brown) and Trump Wave detection - eyes and certain masks render on top
function needsLayersAboveHead(selectedLayers: SelectedLayers): boolean {
  const headPath = selectedLayers.Head;
  if (!headPath) return false;
  // Standard Cut Blonde, Standard Cut Brown, Trump Wave
  const isStandardCut = pathContains(headPath, 'standard') && pathContains(headPath, 'cut');
  const isTrumpWave = pathContains(headPath, 'trump') && pathContains(headPath, 'wave');
  return isStandardCut || isTrumpWave;
}

// Eye Patch detection - renders under Hannibal mask, Standard Cut, and Trump Wave
function isEyePatch(path: string | undefined): boolean {
  if (!path) return false;
  return pathContains(path, 'eye') && pathContains(path, 'patch');
}

// Laser Eyes detection - renders on top of Astronaut
function isLaserEyes(path: string | undefined): boolean {
  if (!path) return false;
  return pathContains(path, 'laser');
}

// Full-face mask detection (skull masks, fake it mask) - render on top of everything
function isFullFaceMask(path: string | undefined): boolean {
  if (!path) return false;
  return FULL_FACE_MASKS.some((mask) => pathContains(path, mask));
}

// ============ Layer Building ============

/**
 * Build render layers from selections with all special handling
 */
function buildRenderLayers(selectedLayers: SelectedLayers): RenderLayer[] {
  const layers: RenderLayer[] = [];

  // Pre-calculate conditions
  const hasCenturion = isCenturionSelected(selectedLayers);
  const centurionMaskVariant = needsCenturionMaskVariant(selectedLayers);
  const hasRekt = isRektBase(selectedLayers);
  const hasBubble = hasBubbleGum(selectedLayers);
  const hasRonin = hasRoninHelmet(selectedLayers);
  const hasBandana = hasBandanaMask(selectedLayers);
  const hasAstronaut = isAstronautSelected(selectedLayers);
  const eyesPath = selectedLayers.Eyes;
  const hasTyson = isTysonTattoo(eyesPath);
  const hasNinja = isNinjaTurtle(eyesPath);
  const hasEyePatchSelected = isEyePatch(eyesPath);
  const hasLaserEyesSelected = isLaserEyes(eyesPath);
  const maskCoversNinja = isMaskThatCoversNinja(selectedLayers);
  const hasMaskSelected = hasMask(selectedLayers);
  const needsEyesOverlay = needsEyesOverHead(selectedLayers);
  const hasHannibal = isHannibalMask(selectedLayers);
  const hasCopium = isCopiumMask(selectedLayers);
  const hasLayersAboveHead = needsLayersAboveHead(selectedLayers);
  const hasFullFaceMask = isFullFaceMask(selectedLayers.Mask);

  // Process each UI layer
  const layerOrder: UILayerName[] = [
    'Background',
    'Base',
    'Clothes',
    'FacialHair',
    'MouthBase',
    'MouthItem',
    'Mask',
    'Eyes',
    'Head',
  ];

  for (const layerName of layerOrder) {
    let path = selectedLayers[layerName];
    if (!path || path === '' || path === 'None') continue;

    let zIndex = LAYER_Z_INDEX[layerName];
    let skipLayer = false;

    switch (layerName) {
      case 'Clothes':
        // Skip Astronaut in regular Clothes layer - renders in virtual Astronaut layer
        if (hasAstronaut) {
          skipLayer = true;
        }
        // Chia Farmer renders normally in Clothes, plus has ClothesAddon overlay
        // (handled in virtual layers section)
        break;

      case 'Head':
        // Astronaut blocks Head (helmet replaces head)
        if (hasAstronaut) {
          skipLayer = true;
        }
        // Centurion mask variant
        if (hasCenturion && centurionMaskVariant) {
          path = getCenturionPath(path, true);
        }
        break;

      case 'Mask':
        // Skip full-face masks (skull masks, fake it) - render in FullFaceMask virtual layer on top of everything
        if (hasFullFaceMask) {
          skipLayer = true;
        }
        // Skip masks when Astronaut is selected - handle in virtual layers (under or over Astronaut)
        else if (hasAstronaut) {
          skipLayer = true;
        }
        // Skip Hannibal Mask in regular Mask layer - renders in HannibalMask or MaskOverStandardCut virtual layer
        else if (hasHannibal) {
          skipLayer = true;
        }
        // Skip Copium Mask when Standard Cut / Trump Wave - renders in MaskOverStandardCut virtual layer
        else if (hasCopium && hasLayersAboveHead) {
          skipLayer = true;
        }
        break;

      case 'Eyes':
        // Laser Eyes + Astronaut: render on top of Astronaut helmet
        if (hasLaserEyesSelected && hasAstronaut) {
          layers.push({ path, zIndex: LAYER_Z_INDEX.LaserEyesOverAstronaut, layerName: 'LaserEyesOverAstronaut' });
          skipLayer = true;
          break; // Exit early - no other processing needed
        }
        // Ninja Turtle + Astronaut: clip left 25% to hide bandana outside helmet
        if (hasNinja && hasAstronaut) {
          layers.push({ path, zIndex, layerName, clipLeftPercent: 0.25 });
          skipLayer = true;
          break; // Exit early - no other processing needed
        }
        // Ninja Turtle + Ronin Helmet: clip left 25% to hide bandana outside helmet
        if (hasNinja && hasRonin) {
          layers.push({ path, zIndex, layerName, clipLeftPercent: 0.25 });
          skipLayer = true;
          break; // Exit early - no other processing needed
        }
        // Tyson Tattoo + any mask: skip Eyes layer, render in TysonTattoo virtual layer
        if (hasTyson && hasMaskSelected) {
          skipLayer = true;
        }
        // Ninja Turtle + covering mask: skip Eyes layer, render in NinjaTurtleUnderMask virtual layer
        if (hasNinja && maskCoversNinja) {
          skipLayer = true;
        }
        // Eye patch with Hannibal mask: skip Eyes layer, render in EyePatchUnderHannibal virtual layer
        if (hasEyePatchSelected && hasHannibal) {
          skipLayer = true;
        }
        // Standard Cut / Trump Wave:
        // - Eye patch stays at normal z-index (below head) - don't skip
        // - Other eyes: skip and render in EyesOverStandardCut virtual layer
        if (hasLayersAboveHead && !hasEyePatchSelected) {
          skipLayer = true;
        }
        break;

      case 'FacialHair':
        // FacialHair (neckbeard, stache) renders with Astronaut
        // Stach over Centurion
        if (hasCenturion && pathContains(path, 'stach')) {
          zIndex = LAYER_Z_INDEX.Head + 1;
        }
        break;

      case 'MouthBase':
        // Astronaut allows: Gold teeth, teeth, Numb, screaming, smiling
        // Astronaut blocks: Pipe, Pizza, Bubble-Gum
        if (hasAstronaut) {
          const blockedMouthOptions = ['pipe', 'pizza', 'bubble-gum'];
          const isBlocked = blockedMouthOptions.some(opt => pathContains(path, opt));
          if (isBlocked) {
            skipLayer = true;
          }
        }
        // Mouth over Centurion
        if (hasCenturion && isMouthOverCenturion(path)) {
          zIndex = LAYER_Z_INDEX.Head + 1;
        }
        break;

      case 'MouthItem':
        // Astronaut blocks mouth items (Cig, Joint, Cohiba)
        if (hasAstronaut) {
          skipLayer = true;
        }
        // Mouth items over Centurion
        if (hasCenturion && isMouthOverCenturion(path)) {
          zIndex = LAYER_Z_INDEX.Head + 1;
        }
        break;
    }

    if (!skipLayer) {
      layers.push({ path, zIndex, layerName });
    }
  }

  // ============ Virtual Layers ============

  // Astronaut: renders above Eyes, FacialHair, and Mouth
  if (hasAstronaut) {
    const clothesPath = selectedLayers.Clothes;
    if (clothesPath) {
      layers.push({
        path: clothesPath,
        zIndex: LAYER_Z_INDEX.Astronaut,
        layerName: 'Astronaut',
      });
    }

    // Masks with Astronaut (except Copium which is blocked by rules)
    const maskPath = selectedLayers.Mask;
    if (maskPath && maskPath !== '' && maskPath !== 'None' && !hasFullFaceMask) {
      // Bandana mask renders UNDER Astronaut helmet, clipped 15% on left
      if (pathContains(maskPath, 'bandana')) {
        layers.push({
          path: maskPath,
          zIndex: LAYER_Z_INDEX.MaskUnderAstronaut,
          layerName: 'MaskUnderAstronaut',
          clipLeftPercent: 0.30, // Clip left 30% so it doesn't poke out of helmet
        });
      }
      // Hannibal mask renders UNDER Astronaut helmet (no clipping needed)
      else if (pathContains(maskPath, 'hannibal')) {
        layers.push({
          path: maskPath,
          zIndex: LAYER_Z_INDEX.MaskUnderAstronaut,
          layerName: 'MaskUnderAstronaut',
        });
      }
      // Other masks render OVER Astronaut helmet
      else {
        layers.push({
          path: maskPath,
          zIndex: LAYER_Z_INDEX.MaskOverAstronaut,
          layerName: 'MaskOverAstronaut',
        });
      }
    }
  }

  // ClothesAddon (Chia Farmer): separate addon image renders on top of main Clothes
  const clothesPath = selectedLayers.Clothes;
  if (clothesPath && isChiaFarmer(clothesPath)) {
    // Chia Farmer uses a separate _add.png file for the overlay
    layers.push({
      path: getChiaFarmerAddonPath(clothesPath),
      zIndex: LAYER_Z_INDEX.ClothesAddon,
      layerName: 'ClothesAddon',
    });
  }

  // TysonTattoo: when Tyson Tattoo is selected AND any mask exists
  if (hasTyson && hasMaskSelected && eyesPath) {
    layers.push({
      path: eyesPath,
      zIndex: LAYER_Z_INDEX.TysonTattoo,
      layerName: 'TysonTattoo',
    });
  }

  // NinjaTurtleUnderMask: when Ninja Turtle is selected AND covering mask exists
  if (hasNinja && maskCoversNinja && eyesPath) {
    layers.push({
      path: eyesPath,
      zIndex: LAYER_Z_INDEX.NinjaTurtleUnderMask,
      layerName: 'NinjaTurtleUnderMask',
    });
  }

  // EyePatchUnderHannibal: eye patch renders below Hannibal mask
  if (hasEyePatchSelected && hasHannibal && eyesPath) {
    layers.push({
      path: eyesPath,
      zIndex: LAYER_Z_INDEX.EyePatchUnderHannibal,
      layerName: 'EyePatchUnderHannibal',
    });
  }

  // HannibalMask: renders at higher z-index than regular masks (above MouthBase/MouthItem, below Eyes)
  // But if Standard Cut / Trump Wave, use MaskOverStandardCut instead (renders above Head)
  if (hasHannibal && !hasLayersAboveHead) {
    const maskPath = selectedLayers.Mask;
    if (maskPath) {
      layers.push({
        path: maskPath,
        zIndex: LAYER_Z_INDEX.HannibalMask,
        layerName: 'HannibalMask',
      });
    }
  }

  // BubbleGumRekt: when Bubble Gum + Rekt base
  if (hasBubble && hasRekt) {
    layers.push({
      path: '/assets/wojak-layers/MOUTH/MOUTH_Bubble-Gum_rekt.png',
      zIndex: LAYER_Z_INDEX.BubbleGumRekt,
      layerName: 'BubbleGumRekt',
    });
  }

  // BubbleGumOverEyes: Bubble Gum renders above everything ONLY when Eyes are selected
  if (hasBubble && eyesPath) {
    const mouthBasePath = selectedLayers.MouthBase;
    if (mouthBasePath) {
      layers.push({
        path: mouthBasePath,
        zIndex: LAYER_Z_INDEX.BubbleGumOverEyes,
        layerName: 'BubbleGumOverEyes',
      });
    }
  }

  // BandanaMaskOverRonin: right half of Bandana over Ronin helmet
  if (hasBandana && hasRonin) {
    const maskPath = selectedLayers.Mask;
    if (maskPath) {
      layers.push({
        path: maskPath,
        zIndex: LAYER_Z_INDEX.BandanaMaskOverRonin,
        layerName: 'BandanaMaskOverRonin',
        clipRightHalf: true,
      });
    }
  }

  // EyesOverHead: right half of eyes over specific heads (Clown, Pirate, Ronin, Super Saiyan)
  if (needsEyesOverlay && eyesPath && !hasTyson && !hasNinja) {
    layers.push({
      path: eyesPath,
      zIndex: LAYER_Z_INDEX.EyesOverHead,
      layerName: 'EyesOverHead',
      clipRightHalf: true,
    });
  }

  // EyesOverStandardCut: full eyes layer over Standard Cut Blonde/Brown and Trump Wave heads
  // Eye patch stays at normal z-index (below head), so exclude it here
  if (hasLayersAboveHead && eyesPath && !hasTyson && !hasNinja && !hasAstronaut && !hasEyePatchSelected) {
    layers.push({
      path: eyesPath,
      zIndex: LAYER_Z_INDEX.EyesOverStandardCut,
      layerName: 'EyesOverStandardCut',
    });
  }

  // MaskOverStandardCut: Hannibal and Copium masks render above Standard Cut / Trump Wave heads
  // Bandana mask stays at normal z-index (below head)
  if (hasLayersAboveHead && (hasHannibal || hasCopium)) {
    const maskPath = selectedLayers.Mask;
    if (maskPath) {
      layers.push({
        path: maskPath,
        zIndex: LAYER_Z_INDEX.MaskOverStandardCut,
        layerName: 'MaskOverStandardCut',
      });
    }
  }

  // FullFaceMask: Skull masks and Fake It mask render on top of everything
  if (hasFullFaceMask) {
    const maskPath = selectedLayers.Mask;
    if (maskPath) {
      layers.push({
        path: maskPath,
        zIndex: LAYER_Z_INDEX.FullFaceMask,
        layerName: 'FullFaceMask',
      });
    }
  }

  // Sort by z-index
  return layers.sort((a, b) => a.zIndex - b.zIndex);
}

// ============ Rendering ============

function createOffscreenCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
} {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (ctx) return { canvas, ctx };
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  return { canvas, ctx };
}

/**
 * Draw an image with optional clipping
 */
function drawLayer(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  image: HTMLImageElement,
  size: number,
  clipRightHalf?: boolean,
  clipLeftPercent?: number
): void {
  if (clipRightHalf) {
    // Clip to right half only (50% to 100% of width)
    ctx.save();
    ctx.beginPath();
    ctx.rect(size / 2, 0, size / 2, size);
    ctx.clip();
    ctx.drawImage(image, 0, 0, size, size);
    ctx.restore();
  } else if (clipLeftPercent && clipLeftPercent > 0) {
    // Clip left portion (e.g., 0.1 = skip first 10%, render remaining 90%)
    const clipX = size * clipLeftPercent;
    ctx.save();
    ctx.beginPath();
    ctx.rect(clipX, 0, size - clipX, size);
    ctx.clip();
    ctx.drawImage(image, 0, 0, size, size);
    ctx.restore();
  } else {
    ctx.drawImage(image, 0, 0, size, size);
  }
}

export async function renderToCanvas(
  selectedLayers: SelectedLayers,
  options: {
    size?: number;
    includeBackground?: boolean;
  } = {}
): Promise<RenderResult> {
  const size = options.size ?? CANVAS_CONFIG.renderSize;
  const { canvas, ctx } = createOffscreenCanvas(size, size);

  ctx.clearRect(0, 0, size, size);

  const layers = buildRenderLayers(selectedLayers);

  const loadPromises = layers.map(async (layer) => {
    try {
      const image = await loadImage(layer.path);
      return { ...layer, image };
    } catch (err) {
      console.warn(`Failed to load image for ${layer.layerName}:`, err);
      return null;
    }
  });

  const loadedLayers = (await Promise.all(loadPromises)).filter(
    (l): l is RenderLayer & { image: HTMLImageElement } => l !== null
  );

  loadedLayers.sort((a, b) => a.zIndex - b.zIndex);

  for (const layer of loadedLayers) {
    if (!options.includeBackground && layer.layerName === 'Background') {
      continue;
    }
    drawLayer(ctx, layer.image, size, layer.clipRightHalf, layer.clipLeftPercent);
  }

  let dataUrl: string;
  if (canvas instanceof OffscreenCanvas) {
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    dataUrl = await blobToDataUrl(blob);
  } else {
    dataUrl = canvas.toDataURL('image/png');
  }

  return {
    dataUrl,
    width: size,
    height: size,
  };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function renderPreview(selectedLayers: SelectedLayers): Promise<string> {
  const result = await renderToCanvas(selectedLayers, {
    size: CANVAS_CONFIG.displaySize,
    includeBackground: true,
  });
  return result.dataUrl;
}

export async function renderThumbnail(selectedLayers: SelectedLayers): Promise<string> {
  const result = await renderToCanvas(selectedLayers, {
    size: CANVAS_CONFIG.thumbnailSize,
    includeBackground: true,
  });
  return result.dataUrl;
}

export async function exportImage(
  selectedLayers: SelectedLayers,
  options: ExportOptions
): Promise<Blob> {
  let size: number;
  if ('preset' in options.size) {
    size = CANVAS_CONFIG.exportSizes[options.size.preset]?.width ?? CANVAS_CONFIG.renderSize;
  } else {
    size = options.size.custom.width;
  }

  const { canvas, ctx } = createOffscreenCanvas(size, size);

  ctx.clearRect(0, 0, size, size);

  const layers = buildRenderLayers(selectedLayers);

  const loadPromises = layers.map(async (layer) => {
    try {
      const image = await loadImage(layer.path);
      return { ...layer, image };
    } catch {
      return null;
    }
  });

  const loadedLayers = (await Promise.all(loadPromises)).filter(
    (l): l is RenderLayer & { image: HTMLImageElement } => l !== null
  );

  loadedLayers.sort((a, b) => a.zIndex - b.zIndex);

  for (const layer of loadedLayers) {
    if (!options.includeBackground && layer.layerName === 'Background') {
      continue;
    }
    drawLayer(ctx, layer.image, size, layer.clipRightHalf, layer.clipLeftPercent);
  }

  const mimeType = `image/${options.format}`;
  const quality = options.quality ?? 0.92;

  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: mimeType, quality });
  } else {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        mimeType,
        quality
      );
    });
  }
}

export async function downloadImage(
  selectedLayers: SelectedLayers,
  options: ExportOptions,
  filename: string = 'wojak'
): Promise<void> {
  const blob = await exportImage(selectedLayers, options);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${options.format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export async function renderToTargetCanvas(
  targetCanvas: HTMLCanvasElement,
  selectedLayers: SelectedLayers,
  options: {
    includeBackground?: boolean;
  } = {}
): Promise<void> {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  const width = targetCanvas.width;
  const height = targetCanvas.height;

  ctx.clearRect(0, 0, width, height);

  const layers = buildRenderLayers(selectedLayers);

  const loadPromises = layers.map(async (layer) => {
    try {
      const image = await loadImage(layer.path);
      return { ...layer, image };
    } catch {
      return null;
    }
  });

  const loadedLayers = (await Promise.all(loadPromises)).filter(
    (l): l is RenderLayer & { image: HTMLImageElement } => l !== null
  );

  loadedLayers.sort((a, b) => a.zIndex - b.zIndex);

  for (const layer of loadedLayers) {
    if (!options.includeBackground && layer.layerName === 'Background') {
      continue;
    }
    drawLayer(ctx, layer.image, width, layer.clipRightHalf, layer.clipLeftPercent);
  }
}

export function hasRequiredSelections(selectedLayers: SelectedLayers): boolean {
  const basePath = selectedLayers.Base;
  return !!basePath && basePath !== '' && basePath !== 'None';
}

export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = src;
  });
}
