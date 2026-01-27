/**
 * CurrencyStats Component (Premium Version)
 *
 * Horizontal icon+number layout with animated counters.
 * Tooltips explain what each currency is used for.
 */

import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import './Account.css';

interface AnimatedNumberProps {
  value: number;
}

function AnimatedNumber({ value }: AnimatedNumberProps) {
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (v) => Math.floor(v).toLocaleString());
  
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  
  return <motion.span className="stat-value">{display}</motion.span>;
}

interface CurrencyStatsProps {
  oranges: number;
  gems: number;
  donuts: number;
  poops: number;
  lifetimeOranges?: number;
  lifetimeGems?: number;
}

export function CurrencyStats({
  oranges,
  gems,
  donuts,
  poops,
}: CurrencyStatsProps) {
  return (
    <div className="stats-card-premium">
      <div className="stats-card__grid">
        <div className="stat-item stat-item--orange">
          <div className="stat-row">
            <span className="stat-icon">🍊</span>
            <AnimatedNumber value={oranges} />
          </div>
          <span className="stat-label">Oranges</span>
        </div>
        
        <div className="stat-item stat-item--gem">
          <div className="stat-row">
            <span className="stat-icon">💎</span>
            <AnimatedNumber value={gems} />
          </div>
          <span className="stat-label">Gems</span>
        </div>
        
        <div className="stat-item stat-item--donut">
          <div className="stat-row">
            <span className="stat-icon">🍩</span>
            <AnimatedNumber value={donuts} />
          </div>
          <span className="stat-label">Donuts</span>
        </div>
        
        <div className="stat-item stat-item--poop">
          <div className="stat-row">
            <span className="stat-icon">💩</span>
            <AnimatedNumber value={poops} />
          </div>
          <span className="stat-label">Poops</span>
        </div>
      </div>
    </div>
  );
}
