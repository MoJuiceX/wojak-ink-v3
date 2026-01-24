// @ts-nocheck
/**
 * Merge 2048 Game - Citrus Edition
 *
 * A 2048-style merge game with an orange citrus theme for wojak.ink
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Howler } from 'howler';
import { useHowlerSounds } from '@/hooks/useHowlerSounds';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useGameEffects, GameEffects } from '@/components/media';
import { ShareButton } from '@/systems/sharing';
import { captureGameArea } from '@/systems/sharing/captureDOM';
import { useGameMute } from '@/contexts/GameMuteContext';
import './Merge2048Game.css';

// Direction type for moves
type Direction = 'up' | 'down' | 'left' | 'right';

// ============================================================================
// INTERFACES
// ============================================================================

interface Tile {
  id: number;
  value: number; // 2, 4, 8, 16... (citrus sizes)
  row: number;
  col: number;
  isNew?: boolean; // for spawn animation
  isMerged?: boolean; // for merge animation
}

// GameState interface - will be used when implementing move logic
// interface GameState {
//   tiles: Tile[];
//   score: number;
//   bestScore: number;
//   isGameOver: boolean;
//   hasWon: boolean; // reached 2048
// }

// ============================================================================
// CONSTANTS
// ============================================================================

const GRID_SIZE = 4;
const WINNING_VALUE = 2048;
const BIG_MERGE_THRESHOLD = 256; // Trigger screen shake for big merges

// Sad images for game over screen
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/Games/games_media/sad_runner_${i + 1}.png`);

// ============================================================================
// PHASE 1: SOUND FOUNDATION (Tasks 1-18)
// ============================================================================

// TASK 1: Merge sound configuration - ascending pitch per tile value
const MERGE_SOUND_CONFIG: Record<number, { pitch: number; volume: number; layers: number }> = {
  4:    { pitch: 0.8,  volume: 0.4, layers: 1 },  // Low, simple
  8:    { pitch: 0.85, volume: 0.45, layers: 1 },
  16:   { pitch: 0.9,  volume: 0.5, layers: 1 },
  32:   { pitch: 0.95, volume: 0.55, layers: 1 },
  64:   { pitch: 1.0,  volume: 0.6, layers: 1 },
  128:  { pitch: 1.05, volume: 0.65, layers: 2 }, // Add sparkle layer
  256:  { pitch: 1.1,  volume: 0.7, layers: 2 },
  512:  { pitch: 1.15, volume: 0.75, layers: 3 }, // Add bass hit
  1024: { pitch: 1.2,  volume: 0.8, layers: 3 },
  2048: { pitch: 1.3,  volume: 1.0, layers: 4 },  // Full celebration
};

// TASK 6: Milestone values for signature chime
const MILESTONE_VALUES = [128, 256, 512, 1024, 2048];

// ============================================================================
// PHASE 2: PREMIUM HAPTICS (Tasks 19-30)
// ============================================================================

// TASK 19: Haptic configuration - intensity/duration/pattern per value
const HAPTIC_CONFIG: Record<number, { intensity: number; duration: number; pattern: number[] }> = {
  4:    { intensity: 0.3, duration: 12, pattern: [12] },
  8:    { intensity: 0.4, duration: 15, pattern: [15] },
  16:   { intensity: 0.45, duration: 18, pattern: [18] },
  32:   { intensity: 0.5, duration: 20, pattern: [20] },
  64:   { intensity: 0.55, duration: 22, pattern: [22] },
  128:  { intensity: 0.6, duration: 25, pattern: [25] },
  256:  { intensity: 0.7, duration: 28, pattern: [15, 20, 25] }, // Double tap
  512:  { intensity: 0.8, duration: 32, pattern: [20, 15, 25, 15, 30] }, // Triple
  1024: { intensity: 0.9, duration: 38, pattern: [25, 20, 30, 20, 35] },
  2048: { intensity: 1.0, duration: 50, pattern: [30, 20, 35, 20, 40, 20, 50] }, // Celebration
};

// ============================================================================
// PHASE 5: DANGER STATE SYSTEM (Tasks 66-78)
// ============================================================================

// TASK 66: Danger thresholds
const DANGER_THRESHOLDS = {
  warning: 4,   // 4 or fewer empty cells
  critical: 2,  // 2 or fewer empty cells
  imminent: 1,  // Only 1 empty cell
};

// Danger level type
type DangerLevel = 'safe' | 'warning' | 'critical' | 'imminent';

// ============================================================================
// PHASE 6: FEVER MODE (Tasks 79-92)
// ============================================================================

// TASK 79 & 80: Fever state interface and config
interface FeverState {
  active: boolean;
  multiplier: number;
  intensity: number;
  startTime: number;
}

const FEVER_CONFIG = {
  activationThreshold: 5,    // Merges needed to activate
  scoreMultiplier: 2,        // 2x score during fever
  minDuration: 3000,         // Minimum fever duration
  cooldownAfterNoMerge: 2000, // Time before fever deactivates
};

// ============================================================================
// PHASE 3: TILE PERSONALITY SYSTEM (Tasks 31-45)
// ============================================================================

// TASK 31: Tile face configuration
interface TileFace {
  eyes: string;
  mouth: string;
  expression: 'happy' | 'excited' | 'worried' | 'sleepy' | 'shocked';
  extras?: string;
}

const TILE_FACES: Record<number, TileFace> = {
  2:    { eyes: '• •', mouth: '‿', expression: 'sleepy' },       // Seed - drowsy
  4:    { eyes: '◦ ◦', mouth: '‿', expression: 'happy' },        // Seedling - awake
  8:    { eyes: '° °', mouth: '◡', expression: 'happy' },        // Slice - content
  16:   { eyes: '◉ ◉', mouth: '◡', expression: 'happy' },        // Mandarin - alert
  32:   { eyes: '◉ ◉', mouth: '▽', expression: 'excited' },      // Blood orange - excited
  64:   { eyes: '★ ★', mouth: '▽', expression: 'excited' },      // Tangerine - starry
  128:  { eyes: '✧ ✧', mouth: '◇', expression: 'excited', extras: '✨' }, // Lemon - sparkly
  256:  { eyes: '◈ ◈', mouth: '○', expression: 'shocked', extras: '✨' }, // Grapefruit - wow
  512:  { eyes: '❋ ❋', mouth: '◇', expression: 'excited', extras: '🔥' }, // Pomelo - fire
  1024: { eyes: '☀ ☀', mouth: '◇', expression: 'excited', extras: '👑' }, // Golden - crowned
  2048: { eyes: '🌟🌟', mouth: '◡◡', expression: 'happy', extras: '🍊👑' }, // THE ORANGE
};

// TASK 40: Tile bios for character gallery
const TILE_BIOS: Record<number, { name: string; bio: string }> = {
  2:    { name: 'Seed', bio: 'A tiny citrus seed, full of potential!' },
  4:    { name: 'Sprout', bio: 'Just waking up to the world.' },
  8:    { name: 'Slice', bio: 'A fresh orange slice, ready to merge!' },
  16:   { name: 'Mandy', bio: 'Mandarin with big dreams.' },
  32:   { name: 'Ruby', bio: 'Blood orange with a fiery personality.' },
  64:   { name: 'Tang', bio: 'Tangerine who loves to party!' },
  128:  { name: 'Lemmy', bio: 'Lemon who brings the zest!' },
  256:  { name: 'Grape', bio: 'Grapefruit with serious goals.' },
  512:  { name: 'Pom', bio: 'Pomelo, the wise elder.' },
  1024: { name: 'Goldie', bio: 'Golden citrus royalty!' },
  2048: { name: 'THE ORANGE', bio: 'The legendary supreme citrus!' },
};

// Tile value to color mapping (citrus theme)
const TILE_COLORS: Record<number, { background: string; text: string }> = {
  2: { background: '#eee4da', text: '#776e65' }, // seed
  4: { background: '#ede0c8', text: '#776e65' }, // small citrus
  8: { background: '#f2b179', text: '#f9f6f2' }, // orange slice
  16: { background: '#f59563', text: '#f9f6f2' }, // mandarin
  32: { background: '#f67c5f', text: '#f9f6f2' }, // blood orange
  64: { background: '#f65e3b', text: '#f9f6f2' }, // tangerine
  128: { background: '#edcf72', text: '#f9f6f2' }, // lemon
  256: { background: '#edcc61', text: '#f9f6f2' }, // grapefruit
  512: { background: '#edc850', text: '#f9f6f2' }, // pomelo
  1024: { background: '#edc53f', text: '#f9f6f2' }, // golden citrus
  2048: { background: '#ff6b00', text: '#f9f6f2' }, // THE ORANGE - victory!
};

// Emoji mapping for tiles (optional visual flair)
const TILE_EMOJIS: Record<number, string> = {
  2: '',
  4: '',
  8: '',
  16: '',
  32: '',
  64: '',
  128: '',
  256: '',
  512: '',
  1024: '',
  2048: '',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all empty cell positions on the grid
 */
