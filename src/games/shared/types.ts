// Standard game state interface all games should use
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export interface BaseGameState {
  status: GameStatus;
  score: number;
  highScore: number;
  level?: number;
  combo?: number;
}

export interface GameConfig {
  id: string;
  name: string;
  description: string;
  leaderboardId: string;
  colors: {
    primary: string;      // CSS variable name, e.g., '--color-tang-500'
    secondary: string;
    accent: string;
  };
}

export interface GameProps {
  onGameOver?: (score: number) => void;
  onScoreChange?: (score: number) => void;
}
