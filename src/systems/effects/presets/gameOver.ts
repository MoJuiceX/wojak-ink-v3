import type { EffectPreset } from '../EffectsProvider';

export const getGameOverPreset = (options: {
  isHighScore: boolean;
  isTopTen: boolean;
  score: number;
}): EffectPreset => {
  const { isHighScore, isTopTen } = options;
  const effects: EffectPreset['effects'] = [];

  if (isHighScore) {
    // Massive celebration for new high score
    effects.push(
      {
        type: 'confetti',
        position: { x: 50, y: 30 },
        data: { count: 150, spread: 180 },
        duration: 4000
      },
      {
        type: 'combo-text',
        position: { x: 50, y: 25 },
        data: {
          text: 'NEW HIGH SCORE!',
          level: 10
        },
        duration: 2000
      },
      {
        type: 'lightning',
        duration: 500
      },
      {
        type: 'shockwave',
        position: { x: 50, y: 50 },
        data: { size: 400, color: 'rgba(255, 215, 0, 0.6)' },
        duration: 1000
      }
    );
  } else if (isTopTen) {
    // Good celebration for top 10
    effects.push(
      {
        type: 'confetti',
        position: { x: 50, y: 40 },
        data: { count: 80 },
        duration: 3000
      },
      {
        type: 'combo-text',
        position: { x: 50, y: 30 },
        data: {
          text: 'TOP 10!',
          level: 7
        },
        duration: 1500
      }
    );
  }

  return { effects };
};

export const getAchievementUnlockPreset = (achievementName: string): EffectPreset => {
  return {
    effects: [
      {
        type: 'combo-text',
        position: { x: 50, y: 30 },
        data: {
          text: 'ACHIEVEMENT UNLOCKED!',
          level: 8,
          subtext: achievementName
        },
        duration: 2500
      },
      {
        type: 'confetti',
        position: { x: 50, y: 50 },
        data: {
          count: 60,
          colors: ['#FFD700', '#FFA500', '#FF8C00']
        },
        duration: 2500
      },
      {
        type: 'shockwave',
        position: { x: 50, y: 50 },
        data: { color: 'rgba(255, 215, 0, 0.5)' },
        duration: 600
      }
    ]
  };
};

export const getVictoryPreset = (): EffectPreset => {
  return {
    effects: [
      {
        type: 'confetti',
        position: { x: 50, y: 30 },
        data: { count: 120, spread: 180 },
        duration: 4000
      },
      {
        type: 'combo-text',
        position: { x: 50, y: 40 },
        data: {
          text: 'VICTORY!',
          level: 10
        },
        duration: 2000
      },
      {
        type: 'shockwave',
        position: { x: 50, y: 50 },
        data: { size: 350, color: 'rgba(255, 215, 0, 0.5)' },
        duration: 800
      }
    ]
  };
};

export const getDefeatPreset = (): EffectPreset => {
  return {
    effects: [
      {
        type: 'vignette-pulse',
        data: { color: 'rgba(255, 50, 50, 0.4)' },
        duration: 600
      },
      {
        type: 'screen-shake',
        data: { intensity: 4 },
        duration: 400
      }
    ]
  };
};
