import type { EffectPreset } from '../EffectsProvider';

// Combo celebration presets based on combo level
export const getComboPreset = (level: number, position: { x: number; y: number }): EffectPreset => {
  const effects: EffectPreset['effects'] = [];

  // Always show combo text
  effects.push({
    type: 'combo-text',
    position,
    data: {
      text: `${level}x COMBO!`,
      level,
      subtext: level >= 5 ? getComboSubtext(level) : undefined
    },
    duration: 1000
  });

  // Level 2+: Add sparks
  if (level >= 2) {
    effects.push({
      type: 'sparks',
      position,
      data: { count: level * 3 },
      duration: 800
    });
  }

  // Level 3+: Add shockwave
  if (level >= 3) {
    effects.push({
      type: 'shockwave',
      position,
      data: { size: 100 + level * 20 },
      duration: 600
    });
  }

  // Level 5+: Add confetti
  if (level >= 5) {
    effects.push({
      type: 'confetti',
      position,
      data: { count: level * 10 },
      duration: 2000
    });
  }

  // Level 7+: Add screen shake
  if (level >= 7) {
    effects.push({
      type: 'screen-shake',
      data: { intensity: Math.min(level - 5, 5) },
      duration: 400
    });
  }

  // Level 10+: Add lightning
  if (level >= 10) {
    effects.push({
      type: 'lightning',
      duration: 300
    });
    effects.push({
      type: 'vignette-pulse',
      data: { color: '#FFD700' },
      duration: 400
    });
  }

  return { effects };
};

function getComboSubtext(level: number): string {
  if (level >= 10) return 'LEGENDARY!';
  if (level >= 8) return 'UNSTOPPABLE!';
  if (level >= 6) return 'ON FIRE!';
  if (level >= 5) return 'AMAZING!';
  return '';
}

// Score milestone celebrations
export const getScoreMilestonePreset = (milestone: number): EffectPreset => {
  return {
    effects: [
      {
        type: 'combo-text',
        position: { x: 50, y: 40 },
        data: {
          text: `${milestone.toLocaleString()} POINTS!`,
          level: Math.min(Math.floor(milestone / 1000), 10)
        },
        duration: 1500
      },
      {
        type: 'confetti',
        position: { x: 50, y: 50 },
        data: { count: 100, spread: 180 },
        duration: 3000
      },
      {
        type: 'shockwave',
        position: { x: 50, y: 50 },
        data: { size: 300, color: 'rgba(255, 215, 0, 0.5)' },
        duration: 800
      }
    ]
  };
};
