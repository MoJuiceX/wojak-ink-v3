/**
 * Camera Effects Library
 * Zoom, pan, follow, and camera shake for canvas games
 *
 * @example
 * import { createCamera, updateCamera, applyCameraTransform } from '@/lib/juice/camera';
 *
 * const camera = createCamera(canvasWidth, canvasHeight);
 * setCameraTarget(camera, player.x, player.y);
 * updateCamera(camera, deltaTime);
 * applyCameraTransform(ctx, camera);
 */

import { lerp } from './animations';

// ============================================
// TYPES
// ============================================

export interface Camera {
  // Position (center of view)
  x: number;
  y: number;
  targetX: number;
  targetY: number;

  // Zoom
  zoom: number;
  targetZoom: number;
  minZoom: number;
  maxZoom: number;

  // Viewport
  viewportWidth: number;
  viewportHeight: number;

  // Movement settings
  followSpeed: number;
  zoomSpeed: number;

  // Bounds (optional)
  bounds: CameraBounds | null;

  // Shake
  shakeIntensity: number;
  shakeDuration: number;
  shakeElapsed: number;
  shakeOffsetX: number;
  shakeOffsetY: number;
}

export interface CameraBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// ============================================
// CAMERA CREATION
// ============================================

/**
 * Create a new camera
 */
export const createCamera = (
  viewportWidth: number,
  viewportHeight: number,
  options?: {
    x?: number;
    y?: number;
    zoom?: number;
    followSpeed?: number;
    zoomSpeed?: number;
    minZoom?: number;
    maxZoom?: number;
    bounds?: CameraBounds;
  }
): Camera => ({
  x: options?.x ?? viewportWidth / 2,
  y: options?.y ?? viewportHeight / 2,
  targetX: options?.x ?? viewportWidth / 2,
  targetY: options?.y ?? viewportHeight / 2,
  zoom: options?.zoom ?? 1,
  targetZoom: options?.zoom ?? 1,
  minZoom: options?.minZoom ?? 0.5,
  maxZoom: options?.maxZoom ?? 2,
  viewportWidth,
  viewportHeight,
  followSpeed: options?.followSpeed ?? 0.1,
  zoomSpeed: options?.zoomSpeed ?? 0.1,
  bounds: options?.bounds ?? null,
  shakeIntensity: 0,
  shakeDuration: 0,
  shakeElapsed: 0,
  shakeOffsetX: 0,
  shakeOffsetY: 0,
});

// ============================================
// CAMERA CONTROL
// ============================================

/**
 * Set camera target position (smooth follow)
 */
export const setCameraTarget = (
  camera: Camera,
  x: number,
  y: number
): void => {
  camera.targetX = x;
  camera.targetY = y;
};

/**
 * Set camera position immediately (no smoothing)
 */
export const setCameraPosition = (
  camera: Camera,
  x: number,
  y: number
): void => {
  camera.x = x;
  camera.y = y;
  camera.targetX = x;
  camera.targetY = y;
};

/**
 * Set target zoom level
 */
export const setCameraZoom = (camera: Camera, zoom: number): void => {
  camera.targetZoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, zoom));
};

/**
 * Set zoom immediately (no smoothing)
 */
export const setCameraZoomImmediate = (camera: Camera, zoom: number): void => {
  const clampedZoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, zoom));
  camera.zoom = clampedZoom;
  camera.targetZoom = clampedZoom;
};

/**
 * Zoom in by multiplier
 */
export const zoomIn = (camera: Camera, multiplier: number = 1.1): void => {
  setCameraZoom(camera, camera.targetZoom * multiplier);
};

/**
 * Zoom out by multiplier
 */
export const zoomOut = (camera: Camera, multiplier: number = 1.1): void => {
  setCameraZoom(camera, camera.targetZoom / multiplier);
};

/**
 * Trigger camera pulse (zoom in then return)
 */
export const pulseZoom = (
  camera: Camera,
  intensity: number = 0.05,
  duration: number = 150
): void => {
  const originalZoom = camera.targetZoom;
  camera.zoom = camera.zoom * (1 + intensity);

  setTimeout(() => {
    camera.targetZoom = originalZoom;
  }, duration);
};

// ============================================
// CAMERA SHAKE
// ============================================

/**
 * Trigger camera shake
 */
export const shakeCamera = (
  camera: Camera,
  intensity: number,
  duration: number
): void => {
  camera.shakeIntensity = intensity;
  camera.shakeDuration = duration;
  camera.shakeElapsed = 0;
};

/**
 * Update shake effect
 */
