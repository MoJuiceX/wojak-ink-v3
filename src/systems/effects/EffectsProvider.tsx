import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

// Effect types
export type EffectType =
  | 'shockwave'
  | 'sparks'
  | 'confetti'
  | 'combo-text'
  | 'floating-emoji'
  | 'screen-shake'
  | 'lightning'
  | 'speed-lines'
  | 'score-popup'
  | 'vignette-pulse';

export interface Effect {
  id: string;
  type: EffectType;
  position?: { x: number; y: number };
  data?: Record<string, any>;
  duration: number;
  createdAt: number;
}

export interface EffectPreset {
  effects: Omit<Effect, 'id' | 'createdAt'>[];
}

interface EffectsContextType {
  activeEffects: Effect[];
  triggerEffect: (type: EffectType, options?: Partial<Effect>) => void;
  triggerPreset: (preset: EffectPreset) => void;
  clearEffects: () => void;
  setIntensity: (level: 'low' | 'medium' | 'high') => void;
}

const EffectsContext = createContext<EffectsContextType | undefined>(undefined);

let effectIdCounter = 0;

// Default durations for each effect type
function getDefaultDuration(type: EffectType): number {
  const durations: Record<EffectType, number> = {
    'shockwave': 600,
    'sparks': 800,
    'confetti': 3000,
    'combo-text': 1000,
    'floating-emoji': 2000,
    'screen-shake': 500,
    'lightning': 300,
    'speed-lines': 500,
    'score-popup': 1500,
    'vignette-pulse': 400
  };
  return durations[type] || 1000;
}

export const EffectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeEffects, setActiveEffects] = useState<Effect[]>([]);
  const [intensity, setIntensityState] = useState<'low' | 'medium' | 'high'>('high');

  // Generate unique ID
  const generateId = () => `effect-${++effectIdCounter}-${Date.now()}`;

  // Trigger a single effect
  const triggerEffect = useCallback((
    type: EffectType,
    options?: Partial<Effect>
  ) => {
    // Skip some effects on low intensity
    if (intensity === 'low' && ['sparks', 'lightning', 'speed-lines'].includes(type)) {
      return;
    }

    const effect: Effect = {
      id: generateId(),
      type,
      duration: getDefaultDuration(type),
      createdAt: Date.now(),
      ...options
    };

    setActiveEffects(prev => [...prev, effect]);

    // Auto-remove after duration
    setTimeout(() => {
      setActiveEffects(prev => prev.filter(e => e.id !== effect.id));
    }, effect.duration);
  }, [intensity]);

  // Trigger a preset (multiple effects at once)
  const triggerPreset = useCallback((preset: EffectPreset) => {
    preset.effects.forEach((effectConfig, index) => {
      // Stagger effects slightly for more dynamic feel
      setTimeout(() => {
        triggerEffect(effectConfig.type, effectConfig);
      }, index * 50);
    });
  }, [triggerEffect]);

  // Clear all effects
  const clearEffects = useCallback(() => {
    setActiveEffects([]);
  }, []);

  // Set intensity level
  const setIntensity = useCallback((level: 'low' | 'medium' | 'high') => {
    setIntensityState(level);
  }, []);

  return (
    <EffectsContext.Provider
      value={{
        activeEffects,
        triggerEffect,
        triggerPreset,
        clearEffects,
        setIntensity
      }}
    >
      {children}
    </EffectsContext.Provider>
  );
};

export const useEffects = () => {
  const context = useContext(EffectsContext);
  if (!context) {
    throw new Error('useEffects must be used within EffectsProvider');
  }
  return context;
};
