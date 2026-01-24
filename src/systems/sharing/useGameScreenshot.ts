/**
 * Game Screenshot Hook
 *
 * Provides methods to capture game screenshots at game over
 * for sharing with actual gameplay visuals.
 */

import { useState, useCallback } from 'react';
import { captureGameArea } from './captureDOM';

export interface UseGameScreenshotReturn {
  /** Captured screenshot as base64 data URL */
  screenshot: string | null;
  /** Whether a capture is in progress */
  isCapturing: boolean;
  /** Capture a canvas element directly */
  captureCanvas: (canvas: HTMLCanvasElement) => string | null;
  /** Capture a DOM element using html2canvas */
  captureDOM: (element: HTMLElement) => Promise<string | null>;
  /** Clear the stored screenshot */
  clearScreenshot: () => void;
  /** Set screenshot from external source */
  setScreenshot: (screenshot: string | null) => void;
}

/**
 * Hook for capturing game screenshots at game over
 *
 * Usage:
 * ```tsx
 * const { screenshot, captureCanvas, captureDOM } = useGameScreenshot();
 *
 * // For canvas games:
 * const handleGameOver = () => {
 *   captureCanvas(canvasRef.current);
 *   setGameState('gameover');
 * };
 *
 * // For DOM games:
 * const handleGameOver = async () => {
 *   await captureDOM(gameAreaRef.current);
 *   setGameState('gameover');
 * };
 *
 * // Pass to share components:
 * <ShareButton scoreData={...} screenshot={screenshot} />
 * ```
 */
export function useGameScreenshot(): UseGameScreenshotReturn {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  /**
   * Capture a canvas element directly (instant)
   * Use for canvas-based games like FlappyOrange
   */
  const captureCanvas = useCallback((canvas: HTMLCanvasElement): string | null => {
    if (!canvas) {
      console.warn('[Screenshot] No canvas provided');
      return null;
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');
      setScreenshot(dataUrl);
      return dataUrl;
    } catch (error) {
      console.error('[Screenshot] Failed to capture canvas:', error);
      return null;
    }
  }, []);

  /**
   * Capture a DOM element using html2canvas (async)
   * Use for DOM-based games like BlockPuzzle
   */
  const captureDOM = useCallback(async (element: HTMLElement): Promise<string | null> => {
    if (!element) {
      console.warn('[Screenshot] No element provided');
      return null;
    }

    setIsCapturing(true);

    try {
      const dataUrl = await captureGameArea(element);
      setScreenshot(dataUrl);
      return dataUrl;
    } catch (error) {
      console.error('[Screenshot] Failed to capture DOM:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  /**
   * Clear the stored screenshot
   */
  const clearScreenshot = useCallback(() => {
    setScreenshot(null);
  }, []);

  return {
    screenshot,
    isCapturing,
    captureCanvas,
    captureDOM,
    clearScreenshot,
    setScreenshot,
  };
}
