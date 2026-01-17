/**
 * useLazyLoad
 *
 * Hook for lazy loading content using Intersection Observer.
 * Returns a ref to attach to the element and a boolean indicating visibility.
 */

import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface UseLazyLoadOptions {
  /** Margin around the root element */
  rootMargin?: string;
  /** Percentage of element that must be visible (0-1) */
  threshold?: number | number[];
  /** Only trigger once */
  once?: boolean;
}

interface UseLazyLoadReturn<T extends HTMLElement> {
  ref: RefObject<T | null>;
  isVisible: boolean;
}

export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: UseLazyLoadOptions = {}
): UseLazyLoadReturn<T> {
  const { rootMargin = '100px', threshold = 0, once = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip if already visible and once is true
    if (isVisible && once) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, once, isVisible]);

  return { ref, isVisible };
}

export default useLazyLoad;
