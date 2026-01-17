import type { EffectPreset } from '../EffectsProvider';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const RARITY_COLORS = {
  common: '#95A5A6',
  rare: '#3498DB',
  epic: '#9B59B6',
  legendary: '#FFD700'
};

const RARITY_PARTICLE_COUNTS = {
  common: 30,
  rare: 50,
  epic: 80,
  legendary: 120
};

export const getAchievementPreset = (achievement: Achievement): EffectPreset => {
  const color = RARITY_COLORS[achievement.rarity];
  const particleCount = RARITY_PARTICLE_COUNTS[achievement.rarity];

  const effects: EffectPreset['effects'] = [
    {
      type: 'combo-text',
      position: { x: 50, y: 35 },
      data: {
        text: 'ACHIEVEMENT!',
        level: achievement.rarity === 'legendary' ? 10 : achievement.rarity === 'epic' ? 8 : achievement.rarity === 'rare' ? 6 : 4,
        subtext: achievement.name
      },
      duration: 2500
    },
    {
      type: 'confetti',
      position: { x: 50, y: 50 },
      data: {
        count: particleCount,
        colors: [color, '#FFFFFF', color]
      },
      duration: 3000
    },
    {
      type: 'shockwave',
      position: { x: 50, y: 50 },
      data: { color: `${color}88`, size: 250 },
      duration: 700
    }
  ];

  // Legendary achievements get extra effects
  if (achievement.rarity === 'legendary') {
    effects.push({
      type: 'lightning',
      duration: 400
    });
    effects.push({
      type: 'floating-emoji',
      position: { x: 50, y: 50 },
      data: { emoji: achievement.icon, size: 3 },
      duration: 2500
    });
  }

  // Epic achievements get floating emoji
  if (achievement.rarity === 'epic') {
    effects.push({
      type: 'floating-emoji',
      position: { x: 50, y: 50 },
      data: { emoji: achievement.icon, size: 2.5 },
      duration: 2000
    });
  }

  return { effects };
};

// Milestone achievements (first time reaching score thresholds)
export const getMilestonePreset = (milestone: number, position?: { x: number; y: number }): EffectPreset => {
  const pos = position || { x: 50, y: 50 };

  return {
    effects: [
      {
        type: 'score-popup',
        position: pos,
        data: {
          score: milestone,
          prefix: '',
          color: '#FFD700',
          label: 'MILESTONE!'
        },
        duration: 2000
      },
      {
        type: 'shockwave',
        position: pos,
        data: { size: 200, color: 'rgba(255, 215, 0, 0.4)' },
        duration: 600
      },
      {
        type: 'sparks',
        position: pos,
        data: { count: 20, color: '#FFD700' },
        duration: 800
      }
    ]
  };
};
