/**
 * useRipple Hook
 *
 * Creates a Material Design-style ripple effect on click.
 */

import { useState, useCallback } from 'react';
import type { MouseEvent } from 'react';

export interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface RippleReturn {
  ripples: Ripple[];
  onRipple: (e: MouseEvent<HTMLElement>) => void;
  onRippleComplete: (id: number) => void;
}

export function useRipple(): RippleReturn {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const onRipple = useCallback((e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples((prev) => [...prev, newRipple]);
  }, []);

  const onRippleComplete = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { ripples, onRipple, onRippleComplete };
}

export default useRipple;
