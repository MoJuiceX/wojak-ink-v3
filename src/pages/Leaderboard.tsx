/**
 * Leaderboard Page
 *
 * View game leaderboards and personal stats.
 * Features cyberpunk arena styling with premium animations.
 */

import { PageTransition } from '@/components/layout/PageTransition';
import { Leaderboard as LeaderboardComponent } from '@/components/Leaderboard';
import { PageSEO } from '@/components/seo';

const Leaderboard = () => {
  return (
    <PageTransition>
      <PageSEO
        title="Game Leaderboards - Top Scores & Rankings"
        description="Compete for the top spot on Wojak.ink global leaderboards. View high scores across 15 arcade games, track your personal bests, and see how you rank against players worldwide."
        path="/leaderboard"
      />
      <div className="min-h-full" style={{ padding: 16 }}>
        <div className="pb-24 pt-4">
          <LeaderboardComponent gameId="orange-stack" showGameSelector />
        </div>
      </div>
    </PageTransition>
  );
};

export default Leaderboard;
