/**
 * MobileHUD Component
 *
 * Compact horizontal stats bar for mobile game displays.
 * Shows game stats in a floating pill-shaped HUD.
 */

import './MobileHUD.css';

export interface HUDStat {
  label: string;
  value: string | number;
  color?: string;       // Optional accent color
  warning?: boolean;    // Pulse animation for warnings
  icon?: string;        // Optional emoji icon
}

interface MobileHUDProps {
  stats: HUDStat[];
  position?: 'top' | 'bottom';
  className?: string;
  accentColor?: string;
}

export function MobileHUD({
  stats,
  position = 'top',
  className = '',
  accentColor = '#ff6b00',
}: MobileHUDProps) {
  if (stats.length === 0) return null;

  return (
    <div
      className={`mobile-hud mobile-hud--${position} ${className}`}
      style={{ '--hud-accent': accentColor } as React.CSSProperties}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`mobile-hud__stat ${stat.warning ? 'mobile-hud__stat--warning' : ''}`}
          style={stat.color ? { '--stat-color': stat.color } as React.CSSProperties : undefined}
        >
          {stat.icon && <span className="mobile-hud__icon">{stat.icon}</span>}
          <div className="mobile-hud__text">
            <span className="mobile-hud__label">{stat.label}</span>
            <span className="mobile-hud__value">{stat.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MobileHUD;
