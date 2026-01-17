/**
 * Guild Page
 *
 * Main guild page with overview, members, and leaderboard.
 */

import { PageTransition } from '@/components/layout/PageTransition';
import { GuildPage } from '@/components/Guild';

const Guild = () => {
  return (
    <PageTransition>
      <div className="min-h-full">
        <GuildPage />
      </div>
    </PageTransition>
  );
};

export default Guild;
