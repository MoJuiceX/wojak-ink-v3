/**
 * Layer Tabs Component
 *
 * Horizontal tabs for switching between layers.
 */

import { motion, useReducedMotion } from 'framer-motion';
import {
  Image,
  User,
  Shirt,
  Smile,
  Eye,
  Crown,
  Lock,
  Cigarette,
  Scan,
  type LucideIcon,
} from 'lucide-react';
import { useGenerator } from '@/contexts/GeneratorContext';
import { LAYER_CONFIG, LAYER_ORDER } from '@/config/layers';
import type { UILayerName } from '@/lib/wojakRules';
import { layerTabVariants } from '@/config/generatorAnimations';

// Icon mapping
const LAYER_ICONS: Record<string, LucideIcon> = {
  Image,
  User,
  Shirt,
  Smile,
  Eye,
  Crown,
  Cigarette,
  Mask: Scan,
};

interface LayerTabProps {
  layer: UILayerName;
  isActive: boolean;
  isBlocked: boolean;
  blockedReason?: string | null;
  hasSelection: boolean;
  onClick: () => void;
}

function LayerTab({
  layer,
  isActive,
  isBlocked,
  blockedReason,
  hasSelection,
  onClick,
}: LayerTabProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = LAYER_CONFIG[layer];
  const Icon = LAYER_ICONS[config.icon] || User;

  return (
    <motion.button
      className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]"
      style={{
        background: isActive ? 'var(--color-brand-primary)' : 'transparent',
        color: isActive
          ? 'white'
          : isBlocked
            ? 'var(--color-text-muted)'
            : 'var(--color-text-secondary)',
        opacity: isBlocked ? 0.5 : 1,
        filter: isBlocked ? 'grayscale(1)' : 'none',
      }}
      variants={prefersReducedMotion ? undefined : layerTabVariants}
      whileHover={isBlocked ? undefined : 'hover'}
      whileTap={isBlocked ? undefined : 'tap'}
      onClick={onClick}
      disabled={isBlocked}
      aria-selected={isActive}
      aria-disabled={isBlocked}
      title={isBlocked ? (blockedReason || `${config.label} is blocked`) : config.description}
    >
      <div className="relative">
        <Icon size={20} />
        {isBlocked && (
          <Lock
            size={10}
            className="absolute -top-1 -right-1"
            style={{ color: 'var(--color-text-muted)' }}
          />
        )}
      </div>
      <span className="text-xs font-medium">{config.label}</span>

      {/* Selection indicator dot */}
      {hasSelection && !isBlocked && (
        <div
          className="absolute top-1 right-1 w-2 h-2 rounded-full"
          style={{
            background: isActive ? 'white' : 'var(--color-brand-primary)',
          }}
        />
      )}

      {/* Required indicator */}
      {config.required && !hasSelection && (
        <div
          className="absolute top-1 right-1 w-2 h-2 rounded-full"
          style={{ background: 'var(--color-error)' }}
          title="Required"
        />
      )}
    </motion.button>
  );
}

interface LayerTabsProps {
  className?: string;
}

// Layers to hide from tabs (combined into other layers)
const HIDDEN_TABS: UILayerName[] = ['MouthItem', 'FacialHair'];

export function LayerTabs({ className = '' }: LayerTabsProps) {
  const {
    activeLayer,
    setActiveLayer,
    selectedLayers,
    isLayerDisabled,
    getDisabledReason,
  } = useGenerator();

  const hasLayerSelection = (layer: UILayerName): boolean => {
    const path = selectedLayers[layer];
    return !!path && path !== '' && path !== 'None';
  };

  // For MouthBase tab, also check if MouthItem or FacialHair has selection (since they're combined)
  const hasSelectionIncludingCombined = (layer: UILayerName): boolean => {
    if (layer === 'MouthBase') {
      return hasLayerSelection('MouthBase') || hasLayerSelection('MouthItem') || hasLayerSelection('FacialHair');
    }
    return hasLayerSelection(layer);
  };

  // Filter out hidden tabs
  const visibleLayers = LAYER_ORDER.filter((layer) => !HIDDEN_TABS.includes(layer));

  return (
    <div
      className={`flex gap-1 p-1 rounded-xl overflow-x-auto ${className}`}
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
      role="tablist"
      aria-label="Layer selection tabs"
    >
      {visibleLayers.map((layer) => (
        <LayerTab
          key={layer}
          layer={layer}
          isActive={activeLayer === layer || (layer === 'MouthBase' && (activeLayer === 'MouthItem' || activeLayer === 'FacialHair'))}
          isBlocked={isLayerDisabled(layer)}
          blockedReason={getDisabledReason(layer)}
          hasSelection={hasSelectionIncludingCombined(layer)}
          onClick={() => setActiveLayer(layer)}
        />
      ))}
    </div>
  );
}

export default LayerTabs;
