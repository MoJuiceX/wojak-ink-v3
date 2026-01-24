import { createPortal } from 'react-dom';
import type { WeatherType } from '../config';
import type { WeatherState, GameState, Pipe } from '../types';

interface DebugPanelProps {
  enabled: boolean;
  weatherRef: React.RefObject<WeatherState>;
  gameStateRef: React.RefObject<{
    score: number;
    gameState: GameState;
    pipes: Pipe[];
  }>;
  fogTimerRef: React.RefObject<number>;
  debugSetWeather: (type: WeatherType) => void;
  toggleFog: () => void;
  spawnBirdFlock: () => void;
  spawnFallingLeaf: () => void;
  triggerLightningBolt: () => void;
  generatePipeWithCoins: (isFirst: boolean, currentScore: number) => Pipe;
  setDebugTick: React.Dispatch<React.SetStateAction<number>>;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  enabled,
  weatherRef,
  gameStateRef,
  fogTimerRef,
  debugSetWeather,
  toggleFog,
  spawnBirdFlock,
  spawnFallingLeaf,
  triggerLightningBolt,
  generatePipeWithCoins,
  setDebugTick,
}) => {
  if (!enabled) return null;

  // Read actual weather from ref (not debugWeather state) so it updates with automatic changes
  const currentWeather = weatherRef.current?.current || 'clear';
  const currentScore = gameStateRef.current?.score || 0;
  const currentState = gameStateRef.current?.gameState || 'idle';

  const getButtonStyle = (isActive: boolean) => ({
    padding: '6px 8px',
    fontSize: '11px',
    background: isActive ? '#ff6b00' : '#333',
    color: 'white',
    border: isActive ? '2px solid #fff' : '1px solid #666',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left' as const,
    fontWeight: isActive ? 'bold' : 'normal',
  });

  const sectionStyle = {
    marginBottom: '8px',
    borderBottom: '1px solid #444',
    paddingBottom: '6px',
  };

  const labelStyle = {
    fontSize: '9px',
    color: '#888',
    marginBottom: '4px',
    textTransform: 'uppercase' as const,
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: '60px',
        left: '10px',
        width: '150px',
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'auto',
        background: 'rgba(0,0,0,0.95)',
        padding: '10px',
        borderRadius: '8px',
        zIndex: 999999,
        fontFamily: 'monospace',
        fontSize: '10px',
        color: 'white',
        border: '2px solid #ff6b00',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px', color: '#ff6b00' }}>Debug Panel</div>

      {/* Current Status */}
      <div style={{ ...sectionStyle, background: '#222', padding: '6px', borderRadius: '4px', marginBottom: '10px' }}>
        <div style={{ fontSize: '10px' }}>Score: <b>{currentScore}</b></div>
        <div style={{ fontSize: '10px' }}>Weather: <b style={{ color: '#ff6b00' }}>{currentWeather}</b></div>
        <div style={{ fontSize: '10px' }}>Intensity: <b style={{ color: '#4af' }}>{Math.round((weatherRef.current?.intensity || 0) * 100)}%</b></div>
        <div style={{ fontSize: '10px' }}>Fog: <b style={{ color: '#aaa' }}>{Math.round((weatherRef.current?.fogIntensity || 0) * 100)}%</b></div>
        <div style={{ fontSize: '10px' }}>State: <b>{currentState}</b></div>
      </div>

      {/* Weather Section */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Weather (click to change)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          {(['clear', 'rain', 'storm', 'snow'] as WeatherType[]).map((w) => (
            <button key={w} onClick={() => debugSetWeather(w)} style={getButtonStyle(currentWeather === w)}>
              {w === 'clear' ? 'Sun' : w === 'rain' ? 'Rain' : w === 'storm' ? 'Storm' : 'Snow'} {w}
            </button>
          ))}
        </div>
      </div>

      {/* Fog Overlay (separate from weather) */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Fog Overlay</div>
        <button
          onClick={() => toggleFog()}
          style={getButtonStyle((weatherRef.current?.fogIntensity || 0) > 0 || (fogTimerRef.current || 0) > 0)}
        >
          {(weatherRef.current?.fogIntensity || 0) > 0 ? 'Fog ON' : 'Toggle Fog'}
        </button>
      </div>

      {/* Effects Section */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Spawn Effects</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button onClick={() => spawnBirdFlock()} style={getButtonStyle(false)}>Spawn Birds</button>
          <button onClick={() => { for(let i=0;i<10;i++) spawnFallingLeaf(); }} style={getButtonStyle(false)}>Spawn Leaves</button>
          <button onClick={() => triggerLightningBolt()} style={getButtonStyle(false)}>Lightning!</button>
        </div>
      </div>

      {/* Difficulty Section */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Set Score (Difficulty)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
          {[0, 10, 25, 40, 60, 80].map((s) => (
            <button key={s} onClick={() => { if (gameStateRef.current) gameStateRef.current.score = s; setDebugTick(t => t + 1); }} style={getButtonStyle(currentScore >= s && currentScore < (s + 10))}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Pipe Testing */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Pipes</div>
        <button onClick={() => {
          const pipe = generatePipeWithCoins(false, 100);
          pipe.isMoving = true;
          pipe.moveSpeed = 1.5;
          pipe.moveRange = 60;
          if (gameStateRef.current) gameStateRef.current.pipes.push(pipe);
        }} style={getButtonStyle(false)}>Add Moving Pipe</button>
      </div>
    </div>,
    document.body
  );
};
