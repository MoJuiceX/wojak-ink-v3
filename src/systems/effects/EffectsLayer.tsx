import React from 'react';
import { useEffects } from './EffectsProvider';
import type { Effect } from './EffectsProvider';
import { Shockwave } from './components/Shockwave';
import { Sparks } from './components/Sparks';
import { Confetti } from './components/Confetti';
import { ComboText } from './components/ComboText';
import { FloatingEmoji } from './components/FloatingEmoji';
import { ScreenShake } from './components/ScreenShake';
import { Lightning } from './components/Lightning';
import { SpeedLines } from './components/SpeedLines';
import { ScorePopup } from './components/ScorePopup';
import { VignettePulse } from './components/VignettePulse';
import './effects.css';

export const EffectsLayer: React.FC = () => {
  const { activeEffects } = useEffects();

  const renderEffect = (effect: Effect) => {
    const props = {
      key: effect.id,
      position: effect.position,
      data: effect.data,
      duration: effect.duration
    };

    switch (effect.type) {
      case 'shockwave':
        return <Shockwave {...props} />;
      case 'sparks':
        return <Sparks {...props} />;
      case 'confetti':
        return <Confetti {...props} />;
      case 'combo-text':
        return <ComboText key={effect.id} position={effect.position} duration={effect.duration} data={effect.data as { text: string; level?: number; subtext?: string }} />;
      case 'floating-emoji':
        return <FloatingEmoji {...props} />;
      case 'screen-shake':
        return <ScreenShake {...props} />;
      case 'lightning':
        return <Lightning {...props} />;
      case 'speed-lines':
        return <SpeedLines {...props} />;
      case 'score-popup':
        return <ScorePopup key={effect.id} position={effect.position} duration={effect.duration} data={effect.data as { score: number; prefix?: string; color?: string; label?: string }} />;
      case 'vignette-pulse':
        return <VignettePulse {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="effects-layer" aria-hidden="true">
      {activeEffects.map(renderEffect)}
    </div>
  );
};
