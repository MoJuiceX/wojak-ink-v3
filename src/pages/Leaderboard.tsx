/**
 * Leaderboard Page
 *
 * View game leaderboards and personal stats.
 * Features cyberpunk arena styling with premium animations.
 */

import { PageTransition } from '@/components/layout/PageTransition';
import { Leaderboard as LeaderboardComponent } from '@/components/Leaderboard';

const Leaderboard = () => {
  return (
    <PageTransition>
      <div className="min-h-full" style={{ padding: 16 }}>
        <div className="pb-24 pt-4">
          <LeaderboardComponent gameId="orange-stack" showGameSelector />
        </div>
      </div>
    </PageTransition>
  );
};

export default Leaderboard;
