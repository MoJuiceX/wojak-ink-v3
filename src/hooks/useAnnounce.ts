/**
 * useAnnounce Hook
 *
 * Announces messages to screen readers using ARIA live regions.
 * Useful for dynamic content changes that should be communicated to assistive technology.
 */

import { useCallback, useRef } from 'react';

type AriaLive = 'polite' | 'assertive' | 'off';

interface AnnounceOptions {
  /** Priority level (default: 'polite') */
  priority?: AriaLive;
  /** Time to keep the announcement visible to AT (default: 1000ms) */
  duration?: number;
}

/**
 * Hook for announcing messages to screen readers
 *
 * @example
 * ```tsx
 * const announce = useAnnounce();
 *
 * // Announce score change
 * announce(`Score increased to ${score}`);
 *
 * // Urgent announcement
 * announce('Error: Failed to save', { priority: 'assertive' });
 * ```
 */
export function useAnnounce() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  const announce = useCallback(
    (message: string, options: AnnounceOptions = {}) => {
      const { priority = 'polite', duration = 1000 } = options;

      // Create announcer element if it doesn't exist
      if (!announcerRef.current) {
        const el = document.createElement('div');
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', priority);
        el.setAttribute('aria-atomic', 'true');
        el.className = 'sr-only';
        el.style.cssText = `
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        `;
        document.body.appendChild(el);
        announcerRef.current = el;
      }

      // Update aria-live if different priority
      if (announcerRef.current.getAttribute('aria-live') !== priority) {
        announcerRef.current.setAttribute('aria-live', priority);
      }

      // Clear and set message (clearing first ensures re-announcement)
      announcerRef.current.textContent = '';

      // Use setTimeout to ensure the clear happens first
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message;
        }
      }, 50);

      // Clear after duration
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, duration + 50);
    },
    []
  );

  return announce;
}

/**
 * Convenience hook that returns both announce and assertive announce functions
 */
export function useScreenReaderAnnouncements() {
  const announce = useAnnounce();

  const politeAnnounce = useCallback(
    (message: string) => announce(message, { priority: 'polite' }),
    [announce]
  );

  const assertiveAnnounce = useCallback(
    (message: string) => announce(message, { priority: 'assertive' }),
    [announce]
  );

  return {
    announce: politeAnnounce,
    assertive: assertiveAnnounce,
  };
}

export default useAnnounce;