const getEmptyCells = (tiles: Tile[]): { row: number; col: number }[] => {
  const occupied = new Set(tiles.map((t) => `${t.row}-${t.col}`));
  const empty: { row: number; col: number }[] = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!occupied.has(`${row}-${col}`)) {
        empty.push({ row, col });
      }
    }
  }

  return empty;
};

/**
 * Spawn a new tile in a random empty cell
 * 90% chance of 2, 10% chance of 4
 */
const spawnTile = (tiles: Tile[], nextId: number): Tile | null => {
  const emptyCells = getEmptyCells(tiles);
  if (emptyCells.length === 0) return null;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  return {
    id: nextId,
    value,
    row: randomCell.row,
    col: randomCell.col,
    isNew: true,
  };
};

/**
 * Initialize a new game with 2 starting tiles
 */
const initGame = (): { tiles: Tile[]; nextTileId: number } => {
  const tiles: Tile[] = [];
  let nextTileId = 1;

  // Spawn first tile
  const tile1 = spawnTile(tiles, nextTileId++);
  if (tile1) tiles.push(tile1);

  // Spawn second tile
  const tile2 = spawnTile(tiles, nextTileId++);
  if (tile2) tiles.push(tile2);

  return { tiles, nextTileId };
};

/**
 * Get tile style based on value
 */
const getTileStyle = (value: number): React.CSSProperties => {
  const colors = TILE_COLORS[value] || { background: '#3c3a32', text: '#f9f6f2' };
  return {
    backgroundColor: colors.background,
    color: colors.text,
  };
};

/**
 * Get font size class based on tile value (for large numbers)
 */
const getFontSizeClass = (value: number): string => {
  if (value < 100) return 'tile-font-large';
  if (value < 1000) return 'tile-font-medium';
  return 'tile-font-small';
};

// TASK 34: Check if a tile has an adjacent tile with the same value (near match)
const checkNearMatch = (tiles: Tile[], targetTile: Tile): boolean => {
  return tiles.some(t =>
    t.id !== targetTile.id &&
    t.value === targetTile.value &&
    ((Math.abs(t.row - targetTile.row) === 1 && t.col === targetTile.col) ||
     (Math.abs(t.col - targetTile.col) === 1 && t.row === targetTile.row))
  );
};

// TASK 32: Face renderer component
interface TileFaceRendererProps {
  value: number;
  isNearMatch: boolean;
  isDanger: boolean;
  showFaces: boolean;
}

const TileFaceRenderer: React.FC<TileFaceRendererProps> = ({
  value,
  isNearMatch,
  isDanger,
  showFaces,
}) => {
  if (!showFaces) return null;

  const face = TILE_FACES[value] || TILE_FACES[2];

  // Modify expression based on game state
  let currentExpression = face.expression;
  if (isDanger) currentExpression = 'worried';
  if (isNearMatch) currentExpression = 'excited';

  return (
    <div className={`tile-face tile-face-${currentExpression}`}>
      <span className="tile-eyes">{face.eyes}</span>
      <span className="tile-mouth">{face.mouth}</span>
      {face.extras && <span className="tile-extras">{face.extras}</span>}
    </div>
  );
};

/**
 * Convert tiles array to 2D grid representation
 */
const tilesToGrid = (tiles: Tile[]): (Tile | null)[][] => {
  const grid: (Tile | null)[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null));
  tiles.forEach((tile) => {
    grid[tile.row][tile.col] = tile;
  });
  return grid;
};

/**
 * Slide and merge a single line (row or column)
 * Returns the merged tiles and score gained
 */
const slideAndMerge = (
  line: (Tile | null)[],
  nextIdRef: { current: number }
): { tiles: Tile[]; scoreGained: number } => {
  // Filter out nulls
  const filtered = line.filter((t): t is Tile => t !== null);
  let scoreGained = 0;
  const merged: Tile[] = [];

  for (let i = 0; i < filtered.length; i++) {
    if (i < filtered.length - 1 && filtered[i].value === filtered[i + 1].value) {
      // Merge these two tiles
      const newValue = filtered[i].value * 2;
      merged.push({
        id: nextIdRef.current++,
        value: newValue,
        row: 0, // Will be set later
        col: 0, // Will be set later
        isMerged: true,
        isNew: false,
      });
      scoreGained += newValue;
      i++; // Skip next tile (it was merged)
    } else {
      merged.push({
        ...filtered[i],
        isMerged: false,
        isNew: false,
      });
    }
  }

  return { tiles: merged, scoreGained };
};

/**
 * Get a column from the grid
 */
const getColumn = (grid: (Tile | null)[][], col: number): (Tile | null)[] => {
  return grid.map((row) => row[col]);
};

/**
 * Set a column in the grid
 */
const setColumn = (grid: (Tile | null)[][], col: number, column: (Tile | null)[]): void => {
  for (let row = 0; row < GRID_SIZE; row++) {
    grid[row][col] = column[row];
  }
};

/**
 * Check if the game is over (no moves possible)
 */
const checkGameOver = (tiles: Tile[]): boolean => {
  // Not game over if there are empty cells
  if (tiles.length < GRID_SIZE * GRID_SIZE) return false;

  const grid = tilesToGrid(tiles);

  // Check for any possible merges
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const current = grid[row][col];
      if (!current) return false; // Empty cell exists

      // Check right neighbor
      if (col < GRID_SIZE - 1 && grid[row][col + 1]?.value === current.value) {
        return false; // Can merge right
      }
      // Check bottom neighbor
      if (row < GRID_SIZE - 1 && grid[row + 1][col]?.value === current.value) {
        return false; // Can merge down
      }
    }
  }

  return true; // No moves possible
};

/**
 * Check if player has won (reached 2048)
 */
const checkWin = (tiles: Tile[]): boolean => {
  return tiles.some((tile) => tile.value >= WINNING_VALUE);
};

/**
 * Get the highest merged value from a move (for effects)
 */
const getHighestMergedValue = (tiles: Tile[]): number => {
  const mergedTiles = tiles.filter((t) => t.isMerged);
  if (mergedTiles.length === 0) return 0;
  return Math.max(...mergedTiles.map((t) => t.value));
};

// ============================================================================
// PHASE 7: NEXT TILE PREVIEW COMPONENT
// ============================================================================

// TASK 96: Next tile preview component
const NextTilePreview: React.FC<{ queue: number[]; showFaces: boolean }> = ({ queue, showFaces }) => (
  <div className="next-tile-preview">
    <span className="preview-label">NEXT</span>
    <div className="preview-tiles">
      {queue.slice(0, 2).map((value, i) => {
        const colors = TILE_COLORS[value] || { background: '#eee4da', text: '#776e65' };
        const face = TILE_FACES[value];
        return (
          <div
            key={i}
            className={`preview-tile preview-tile-${i}`}
            style={{ backgroundColor: colors.background, color: colors.text }}
          >
            {showFaces && face && (
              <span className="preview-face">{face.eyes}</span>
            )}
            <span className="preview-value">{value}</span>
          </div>
        );
      })}
    </div>
  </div>
);

// ============================================================================
// PHASE 8: COMBO DISPLAY COMPONENTS
// ============================================================================

// TASK 105: Combo display component
const ComboDisplay: React.FC<{ count: number; isActive: boolean }> = ({ count, isActive }) => {
  if (!isActive || count < 2) return null;

  const getComboColor = () => {
    if (count >= 10) return '#ff00ff';
    if (count >= 7) return '#ff4500';
    if (count >= 5) return '#ffd700';
    if (count >= 3) return '#ff8c00';
    return '#ffffff';
  };

  return (
    <div
      className={`combo-display combo-${Math.min(count, 10)}`}
      style={{ color: getComboColor() }}
    >
      <span className="combo-count">{count}x</span>
      <span className="combo-label">COMBO!</span>
    </div>
  );
};

// TASK 107: Combo timeout bar component
const ComboTimeoutBar: React.FC<{ lastMergeTime: number; isActive: boolean; timeout: number }> = ({
  lastMergeTime,
  isActive,
  timeout,
}) => {
  const [timeLeft, setTimeLeft] = useState(100);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(100);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastMergeTime;
      const remaining = Math.max(0, 100 - (elapsed / timeout) * 100);
      setTimeLeft(remaining);
    }, 16);

    return () => clearInterval(interval);
  }, [lastMergeTime, isActive, timeout]);

  if (!isActive) return null;

  return (
    <div className="combo-timeout-bar">
      <div className="combo-timeout-fill" style={{ width: `${timeLeft}%` }} />
    </div>
  );
};

// ============================================================================
// PHASE 9: ANIMATED SCORE COMPONENT
// ============================================================================

