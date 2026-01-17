/**
 * Vote counter badge for cards
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VoteCounterProps {
  donutCount: number;
  poopCount: number;
}

export function VoteCounter({ donutCount, poopCount }: VoteCounterProps) {
  const [donutBounce, setDonutBounce] = useState(false);
  const [poopBounce, setPoopBounce] = useState(false);
  const [prevDonut, setPrevDonut] = useState(donutCount);
  const [prevPoop, setPrevPoop] = useState(poopCount);

  useEffect(() => {
    if (donutCount > prevDonut) {
      setDonutBounce(true);
      setTimeout(() => setDonutBounce(false), 400);
    }
    setPrevDonut(donutCount);
  }, [donutCount, prevDonut]);

  useEffect(() => {
    if (poopCount > prevPoop) {
      setPoopBounce(true);
      setTimeout(() => setPoopBounce(false), 400);
    }
    setPrevPoop(poopCount);
  }, [poopCount, prevPoop]);

  return (
    <div className="vote-counter">
      <motion.span
        className="vote-counter-item"
        animate={donutBounce ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        🍩 {donutCount}
      </motion.span>
      <span className="vote-counter-divider">|</span>
      <motion.span
        className="vote-counter-item"
        animate={poopBounce ? { scale: [1, 1.4, 1], rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        💩 {poopCount}
      </motion.span>
    </div>
  );
}
