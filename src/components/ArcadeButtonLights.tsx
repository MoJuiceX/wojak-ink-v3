/**
 * Arcade Button Lights Component (CSS Glow Approach)
 *
 * Uses CSS box-shadow for premium glow effects.
 * Positions are percentages of the 3840x2160 frame.
 */

import { useEffect } from 'react';
import './ArcadeButtonLights.css';

export type LightSequence = 'off' | 'startup' | 'idle' | 'gameStart' | 'win' | 'gameOver';

interface ArcadeButtonLightsProps {
  sequence: LightSequence;
  onSequenceComplete?: () => void;
}

// Button positions as percentages of the 3840x2160 frame
// COORDINATES: Exact pixel positions from Photoshop, converted to percentages
// Frame: 3840 x 2160 px
const BUTTON_POSITIONS = {
  // Bottom row (7 buttons) - fine-tuned position
  bottom1: { left: 29.0, top: 80.2, color: '#3b82f6' },   // blue
  bottom2: { left: 36.0, top: 80.2, color: '#f97316' },   // orange
  bottom3: { left: 43.3, top: 80.1, color: '#3b82f6' },   // blue
  bottom4: { left: 50.3, top: 80.3, color: '#ec4899' },   // pink
  bottom5: { left: 57.3, top: 80.2, color: '#3b82f6' },   // blue
  bottom6: { left: 64.3, top: 80.1, color: '#ec4899' },   // pink
  bottom7: { left: 71.5, top: 79.9, color: '#22c55e' },   // green
  // Left side (1 button) - exact from Photoshop
  left1: { left: 17.6, top: 53.2, color: '#ef4444' },     // red - adjusted
  // Right side (5 buttons) - exact from Photoshop
  right1: { left: 81.9, top: 26.0, color: '#ef4444' },    // X=3147, Y=561 - red
  right2: { left: 81.9, top: 41.2, color: '#f97316' },    // X=3146, Y=890 - orange/yellow
  right3: { left: 82.1, top: 55.3, color: '#f97316' },    // orange/yellow - adjusted
  right4: { left: 82.1, top: 69.8, color: '#3b82f6' },    // X=3153, Y=1508 - blue
  right5: { left: 81.8, top: 80.9, color: '#22c55e' },    // X=3141, Y=1748 - green
} as const;

type ButtonKey = keyof typeof BUTTON_POSITIONS;

const ALL_BUTTONS: ButtonKey[] = [
  'bottom1', 'bottom2', 'bottom3', 'bottom4', 'bottom5', 'bottom6', 'bottom7',
  'left1',
  'right1', 'right2', 'right3', 'right4', 'right5',
];

export function ArcadeButtonLights({ sequence, onSequenceComplete }: ArcadeButtonLightsProps) {
  // Handle sequence completion
  useEffect(() => {
    if (sequence === 'off' || sequence === 'idle') return;

    const durations: Record<LightSequence, number> = {
      off: 0,
      startup: 1500,
      idle: 0,
      gameStart: 800,
      win: 3000,
      gameOver: 1500,
    };

    if (onSequenceComplete) {
      const timer = setTimeout(onSequenceComplete, durations[sequence]);
      return () => clearTimeout(timer);
    }
  }, [sequence, onSequenceComplete]);

  // Don't render when off
  if (sequence === 'off') {
    return null;
  }

  return (
    <div className={`arcade-button-lights arcade-lights-${sequence}`}>
      {/* Title glow overlay */}
      <img
        src="/img/Arcade_overlays/title_glow.png"
        alt=""
        className="arcade-title-glow"
        aria-hidden="true"
        draggable={false}
      />

      {ALL_BUTTONS.map((key, index) => {
        const pos = BUTTON_POSITIONS[key];
        return (
          <div
            key={key}
            className={`arcade-glow arcade-glow-${key}`}
            style={{
              '--glow-left': `${pos.left}%`,
              '--glow-top': `${pos.top}%`,
              '--glow-color': pos.color,
              '--delay-index': index,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

export default ArcadeButtonLights;