// TASK 117: Animated score counter component
const AnimatedScore: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const targetRef = useRef(value);

  useEffect(() => {
    targetRef.current = value;
  }, [value]);

  useEffect(() => {
    const animate = () => {
      setDisplayValue(prev => {
        const diff = targetRef.current - prev;
        if (Math.abs(diff) < 1) return targetRef.current;
        return prev + diff * 0.15;
      });
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, []);

  return <span className="score-value animated-score">{Math.floor(displayValue).toLocaleString()}</span>;
};

// ============================================================================
// BACKGROUND MUSIC PLAYLIST
// ============================================================================
const MUSIC_PLAYLIST = [
  { src: '/audio/music/2048-merge/sf2-chunli-final.mp3', name: 'Chun-Li Stage' },
  { src: '/audio/music/2048-merge/sf2-blanka-final.mp3', name: 'Blanka Stage' },
  { src: '/audio/music/2048-merge/sf2-sagat-final.mp3', name: 'Sagat Stage' },
  { src: '/audio/music/2048-merge/sf2-ending-final.mp3', name: 'SF2 Ending' },
];

// ============================================================================
// COMPONENT
// ============================================================================

const Merge2048Game: React.FC = () => {
  // Arcade frame mute control (from GameModal)
  const { isMuted: arcadeMuted, musicManagedExternally } = useGameMute();

  // Game state
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('merge2048-best');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [dismissedWin, setDismissedWin] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Background music refs (MP3 playlist)
  const playlistIndexRef = useRef(Math.floor(Math.random() * MUSIC_PLAYLIST.length));
  const bgMusicAudioRef = useRef<HTMLAudioElement | null>(null);
  const isMutedRef = useRef(isMuted);
  const isGameOverRef = useRef(isGameOver);

  // Keep refs in sync
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);

  // Ref for musicManagedExternally (to check in startGame)
  const musicManagedExternallyRef = useRef(musicManagedExternally);
  useEffect(() => { musicManagedExternallyRef.current = musicManagedExternally; }, [musicManagedExternally]);

  // Sync with arcade frame mute button (from GameMuteContext)
  // Note: setMuted from Howler is used later, so we call setIsMuted and pause music directly
  useEffect(() => {
    // Only sync if NOT managed externally (meaning this game controls its own music)
    if (!musicManagedExternally) {
      // Arcade mute button changed - sync local state
      setIsMuted(arcadeMuted);
      // Also directly pause/resume music for immediate feedback
      if (arcadeMuted) {
        if (bgMusicAudioRef.current) {
          bgMusicAudioRef.current.pause();
        }
      } else if (!isGameOverRef.current) {
        if (bgMusicAudioRef.current) {
          bgMusicAudioRef.current.play().catch(() => {});
        }
      }
    }
  }, [arcadeMuted, musicManagedExternally]);

  // Play specific track
  const playBgMusicTrack = useCallback((index: number) => {
    if (bgMusicAudioRef.current) {
      bgMusicAudioRef.current.pause();
    }
    playlistIndexRef.current = index;
    const track = MUSIC_PLAYLIST[index];
    const music = new Audio(track.src);
    music.volume = 1.0;
    music.addEventListener('ended', () => {
      playlistIndexRef.current = (playlistIndexRef.current + 1) % MUSIC_PLAYLIST.length;
      if (!isGameOverRef.current && !isMutedRef.current) {
        playBgMusicTrack(playlistIndexRef.current);
      }
    }, { once: true });
    bgMusicAudioRef.current = music;
    if (!isMutedRef.current) {
      music.play().catch(() => {});
    }
  }, []);

  // Play next song in playlist
  const playNextBgMusicTrack = useCallback(() => {
    playBgMusicTrack(playlistIndexRef.current);
  }, [playBgMusicTrack]);

  // Cleanup music on unmount
  useEffect(() => {
    return () => {
      if (bgMusicAudioRef.current) {
        bgMusicAudioRef.current.pause();
        bgMusicAudioRef.current = null;
      }
    };
  }, []);

  // Control music based on game over state and mute
  useEffect(() => {
    if (!isGameOver && !isMuted) {
      if (bgMusicAudioRef.current) {
        bgMusicAudioRef.current.play().catch(() => {});
      }
    } else {
      if (bgMusicAudioRef.current) {
        bgMusicAudioRef.current.pause();
      }
    }
  }, [isGameOver, isMuted]);

  // Visual effects state (local)
  const [scorePopup, setScorePopup] = useState<{ value: number; key: number } | null>(null);

  // TASK 46: Freeze frame state
  const [freezeFrame, setFreezeFrame] = useState(false);
  const freezeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // TASK 55: Track last move direction for squash/stretch
  const [lastMoveDirection, setLastMoveDirection] = useState<Direction | null>(null);

  // TASK 58: Camera zoom state
  const [cameraZoom, setCameraZoom] = useState(1);

  // TASK 62: Impact flash state
  const [impactFlash, setImpactFlash] = useState<{ x: number; y: number } | null>(null);

  // TASK 67: Danger level state
  const [dangerLevel, setDangerLevel] = useState<DangerLevel>('safe');

  // TASK 79: Fever mode state
  const [feverState, setFeverState] = useState<FeverState>({
    active: false,
    multiplier: 1,
    intensity: 0,
    startTime: 0,
  });

  // TASK 81: Track consecutive merges for fever
  const consecutiveMergesRef = useRef(0);
  const lastMergeTimeRef = useRef(0);
  // State version for UI (refs don't trigger re-renders)
  const [streakCount, setStreakCount] = useState(0);

  // TASK 35: Near-match map for tile expressions
  const [nearMatchMap, setNearMatchMap] = useState<Record<number, boolean>>({});

  // TASK 45: Face toggle setting
  const [showFaces, setShowFaces] = useState(() => {
    const saved = localStorage.getItem('merge2048-show-faces');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // TASK 41: Track unlocked tile bios
  const [unlockedBios, setUnlockedBios] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('merge2048-unlocked-bios');
    return saved ? new Set(JSON.parse(saved)) : new Set([2, 4]);
  });

  // TASK 42: Character gallery modal state
  const [showGallery, setShowGallery] = useState(false);

  // TASK 126-138: Share system state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [challengeTarget, setChallengeTarget] = useState<number | null>(null);

  // Game over screen state (FlappyOrange style)
  const [sadImage, setSadImage] = useState<string | null>(null);
  const [gameScreenshot, setGameScreenshot] = useState<string | null>(null);
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);

  // ============================================================================
  // PHASE 7: NEXT TILE PREVIEW (Tasks 93-100)
  // ============================================================================

  // TASK 93: Next tile queue state
  const [nextTileQueue, setNextTileQueue] = useState<number[]>([2, 2]);
  const [showPreview, setShowPreview] = useState(() => {
    const saved = localStorage.getItem('merge2048-show-preview');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // ============================================================================
  // PHASE 8: COMBO VISUALIZATION (Tasks 101-110)
  // ============================================================================

  // TASK 101 & 102: Combo state and timeout
  const COMBO_TIMEOUT = 1500;
  interface ComboState {
    count: number;
    lastMergeTime: number;
    isActive: boolean;
  }
  const [comboState, setComboState] = useState<ComboState>({
    count: 0,
    lastMergeTime: 0,
    isActive: false,
  });

  // ============================================================================
  // PHASE 9: EXTRA FEATURES (Tasks 111-125)
  // ============================================================================

  // TASK 111: Undo system state
  interface UndoState {
    tiles: Tile[];
    score: number;
    available: boolean;
  }
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [undoUsed, setUndoUsed] = useState(false);

  // ============================================================================
  // PHASE 11: DYNAMIC MUSIC SYSTEM (Tasks 139-145)
  // ============================================================================

  // TASK 139 & 140: Music state and refs
  interface MusicState {
    isPlaying: boolean;
    intensity: number; // 0-1 based on combo
    urgency: number;   // 0-1 based on danger
  }
  const [musicState, setMusicState] = useState<MusicState>({
    isPlaying: false,
    intensity: 0,
    urgency: 0,
  });
  const [musicEnabled, setMusicEnabled] = useState(false);
  const musicOscillatorsRef = useRef<OscillatorNode[]>([]);
  const musicGainsRef = useRef<GainNode[]>([]);

  // Audio hooks
  const { playBlockLand, playPerfectBonus, playCombo, playWinSound, playGameOver, playClick, setMuted } = useHowlerSounds();

  // Sync Howler mute state with arcade frame mute button
  useEffect(() => {
    if (!musicManagedExternally) {
      setMuted(arcadeMuted);
    }
  }, [arcadeMuted, musicManagedExternally, setMuted]);

  // Leaderboard hooks
  const { submitScore, isSignedIn, leaderboard: globalLeaderboard, userDisplayName, isSubmitting } = useLeaderboard('2048-merge');

  // Universal visual effects system
  const {
    effects,
    triggerShockwave,
    triggerSparks,
    triggerScreenShake,
    addFloatingEmoji,
    showEpicCallout,
    triggerConfetti,
    resetAllEffects,
  } = useGameEffects();

  // Refs
  const nextTileIdRef = useRef(1);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isMovingRef = useRef(false); // Prevent multiple moves during animation
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const scorePopupKeyRef = useRef(0);
  const highestTileRef = useRef(2); // Track highest tile achieved

  // TASK 6: Track milestones reached for signature sound
  const milestonesReachedRef = useRef<Set<number>>(new Set());

  // Audio context ref for procedural sounds
  const audioContextRef = useRef<AudioContext | null>(null);

  // Danger pulse interval ref
  const dangerPulseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get or create audio context (must be defined early for all sound functions)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Initialize game on mount
  useEffect(() => {
    handleNewGame();
  }, []);

  // TASK 130: Check for challenge on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const challenge = params.get('challenge');

    if (challenge) {
      try {
        const decoded = atob(challenge);
        const [scoreStr] = decoded.split('-');
        const score = parseInt(scoreStr, 10);
        if (!isNaN(score)) {
          setChallengeTarget(score);
        }
      } catch {
        // Invalid challenge, ignore
      }
    }
  }, []);

  // iOS audio unlock
  useEffect(() => {
    const unlock = () => {
      Howler.ctx?.resume();
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('touchstart', unlock);
    return () => document.removeEventListener('touchstart', unlock);
  }, []);

  // Save best score to localStorage
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('merge2048-best', score.toString());
    }
  }, [score, bestScore]);

  // ============================================================================
  // PHASE 5: DANGER STATE EFFECTS
  // ============================================================================

  // TASK 67: Update danger level based on empty cells
  useEffect(() => {
    const emptyCells = getEmptyCells(tiles).length;
    if (emptyCells <= DANGER_THRESHOLDS.imminent) {
      setDangerLevel('imminent');
    } else if (emptyCells <= DANGER_THRESHOLDS.critical) {
      setDangerLevel('critical');
    } else if (emptyCells <= DANGER_THRESHOLDS.warning) {
      setDangerLevel('warning');
    } else {
      setDangerLevel('safe');
    }
  }, [tiles]);

  // TASK 74: Periodic danger haptic pulses
  useEffect(() => {
    if (dangerLevel === 'safe') {
      if (dangerPulseIntervalRef.current) {
        clearInterval(dangerPulseIntervalRef.current);
        dangerPulseIntervalRef.current = null;
      }
      return;
    }

    const interval = dangerLevel === 'imminent' ? 500 : dangerLevel === 'critical' ? 1000 : 2000;
    dangerPulseIntervalRef.current = setInterval(() => {
      // Inline danger pulse haptic to avoid initialization order issues
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    }, interval);

    return () => {
      if (dangerPulseIntervalRef.current) {
        clearInterval(dangerPulseIntervalRef.current);
      }
    };
  }, [dangerLevel]);

  // ============================================================================
  // PHASE 6: FEVER MODE EFFECTS
  // ============================================================================

  // TASK 81: Reset fever if too much time between merges
  useEffect(() => {
    const checkCooldown = setInterval(() => {
      if (Date.now() - lastMergeTimeRef.current > FEVER_CONFIG.cooldownAfterNoMerge) {
        if (feverState.active) {
          // Inline fever deactivation to avoid initialization order issues
          setFeverState({
            active: false,
            multiplier: 1,
            intensity: 0,
            startTime: 0,
          });
        }
        consecutiveMergesRef.current = 0;
        setStreakCount(0);
      }
    }, 500);

    return () => clearInterval(checkCooldown);
  }, [feverState.active]);

  // Clear isNew/isMerged flags after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setTiles((prev) =>
        prev.map((tile) => ({
          ...tile,
          isNew: false,
          isMerged: false,
        }))
      );
      // TASK 56: Clear move direction after animation
      setLastMoveDirection(null);
    }, 200);

    return () => clearTimeout(timer);
  }, [tiles]);

  // TASK 35: Update near-match map when tiles change
  useEffect(() => {
    const map: Record<number, boolean> = {};
    tiles.forEach(tile => {
      map[tile.id] = checkNearMatch(tiles, tile);
    });
    setNearMatchMap(map);
  }, [tiles]);

  // TASK 41: Save unlocked bios to localStorage
  useEffect(() => {
    localStorage.setItem('merge2048-unlocked-bios', JSON.stringify([...unlockedBios]));
  }, [unlockedBios]);

  // TASK 45: Save face toggle setting
  useEffect(() => {
    localStorage.setItem('merge2048-show-faces', JSON.stringify(showFaces));
  }, [showFaces]);

  /**
   * Trigger haptic feedback (mobile devices) - LEGACY
   */
  const triggerHaptic = useCallback((pattern: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const durations = { light: 10, medium: 25, heavy: 50 };
      navigator.vibrate(durations[pattern]);
    }
  }, []);

  // ============================================================================
  // PHASE 2: PREMIUM HAPTIC FUNCTIONS
  // ============================================================================

  // TASK 20: Premium merge haptic based on tile value
  const triggerMergeHaptic = useCallback((resultValue: number) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const config = HAPTIC_CONFIG[resultValue] || { pattern: [20] };
      navigator.vibrate(config.pattern);
    }
  }, []);

  // TASK 21: Swipe start haptic (ultra-light)
  const triggerSwipeHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }, []);

  // TASK 22: Slide haptic (light)
  const triggerSlideHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(8);
    }
  }, []);

  // TASK 23: Error haptic for invalid move
  const triggerErrorHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  }, []);

  // TASK 24: Win celebration haptic
  const triggerWinHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([20, 30, 25, 30, 30, 30, 40, 30, 50]);
    }
  }, []);

  // TASK 25: Game over haptic
  const triggerGameOverHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([50, 100, 35, 150, 20]);
    }
  }, []);

  // TASK 26: Danger state pulse haptic
  const triggerDangerPulse = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(8);
    }
  }, []);

  // ============================================================================
  // PHASE 4: VISUAL JUICE EFFECTS FUNCTIONS
  // ============================================================================

  // TASK 46: Freeze frame function
  const triggerFreezeFrame = useCallback((duration: number = 50) => {
    setFreezeFrame(true);
    if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
    freezeTimeoutRef.current = setTimeout(() => setFreezeFrame(false), duration);
  }, []);

  // TASK 58: Camera zoom function
  const triggerCameraZoom = useCallback((intensity: number = 1.03) => {
    setCameraZoom(intensity);
    setTimeout(() => setCameraZoom(1), 150);
  }, []);

  // TASK 62: Impact flash function
  const triggerImpactFlash = useCallback((x: number, y: number) => {
    setImpactFlash({ x, y });
    setTimeout(() => setImpactFlash(null), 200);
  }, []);

  // ============================================================================
  // PHASE 10: VIRAL SHARE SYSTEM FUNCTIONS
  // ============================================================================

  // TASK 126: Generate share image
  const generateShareImage = useCallback(async (finalScore: number, highestTile: number): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    // Title
    ctx.fillStyle = '#ff6b00';
    ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('2048 Citrus Edition', 300, 55);

    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(finalScore.toLocaleString(), 300, 150);
    ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('SCORE', 300, 180);

    // Highest tile display
    const tileColor = TILE_COLORS[highestTile]?.background || '#ff6b00';
    ctx.fillStyle = tileColor;
    ctx.beginPath();
    ctx.roundRect(225, 210, 150, 90, 12);
    ctx.fill();
    ctx.fillStyle = TILE_COLORS[highestTile]?.text || '#f9f6f2';
    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(highestTile.toString(), 300, 268);
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('HIGHEST TILE', 300, 320);

    // Branding
    ctx.fillStyle = '#ff6b00';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('🍊 wojak.ink', 300, 375);

    return canvas.toDataURL('image/png');
  }, []);

  // TASK 129: Encode/decode challenge
  const encodeChallenge = useCallback((targetScore: number): string => {
    return btoa(`${targetScore}-${Date.now()}`);
  }, []);

  const decodeChallenge = useCallback((encoded: string): { score: number; timestamp: number } | null => {
    try {
      const decoded = atob(encoded);
      const [scoreStr, timestampStr] = decoded.split('-');
      return { score: parseInt(scoreStr, 10), timestamp: parseInt(timestampStr, 10) };
    } catch {
      return null;
    }
  }, []);

  // TASK 128: Native share handler
  const handleNativeShare = useCallback(async () => {
    const shareData = {
      title: '2048 Citrus Edition',
      text: `I scored ${score.toLocaleString()} in 2048 Citrus Edition! Can you beat it?`,
      url: `${window.location.origin}${window.location.pathname}?challenge=${encodeChallenge(score)}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      // Fallback to copy
      navigator.clipboard.writeText(shareData.url);
    }
  }, [score, encodeChallenge]);

  // TASK 136: Copy to clipboard
  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}?challenge=${encodeChallenge(score)}`;
    navigator.clipboard.writeText(url);
  }, [score, encodeChallenge]);

  // TASK 137: Download image
  const handleDownloadImage = useCallback(() => {
    if (!shareImage) return;
    const link = document.createElement('a');
    link.download = `2048-citrus-${score}.png`;
    link.href = shareImage;
    link.click();
  }, [shareImage, score]);

  // TASK 135: Generate text share (Wordle-style)
  const generateTextShare = useCallback((): string => {
    const tileEmoji = highestTileRef.current >= 2048 ? '🍊' :
                      highestTileRef.current >= 1024 ? '🌟' :
                      highestTileRef.current >= 512 ? '🔥' :
                      highestTileRef.current >= 256 ? '✨' : '🟧';
    return `2048 Citrus Edition ${tileEmoji}\n` +
           `Score: ${score.toLocaleString()}\n` +
           `Highest: ${highestTileRef.current}\n` +
           `\n🍊 wojak.ink/games/2048-merge`;
  }, [score]);

  // TASK 127: Open share modal with generated image
  const openShareModal = useCallback(async () => {
    const image = await generateShareImage(score, highestTileRef.current);
    setShareImage(image);
    setShowShareModal(true);
  }, [score, generateShareImage]);

  // ============================================================================
  // PHASE 7: NEXT TILE PREVIEW FUNCTIONS
  // ============================================================================

  // TASK 93: Generate next tile value
  const generateNextTile = useCallback((): number => {
    return Math.random() < 0.9 ? 2 : 4;
  }, []);

  // TASK 94: Initialize next tile queue
  const initNextTileQueue = useCallback(() => {
    setNextTileQueue([generateNextTile(), generateNextTile()]);
  }, [generateNextTile]);

  // Save preview toggle setting
  useEffect(() => {
    localStorage.setItem('merge2048-show-preview', JSON.stringify(showPreview));
  }, [showPreview]);

  // ============================================================================
  // PHASE 8: COMBO SYSTEM FUNCTIONS
  // ============================================================================

  // TASK 103: Increment combo on merge
  const incrementCombo = useCallback(() => {
    const now = Date.now();
    setComboState(prev => {
      const timeSinceLastMerge = now - prev.lastMergeTime;

      if (prev.lastMergeTime === 0 || timeSinceLastMerge > COMBO_TIMEOUT) {
        return { count: 1, lastMergeTime: now, isActive: true };
      }

      return { count: prev.count + 1, lastMergeTime: now, isActive: true };
    });
  }, [COMBO_TIMEOUT]);

  // TASK 109: Get combo sound pitch multiplier
  const getComboSoundPitch = useCallback((combo: number): number => {
    const semitones = Math.min(combo - 1, 12);
    return Math.pow(2, semitones / 12);
  }, []);

  // TASK 110: Combo break sound
  const playComboBreak = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Descending "whomp" sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  }, [isMuted, getAudioContext]);

  // TASK 104: Reset combo after timeout
  useEffect(() => {
    const checkTimeout = setInterval(() => {
      if (comboState.isActive && Date.now() - comboState.lastMergeTime > COMBO_TIMEOUT) {
        if (comboState.count >= 3) {
          playComboBreak();
        }
        setComboState({ count: 0, lastMergeTime: 0, isActive: false });
      }
    }, 200);

    return () => clearInterval(checkTimeout);
  }, [comboState, COMBO_TIMEOUT, playComboBreak]);

  // ============================================================================
  // PHASE 9: EXTRA FEATURES FUNCTIONS
  // ============================================================================

  // TASK 17 & 113: Undo sound and function
  const playUndoSound = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Rewind sound effect
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
  }, [isMuted, getAudioContext]);

  // TASK 113: Handle undo
  const handleUndo = useCallback(() => {
    if (!undoState?.available || undoUsed) return;

    setTiles(undoState.tiles);
    setScore(undoState.score);
    setUndoUsed(true);
    setUndoState(null);
    playUndoSound();
    triggerHaptic('light');
  }, [undoState, undoUsed, playUndoSound, triggerHaptic]);

  // TASK 112: Save state for undo (called before move)
  const saveStateForUndo = useCallback(() => {
    if (!undoUsed) {
      setUndoState({
        tiles: JSON.parse(JSON.stringify(tiles)),
        score: score,
        available: true,
      });
    }
  }, [tiles, score, undoUsed]);

  // ============================================================================
  // PHASE 11: DYNAMIC MUSIC SYSTEM FUNCTIONS
  // ============================================================================

  // TASK 141: Start music layers synchronized
  const startMusic = useCallback(() => {
    if (musicState.isPlaying || isMuted) return;

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Create base drone layer
    const baseOsc = ctx.createOscillator();
    const baseGain = ctx.createGain();
    baseOsc.type = 'sine';
    baseOsc.frequency.value = 55; // A1
    baseGain.gain.value = 0.08;
    baseOsc.connect(baseGain).connect(ctx.destination);
    baseOsc.start();

    // Create mid harmony layer
    const midOsc = ctx.createOscillator();
    const midGain = ctx.createGain();
    midOsc.type = 'triangle';
    midOsc.frequency.value = 110; // A2
    midGain.gain.value = 0;
    midOsc.connect(midGain).connect(ctx.destination);
    midOsc.start();

    // Create high tension layer
    const highOsc = ctx.createOscillator();
    const highGain = ctx.createGain();
    highOsc.type = 'sine';
    highOsc.frequency.value = 220; // A3
    highGain.gain.value = 0;
    highOsc.connect(highGain).connect(ctx.destination);
    highOsc.start();

    musicOscillatorsRef.current = [baseOsc, midOsc, highOsc];
    musicGainsRef.current = [baseGain, midGain, highGain];

    setMusicState(prev => ({ ...prev, isPlaying: true }));
  }, [musicState.isPlaying, isMuted, getAudioContext]);

  // TASK 145: Stop and clean up music
  const stopMusic = useCallback(() => {
    musicOscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch { /* ignore */ }
    });
    musicOscillatorsRef.current = [];
    musicGainsRef.current = [];
    setMusicState({ isPlaying: false, intensity: 0, urgency: 0 });
  }, []);

  // TASK 144: Toggle music
  const toggleMusic = useCallback(() => {
    setMusicEnabled(prev => {
      if (prev) {
        stopMusic();
        return false;
      } else {
        startMusic();
        return true;
      }
    });
  }, [startMusic, stopMusic]);

  // TASK 142: Update intensity based on combo
  useEffect(() => {
    if (!musicState.isPlaying || musicGainsRef.current.length < 3) return;

    const intensity = Math.min(comboState.count / 10, 1);
    const midGain = musicGainsRef.current[1];
    if (midGain) {
      midGain.gain.setTargetAtTime(intensity * 0.06, getAudioContext().currentTime, 0.1);
    }

    setMusicState(prev => ({ ...prev, intensity }));
  }, [comboState.count, musicState.isPlaying, getAudioContext]);

  // TASK 143: Update urgency based on danger level
  useEffect(() => {
    if (!musicState.isPlaying || musicGainsRef.current.length < 3) return;

    const urgencyMap: Record<DangerLevel, number> = {
      safe: 0,
      warning: 0.3,
      critical: 0.6,
      imminent: 1,
    };
    const urgency = urgencyMap[dangerLevel];
    const highGain = musicGainsRef.current[2];
    if (highGain) {
      highGain.gain.setTargetAtTime(urgency * 0.05, getAudioContext().currentTime, 0.1);
    }

    // Also increase base frequency with urgency
    const baseOsc = musicOscillatorsRef.current[0];
    if (baseOsc) {
      baseOsc.frequency.setTargetAtTime(55 + urgency * 20, getAudioContext().currentTime, 0.2);
    }

    setMusicState(prev => ({ ...prev, urgency }));
  }, [dangerLevel, musicState.isPlaying, getAudioContext]);

  // TASK 145: Clean up music on unmount
  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, [stopMusic]);

  // ============================================================================
  // PHASE 1: SOUND FOUNDATION FUNCTIONS
  // ============================================================================

  // TASK 2: Pitch-based merge sound function
  const playMergeSound = useCallback((resultValue: number) => {
    if (isMuted) return;
    const config = MERGE_SOUND_CONFIG[resultValue] || { pitch: 1.0, volume: 0.5, layers: 1 };
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Base merge sound - sine wave pop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const baseFreq = 440 * config.pitch; // A4 scaled by pitch

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(config.volume * 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);

    // TASK 2: Add sparkle layer for 128+
    if (config.layers >= 2) {
      setTimeout(() => {
        const sparkleOsc = ctx.createOscillator();
        const sparkleGain = ctx.createGain();
        sparkleOsc.type = 'sine';
        sparkleOsc.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);
        sparkleOsc.frequency.exponentialRampToValueAtTime(baseFreq * 3, ctx.currentTime + 0.1);
        sparkleGain.gain.setValueAtTime(0.15, ctx.currentTime);
        sparkleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        sparkleOsc.connect(sparkleGain).connect(ctx.destination);
        sparkleOsc.start(ctx.currentTime);
        sparkleOsc.stop(ctx.currentTime + 0.15);
      }, 30);
    }

    // Add bass hit for 512+
    if (config.layers >= 3) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(baseFreq * 0.25, ctx.currentTime);
      bassGain.gain.setValueAtTime(0.3, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      bassOsc.connect(bassGain).connect(ctx.destination);
      bassOsc.start(ctx.currentTime);
      bassOsc.stop(ctx.currentTime + 0.25);
    }

    // Full celebration for 2048
    if (config.layers >= 4) {
      setTimeout(() => playWinSound(), 100);
    }
  }, [isMuted, getAudioContext, playWinSound]);

  // TASK 3: Tile spawn sound
  const playSpawnSound = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = 600 + Math.random() * 60; // Slight randomization

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }, [isMuted, getAudioContext]);

  // TASK 4: Tile slide sound
  const playSlideSound = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  }, [isMuted, getAudioContext]);

  // TASK 5: Signature chime sound (A5 → E6)
  const playSignatureChime = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Note 1: A5 (880 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.value = 880;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Note 2: E6 (1318 Hz) - delayed
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.value = 1318;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.35, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.4);
    }, 100);
  }, [isMuted, getAudioContext]);

  // TASK 13: Invalid move sound
  const playInvalidMoveSound = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }, [isMuted, getAudioContext]);

  // TASK 7: Check and trigger milestone signature sound
  const checkMilestone = useCallback((highestMerged: number) => {
    if (MILESTONE_VALUES.includes(highestMerged) && !milestonesReachedRef.current.has(highestMerged)) {
      milestonesReachedRef.current.add(highestMerged);
      playSignatureChime();
    }
  }, [playSignatureChime]);

  // TASK 41: Unlock bio when reaching new tile value
  const unlockBio = useCallback((value: number) => {
    setUnlockedBios(prev => {
      if (prev.has(value)) return prev;
      const newSet = new Set(prev);
      newSet.add(value);
      return newSet;
    });
  }, []);

  // ============================================================================
  // PHASE 6: FEVER MODE FUNCTIONS
  // ============================================================================

  // TASK 89: Fever activation sound
  const playFeverActivation = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Ascending whoosh + impact
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }, [isMuted, getAudioContext]);

  // TASK 89: Fever deactivation sound
  const playFeverDeactivation = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Descending whoosh
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  }, [isMuted, getAudioContext]);

  // TASK 82: Fever activation function
  const activateFeverMode = useCallback(() => {
    setFeverState({
      active: true,
      multiplier: FEVER_CONFIG.scoreMultiplier,
      intensity: 1,
      startTime: Date.now(),
    });
    playFeverActivation();
    triggerConfetti();
    showEpicCallout('🔥 FEVER MODE! 🔥');
  }, [playFeverActivation, triggerConfetti, showEpicCallout]);

  // TASK 82: Fever deactivation function
  const deactivateFeverMode = useCallback(() => {
    setFeverState({
      active: false,
      multiplier: 1,
      intensity: 0,
      startTime: 0,
    });
    playFeverDeactivation();
  }, [playFeverDeactivation]);


  /**
   * Show score popup animation
   */
  const showScorePopup = useCallback((value: number) => {
    scorePopupKeyRef.current += 1;
    setScorePopup({ value, key: scorePopupKeyRef.current });
    setTimeout(() => setScorePopup(null), 800);
  }, []);

  /**
   * Start a new game
   */
  const handleNewGame = useCallback(() => {
    playClick();
    const { tiles: newTiles, nextTileId: newNextId } = initGame();
    setTiles(newTiles);
    nextTileIdRef.current = newNextId;
    highestTileRef.current = 2;
    // TASK 18: Reset milestone tracking on new game
    milestonesReachedRef.current = new Set();
    // TASK 78: Clean up danger state on new game
    setDangerLevel('safe');
    if (dangerPulseIntervalRef.current) {
      clearInterval(dangerPulseIntervalRef.current);
      dangerPulseIntervalRef.current = null;
    }
    // TASK 92: Reset fever state on new game
    setFeverState({
      active: false,
      multiplier: 1,
      intensity: 0,
      startTime: 0,
    });
    consecutiveMergesRef.current = 0;
    lastMergeTimeRef.current = 0;
    setStreakCount(0);
    // TASK 94: Initialize next tile queue on new game
    initNextTileQueue();
    // TASK 104: Reset combo on new game
    setComboState({ count: 0, lastMergeTime: 0, isActive: false });
    // TASK 116: Reset undo on new game
    setUndoState(null);
    setUndoUsed(false);
    setScore(0);
    setIsGameOver(false);
    setHasWon(false);
    setDismissedWin(false);
    setScorePopup(null);
    resetAllEffects();
    // Start background music on user gesture (required for mobile browsers)
    // Skip if GameModal manages the music (check both ref AND context for timing safety)
    if (!bgMusicAudioRef.current && !musicManagedExternallyRef.current && !musicManagedExternally) {
      playNextBgMusicTrack();
    }
  }, [playClick, resetAllEffects, initNextTileQueue, playNextBgMusicTrack, musicManagedExternally]);

  /**
   * Move tiles in the specified direction
   */
  const move = useCallback(
    (direction: Direction) => {
      if (isGameOver || isMovingRef.current) return;

      // TASK 112: Save state for undo before move
      saveStateForUndo();

      isMovingRef.current = true;
      // TASK 55: Track movement direction for squash/stretch
      setLastMoveDirection(direction);

      setTiles((currentTiles) => {
        const grid = tilesToGrid(currentTiles);
        const newGrid: (Tile | null)[][] = Array(GRID_SIZE)
          .fill(null)
          .map(() => Array(GRID_SIZE).fill(null));
        let totalScoreGained = 0;
        let moved = false;

        // Process based on direction
        if (direction === 'left' || direction === 'right') {
          // Process rows
          for (let row = 0; row < GRID_SIZE; row++) {
            let line = [...grid[row]];

            // Reverse for right movement (so we always merge toward index 0)
            if (direction === 'right') {
              line = line.reverse();
            }

            const { tiles: mergedTiles, scoreGained } = slideAndMerge(line, nextTileIdRef);
            totalScoreGained += scoreGained;

            // Pad with nulls and assign positions
            const newLine: (Tile | null)[] = [];
            for (let col = 0; col < GRID_SIZE; col++) {
              if (col < mergedTiles.length) {
                const tile = mergedTiles[col];
                const actualCol = direction === 'right' ? GRID_SIZE - 1 - col : col;
                newLine.push({ ...tile, row, col: actualCol });
              } else {
                newLine.push(null);
              }
            }

            // Reverse back for right movement
            if (direction === 'right') {
              newLine.reverse();
            }

            newGrid[row] = newLine;
          }
        } else {
          // Process columns (up/down)
          for (let col = 0; col < GRID_SIZE; col++) {
            let line = getColumn(grid, col);

            // Reverse for down movement
            if (direction === 'down') {
              line = line.reverse();
            }

            const { tiles: mergedTiles, scoreGained } = slideAndMerge(line, nextTileIdRef);
            totalScoreGained += scoreGained;

            // Pad with nulls and assign positions
            const newColumn: (Tile | null)[] = [];
            for (let row = 0; row < GRID_SIZE; row++) {
              if (row < mergedTiles.length) {
                const tile = mergedTiles[row];
                const actualRow = direction === 'down' ? GRID_SIZE - 1 - row : row;
                newColumn.push({ ...tile, row: actualRow, col });
              } else {
                newColumn.push(null);
              }
            }

            // Reverse back for down movement
            if (direction === 'down') {
              newColumn.reverse();
            }

            setColumn(newGrid, col, newColumn);
          }
        }

        // Convert grid back to tiles array
        const newTiles: Tile[] = [];
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            const tile = newGrid[row][col];
            if (tile) {
              newTiles.push(tile);
            }
          }
        }

        // Check if anything moved
        const oldPositions = new Set(currentTiles.map((t) => `${t.row}-${t.col}-${t.value}`));
        const newPositions = new Set(newTiles.map((t) => `${t.row}-${t.col}-${t.value}`));
        moved =
          oldPositions.size !== newPositions.size ||
          [...oldPositions].some((p) => !newPositions.has(p));

        if (moved) {
          // TASK 11: Play slide sound (using new procedural sound)
          playSlideSound();
          // TASK 22 & 27: Use premium slide haptic
          triggerSlideHaptic();

          // TASK 83 & 84: Track consecutive merges and apply fever multiplier
          if (totalScoreGained > 0) {
            consecutiveMergesRef.current++;
            lastMergeTimeRef.current = Date.now();
            setStreakCount(consecutiveMergesRef.current);

            // TASK 103: Increment combo counter
            incrementCombo();

            // TASK 83: Trigger fever on consecutive merge threshold
            if (!feverState.active && consecutiveMergesRef.current >= FEVER_CONFIG.activationThreshold) {
              activateFeverMode();
            }

            // TASK 84: Apply score multiplier in fever mode
            const finalScore = feverState.active
              ? Math.floor(totalScoreGained * feverState.multiplier)
              : totalScoreGained;

            setScore((prev) => prev + finalScore);
            showScorePopup(finalScore);
          }

          // Check for big merges (screen shake + combo sound + universal effects)
          const highestMerged = getHighestMergedValue(newTiles);

          // TASK 8 & 9: Use new pitch-based merge sound system
          if (highestMerged > 0) {
            playMergeSound(highestMerged);
            // TASK 7: Check for milestone and play signature chime
            checkMilestone(highestMerged);
            // TASK 41: Unlock bio for new tile values
            unlockBio(highestMerged);
          }

          // TASK 28: Use premium merge haptic based on value
          if (highestMerged > 0) {
            triggerMergeHaptic(highestMerged);
          }

          if (highestMerged >= BIG_MERGE_THRESHOLD) {
            // TASK 47: Trigger freeze frame for big merges
            triggerFreezeFrame(60);
            triggerScreenShake(300);
            triggerShockwave('#ff6b00', 0.7);
            triggerSparks('#ff6b00');
            // TASK 61: Trigger camera zoom on big merges
            if (highestMerged >= 512) {
              triggerCameraZoom(1.08);
            } else if (highestMerged >= 256) {
              triggerCameraZoom(1.05);
            }
            // Track highest tile for metadata
            if (highestMerged > highestTileRef.current) {
              highestTileRef.current = highestMerged;
              addFloatingEmoji(TILE_EMOJIS[highestMerged] || '🔥');
              showEpicCallout(`${highestMerged}!`);
            }
            // Extra celebration for very high tiles
            if (highestMerged >= 512) {
              triggerConfetti();
            }
          } else if (highestMerged > 0) {
            // Regular merge - combo tracked by incrementCombo()
          }

          // Check for win (first time reaching 2048)
          // TASK 29: Use triggerWinHaptic for win
          if (!hasWon && checkWin(newTiles)) {
            setHasWon(true);
            playWinSound();
            triggerWinHaptic();
            triggerConfetti();
            showEpicCallout('YOU WIN!');
            triggerShockwave('#FFD700', 1.0);
          }

          // Spawn new tile after animation delay
          // TASK 95: Use queue when spawning tiles
          setTimeout(() => {
            setTiles((prev) => {
              const emptyCells = getEmptyCells(prev);
              if (emptyCells.length === 0) return prev;

              const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
              const value = nextTileQueue[0] || (Math.random() < 0.9 ? 2 : 4);

              // Shift queue and add new tile
              setNextTileQueue(prevQueue => [...prevQueue.slice(1), generateNextTile()]);

              const newTile: Tile = {
                id: nextTileIdRef.current++,
                value,
                row: randomCell.row,
                col: randomCell.col,
                isNew: true,
              };

              if (newTile) {
                // TASK 10: Play spawn sound
                playSpawnSound();
                const tilesWithNew = [...prev, newTile];
                // Check for game over after spawning new tile
                // TASK 29: Use triggerGameOverHaptic for game over
                if (checkGameOver(tilesWithNew)) {
                  // Capture screenshot before game over overlay
                  const gridEl = document.querySelector('.grid-container') as HTMLElement;
                  if (gridEl) {
                    captureGameArea(gridEl).then(screenshot => {
                      if (screenshot) setGameScreenshot(screenshot);
                    });
                  }
                  setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
                  // Stop background music immediately on death
                  if (bgMusicAudioRef.current) {
                    bgMusicAudioRef.current.pause();
                    bgMusicAudioRef.current = null;
                  }
                  setIsGameOver(true);
                  playGameOver();
                  triggerGameOverHaptic();
                  triggerScreenShake(500);
                  addFloatingEmoji('💀');
                  // Submit score to leaderboard
                  if (isSignedIn) {
                    setScoreSubmitted(true);
                    submitScore(score + totalScoreGained, undefined, {
                      highestTile: highestTileRef.current,
                    }).then(result => {
                      if (result?.isNewHighScore) setIsNewPersonalBest(true);
                    });
                  }
                }
                return tilesWithNew;
              }
              // Check game over even without new tile
              if (checkGameOver(prev)) {
                // Capture screenshot before game over overlay
                const gridEl = document.querySelector('.grid-container') as HTMLElement;
                if (gridEl) {
                  captureGameArea(gridEl).then(screenshot => {
                    if (screenshot) setGameScreenshot(screenshot);
                  });
                }
                setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
                // Stop background music immediately on death
                if (bgMusicAudioRef.current) {
                  bgMusicAudioRef.current.pause();
                  bgMusicAudioRef.current = null;
                }
                setIsGameOver(true);
                playGameOver();
                triggerGameOverHaptic();
                triggerScreenShake(500);
                addFloatingEmoji('💀');
                if (isSignedIn) {
                  setScoreSubmitted(true);
                  submitScore(score + totalScoreGained, undefined, {
                    highestTile: highestTileRef.current,
                  }).then(result => {
                    if (result?.isNewHighScore) setIsNewPersonalBest(true);
                  });
                }
              }
              return prev;
            });
            isMovingRef.current = false;
          }, 150);

          return newTiles;
        } else {
          // TASK 14: No move happened - play invalid move sound
          playInvalidMoveSound();
          // TASK 23: Error haptic for invalid move
          triggerErrorHaptic();
          isMovingRef.current = false;
          return currentTiles;
        }
      });
    },
    [isGameOver, hasWon, showScorePopup, triggerScreenShake, playSlideSound, playMergeSound, playSpawnSound, playInvalidMoveSound, checkMilestone, playWinSound, playGameOver, isSignedIn, submitScore, score, triggerShockwave, triggerSparks, addFloatingEmoji, showEpicCallout, triggerConfetti, triggerSlideHaptic, triggerMergeHaptic, triggerWinHaptic, triggerGameOverHaptic, triggerErrorHaptic, unlockBio, saveStateForUndo, incrementCombo, nextTileQueue, generateNextTile]
  );

  /**
   * Handle keyboard input
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      let direction: Direction | null = null;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = 'right';
          break;
      }

      if (direction) {
        e.preventDefault();
        move(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, isGameOver]);

  /**
   * Handle touch start
   * TASK 30: Add haptic to touch start
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    // TASK 30: Trigger swipe haptic on touch start
    triggerSwipeHaptic();
  }, [triggerSwipeHaptic]);

  /**
   * Handle touch end - detect swipe direction
   */
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || isGameOver) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const minSwipe = 50; // Minimum swipe distance

      touchStartRef.current = null;

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipe) {
          move(deltaX > 0 ? 'right' : 'left');
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipe) {
          move(deltaY > 0 ? 'down' : 'up');
        }
      }
    },
    [move, isGameOver]
  );

  /**
   * Prevent default touch behavior (scrolling)
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
  }, []);

  /**
   * Render the grid background (empty cells)
   * TASK 70: Highlight empty cells in danger state
   */
  const renderGridBackground = useCallback(() => {
    const cells = [];
    const emptyCells = getEmptyCells(tiles);
    const emptySet = new Set(emptyCells.map(c => `${c.row}-${c.col}`));

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const isEmpty = emptySet.has(`${row}-${col}`);
        const isHighlighted = dangerLevel !== 'safe' && isEmpty;
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`grid-cell ${isHighlighted ? 'cell-highlighted' : ''}`}
          />
        );
      }
    }
    return cells;
  }, [tiles, dangerLevel]);

  /**
   * Get glow class for high-value tiles
   */
  const getGlowClass = (value: number): string => {
    if (value >= 2048) return 'tile-glow-2048';
    if (value >= 1024) return 'tile-glow-1024';
    if (value >= 512) return 'tile-glow-512';
    if (value >= 256) return 'tile-glow-256';
    if (value >= 128) return 'tile-glow-128';
    return '';
  };

  /**
   * Render a single tile
   * TASK 37: Updated to include TileFaceRenderer
   */
  const renderTile = (tile: Tile) => {
    const style: React.CSSProperties = {
      ...getTileStyle(tile.value),
      '--tile-row': tile.row,
      '--tile-col': tile.col,
    } as React.CSSProperties;

    // TASK 56: Apply movement direction class to tiles
    const moveClass = lastMoveDirection && !tile.isNew && !tile.isMerged
      ? `tile-moving-${lastMoveDirection}`
      : '';

    const classes = [
      'tile',
      getFontSizeClass(tile.value),
      getGlowClass(tile.value),
      tile.isNew ? 'tile-new' : '',
      tile.isMerged ? 'tile-merged' : '',
      moveClass,
    ]
      .filter(Boolean)
      .join(' ');

    // TASK 36: Use dangerLevel for face expressions
    const isDanger = dangerLevel !== 'safe';

    return (
      <div key={tile.id} className={classes} style={style}>
        {/* TASK 37: Add tile face */}
        <TileFaceRenderer
          value={tile.value}
          isNearMatch={nearMatchMap[tile.id] || false}
          isDanger={isDanger}
          showFaces={showFaces}
        />
        <span className="tile-value">
          {tile.value}
        </span>
      </div>
    );
  };

  return (
    <div className="merge2048-container">
      {/* Header */}
      <div className="merge2048-header">
        <div className="merge2048-title">
          <h1>2048</h1>
          <span className="merge2048-subtitle">Citrus Edition</span>
        </div>

        <div className="merge2048-scores">
          {/* TASK 118: Replace score display with AnimatedScore */}
          <div className="score-box">
            <span className="score-label">SCORE</span>
            <AnimatedScore value={score} />
          </div>
          <div className="score-box">
            <span className="score-label">BEST</span>
            <span className="score-value">{bestScore.toLocaleString()}</span>
          </div>
          {/* TASK 131: Challenge target display */}
          {challengeTarget && (
            <div className={`score-box challenge-box ${score >= challengeTarget ? 'challenge-won' : ''}`}>
              <span className="score-label">TARGET</span>
              <span className="score-value">{challengeTarget.toLocaleString()}</span>
            </div>
          )}
        </div>
        {/* TASK 98: Next tile preview in header */}
        {showPreview && <NextTilePreview queue={nextTileQueue} showFaces={showFaces} />}
      </div>

      {/* Controls */}
      <div className="merge2048-controls">
        <button className="new-game-btn" onClick={handleNewGame}>
          New Game
        </button>
        {/* TASK 114: Undo button */}
        <button
          className={`undo-btn ${undoUsed || !undoState?.available ? 'disabled' : ''}`}
          onClick={handleUndo}
          disabled={undoUsed || !undoState?.available}
          aria-label="Undo"
        >
          ↩️
        </button>
        {/* TASK 43: Gallery button */}
        <button
          className="gallery-btn"
          onClick={() => setShowGallery(true)}
          aria-label="Character Gallery"
        >
          📖
        </button>
        {/* TASK 45: Face toggle button */}
        <button
          className="face-toggle-btn"
          onClick={() => setShowFaces(prev => !prev)}
          aria-label={showFaces ? 'Hide faces' : 'Show faces'}
        >
          {showFaces ? '😊' : '🔢'}
        </button>
        {/* TASK 99: Preview toggle button */}
        <button
          className="preview-toggle-btn"
          onClick={() => setShowPreview(prev => !prev)}
          aria-label={showPreview ? 'Hide preview' : 'Show preview'}
        >
          {showPreview ? '👁️' : '👁️‍🗨️'}
        </button>
        {/* Mute button removed - arcade frame handles muting via GameMuteContext */}
        {/* TASK 144: Music toggle button */}
        <button
          className={`music-btn ${musicEnabled ? 'active' : ''}`}
          onClick={toggleMusic}
          aria-label={musicEnabled ? 'Stop music' : 'Start music'}
        >
          {musicEnabled ? '🎵' : '🎶'}
        </button>
      </div>

      {/* Universal Game Effects Layer */}
      <GameEffects effects={effects} accentColor="#ff6b00" />

      {/* Game Grid */}
      {/* TASK 77: Add danger level to grid wrapper class */}
      {/* TASK 85: Add fever-active class when fever mode is on */}
      {/* TASK 48 & 59: Add freeze-frame and camera zoom */}
      <div
        ref={gridWrapperRef}
        className={`merge2048-grid-wrapper ${effects.screenShake ? 'shake' : ''} ${dangerLevel !== 'safe' ? `danger-${dangerLevel}` : ''} ${feverState.active ? 'fever-active' : ''} ${freezeFrame ? 'freeze-frame' : ''}`}
        style={{ transform: `scale(${cameraZoom})` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {/* TASK 87: Fever meter UI component */}
        {feverState.active && (
          <div className="fever-meter-container">
            <div className="fever-meter fever-meter-enter">
              <span className="fever-meter-icon">🔥</span>
              <span className="fever-meter-text">FEVER</span>
              <span className="fever-meter-multiplier">{feverState.multiplier}x</span>
            </div>
          </div>
        )}

        {/* Merge streak indicator (building toward fever) */}
        {!feverState.active && streakCount > 0 && (
          <div className="merge-streak-indicator">
            {Array.from({ length: FEVER_CONFIG.activationThreshold }).map((_, i) => (
              <div
                key={i}
                className={`streak-dot ${i < streakCount ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
        <div className="merge2048-grid">
          {/* Background cells */}
          <div className="grid-background">{renderGridBackground()}</div>

          {/* Tiles layer */}
          <div className="tiles-container">{tiles.map(renderTile)}</div>

          {/* TASK 63: Impact flash component */}
          {impactFlash && (
            <div
              className="impact-flash"
              style={{ left: impactFlash.x, top: impactFlash.y }}
            />
          )}

          {/* Score popup animation */}
          {scorePopup && (
            <span key={scorePopup.key} className="score-popup">
              +{scorePopup.value}
            </span>
          )}

          {/* Game Over overlay - FlappyOrange style */}
          {isGameOver && (
            <div className="m2048-game-over-overlay" onClick={(e) => e.stopPropagation()}>
              <div className="m2048-game-over-content">
                <div className="m2048-game-over-left">
                  {sadImage ? (
                    <img src={sadImage} alt="Game Over" className="m2048-sad-image" />
                  ) : (
                    <div className="m2048-game-over-emoji">🍊</div>
                  )}
                </div>
                <div className="m2048-game-over-right">
                  <h2 className="m2048-game-over-title">Game Over!</h2>

                  <div className="m2048-game-over-score">
                    <span className="m2048-score-value">{score.toLocaleString()}</span>
                    <span className="m2048-score-label">points</span>
                  </div>

                  <div className="m2048-game-over-stats">
                    <div className="m2048-stat">
                      <span className="m2048-stat-value">{bestScore.toLocaleString()}</span>
                      <span className="m2048-stat-label">best</span>
                    </div>
                  </div>

                  {(isNewPersonalBest || score > bestScore) && score > 0 && (
                    <div className="m2048-new-record">New Personal Best!</div>
                  )}

                  {isSignedIn && (
                    <div className="m2048-submitted">
                      {isSubmitting ? 'Saving...' : scoreSubmitted ? `Saved as ${userDisplayName}!` : ''}
                    </div>
                  )}

                  <div className="m2048-game-over-buttons">
                    <button onClick={handleNewGame} className="m2048-play-btn">
                      Play Again
                    </button>
                    <ShareButton
                      scoreData={{
                        gameId: 'merge-2048',
                        gameName: 'Merge 2048',
                        score: score,
                        highScore: bestScore,
                        isNewHighScore: isNewPersonalBest || score > bestScore,
                      }}
                      screenshot={gameScreenshot}
                      className="m2048-share-btn"
                    />
                    <button
                      onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                      className="m2048-leaderboard-btn"
                    >
                      Leaderboard
                    </button>
                  </div>
                </div>
              </div>

              {/* Leaderboard Panel */}
              {showLeaderboardPanel && (
                <div className="m2048-leaderboard-overlay" onClick={() => setShowLeaderboardPanel(false)}>
                  <div className="m2048-leaderboard-panel" onClick={(e) => e.stopPropagation()}>
                    <div className="m2048-leaderboard-header">
                      <h3>Leaderboard</h3>
                      <button className="m2048-leaderboard-close" onClick={() => setShowLeaderboardPanel(false)}>×</button>
                    </div>
                    <div className="m2048-leaderboard-list">
                      {Array.from({ length: 10 }, (_, index) => {
                        const entry = globalLeaderboard[index];
                        const isCurrentUser = entry && score === entry.score;
                        return (
                          <div key={index} className={`m2048-leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
                            <span className="m2048-leaderboard-rank">#{index + 1}</span>
                            <span className="m2048-leaderboard-name">{entry?.displayName || '---'}</span>
                            <span className="m2048-leaderboard-score">{entry?.score ?? '-'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => { window.location.href = '/games'; }}
                className="m2048-back-to-games-btn"
              >
                Back to Games
              </button>
            </div>
          )}

          {/* Win overlay */}
          {hasWon && !dismissedWin && !isGameOver && (
            <div className="game-overlay game-won">
              <h2>You Win!</h2>
              <p>You reached 2048!</p>
              <button className="overlay-btn" onClick={() => setDismissedWin(true)}>
                Keep Playing
              </button>
              <button className="overlay-btn secondary" onClick={handleNewGame}>
                New Game
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TASK 105 & 107: Combo display - positioned below grid on mobile */}
      <div className="combo-container">
        <ComboDisplay count={comboState.count} isActive={comboState.isActive} />
        <ComboTimeoutBar
          lastMergeTime={comboState.lastMergeTime}
          isActive={comboState.isActive}
          timeout={COMBO_TIMEOUT}
        />
      </div>

      {/* Instructions */}
      <div className="merge2048-instructions">
        <p>Swipe to move tiles. Merge matching numbers to reach 2048!</p>
      </div>

      {/* TASK 42: Character Gallery Modal */}
      {showGallery && (
        <div className="gallery-modal-overlay" onClick={() => setShowGallery(false)}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-header">
              <h2>Citrus Gallery</h2>
              <span className="gallery-count">{unlockedBios.size}/{Object.keys(TILE_BIOS).length} Discovered</span>
              <button className="gallery-close" onClick={() => setShowGallery(false)}>✕</button>
            </div>
            <div className="gallery-grid">
              {Object.entries(TILE_BIOS).map(([value, bio]) => {
                const numValue = parseInt(value);
                const isUnlocked = unlockedBios.has(numValue);
                const face = TILE_FACES[numValue];
                const colors = TILE_COLORS[numValue] || { background: '#ccc', text: '#333' };
                return (
                  <div
                    key={value}
                    className={`gallery-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div
                      className="gallery-tile-preview"
                      style={{
                        backgroundColor: isUnlocked ? colors.background : '#666',
                        color: isUnlocked ? colors.text : '#999',
                      }}
                    >
                      {isUnlocked ? (
                        <>
                          <span className="gallery-face-eyes">{face.eyes}</span>
                          <span className="gallery-face-mouth">{face.mouth}</span>
                          <span className="gallery-tile-value">{value}</span>
                        </>
                      ) : (
                        <span className="gallery-locked-icon">🔒</span>
                      )}
                    </div>
                    <div className="gallery-info">
                      <span className="gallery-name">{isUnlocked ? bio.name : '???'}</span>
                      <span className="gallery-bio">{isUnlocked ? bio.bio : 'Merge tiles to discover!'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Merge2048Game;