const updateShake = (camera: Camera, deltaTime: number): void => {
  if (camera.shakeDuration <= 0) {
    camera.shakeOffsetX = 0;
    camera.shakeOffsetY = 0;
    return;
  }

  camera.shakeElapsed += deltaTime;

  if (camera.shakeElapsed >= camera.shakeDuration) {
    camera.shakeDuration = 0;
    camera.shakeOffsetX = 0;
    camera.shakeOffsetY = 0;
    return;
  }

  // Decay intensity over time
  const progress = camera.shakeElapsed / camera.shakeDuration;
  const currentIntensity = camera.shakeIntensity * (1 - progress);

  // Perlin-like noise
  const time = camera.shakeElapsed * 0.03;
  camera.shakeOffsetX =
    (Math.sin(time * 1.1) + Math.sin(time * 2.3)) * currentIntensity;
  camera.shakeOffsetY =
    (Math.cos(time * 1.3) + Math.cos(time * 1.7)) * currentIntensity;
};

// ============================================
// CAMERA UPDATE
// ============================================

/**
 * Update camera (call every frame)
 */
export const updateCamera = (camera: Camera, deltaTime: number): void => {
  // Smooth follow position
  camera.x = lerp(camera.x, camera.targetX, camera.followSpeed);
  camera.y = lerp(camera.y, camera.targetY, camera.followSpeed);

  // Smooth zoom
  camera.zoom = lerp(camera.zoom, camera.targetZoom, camera.zoomSpeed);

  // Apply bounds
  if (camera.bounds) {
    camera.x = Math.max(
      camera.bounds.minX + camera.viewportWidth / (2 * camera.zoom),
      Math.min(
        camera.bounds.maxX - camera.viewportWidth / (2 * camera.zoom),
        camera.x
      )
    );
    camera.y = Math.max(
      camera.bounds.minY + camera.viewportHeight / (2 * camera.zoom),
      Math.min(
        camera.bounds.maxY - camera.viewportHeight / (2 * camera.zoom),
        camera.y
      )
    );
  }

  // Update shake
  updateShake(camera, deltaTime);
};

// ============================================
// CAMERA TRANSFORM
// ============================================

/**
 * Apply camera transform to canvas context
 * Call this at the start of your render loop
 */
export const applyCameraTransform = (
  ctx: CanvasRenderingContext2D,
  camera: Camera
): void => {
  const centerX = camera.viewportWidth / 2;
  const centerY = camera.viewportHeight / 2;

  // Move to center, apply zoom, then offset by camera position
  ctx.translate(centerX, centerY);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(
    -camera.x + camera.shakeOffsetX,
    -camera.y + camera.shakeOffsetY
  );
};

/**
 * Reset camera transform
 * Call this before drawing UI elements that shouldn't be affected by camera
 */
export const resetCameraTransform = (
  ctx: CanvasRenderingContext2D
): void => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

// ============================================
// COORDINATE CONVERSION
// ============================================

/**
 * Convert screen coordinates to world coordinates
 */
export const screenToWorld = (
  camera: Camera,
  screenX: number,
  screenY: number
): { x: number; y: number } => {
  const centerX = camera.viewportWidth / 2;
  const centerY = camera.viewportHeight / 2;

  const worldX = (screenX - centerX) / camera.zoom + camera.x;
  const worldY = (screenY - centerY) / camera.zoom + camera.y;

  return { x: worldX, y: worldY };
};

/**
 * Convert world coordinates to screen coordinates
 */
export const worldToScreen = (
  camera: Camera,
  worldX: number,
  worldY: number
): { x: number; y: number } => {
  const centerX = camera.viewportWidth / 2;
  const centerY = camera.viewportHeight / 2;

  const screenX = (worldX - camera.x) * camera.zoom + centerX;
  const screenY = (worldY - camera.y) * camera.zoom + centerY;

  return { x: screenX, y: screenY };
};

/**
 * Check if a world position is visible on screen
 */
export const isInView = (
  camera: Camera,
  worldX: number,
  worldY: number,
  margin: number = 0
): boolean => {
  const screen = worldToScreen(camera, worldX, worldY);

  return (
    screen.x >= -margin &&
    screen.x <= camera.viewportWidth + margin &&
    screen.y >= -margin &&
    screen.y <= camera.viewportHeight + margin
  );
};

/**
 * Get visible world bounds
 */
export const getVisibleBounds = (
  camera: Camera
): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} => {
  const halfWidth = camera.viewportWidth / (2 * camera.zoom);
  const halfHeight = camera.viewportHeight / (2 * camera.zoom);

  return {
    left: camera.x - halfWidth,
    right: camera.x + halfWidth,
    top: camera.y - halfHeight,
    bottom: camera.y + halfHeight,
  };
};
