/**
 * Achievements Page
 *
 * Display all achievements with progress.
 */

import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { useLayout } from '@/hooks/useLayout';
import { useAchievements } from '@/contexts/AchievementsContext';
import { AchievementCard } from '@/components/Achievements/AchievementCard';
import { AchievementUnlockPopup } from '@/components/Achievements/AchievementUnlockPopup';
import { PageTransition } from '@/components/layout/PageTransition';
import { getAchievementsByCategory } from '@/config/achievements';
import type { AchievementCategory, Achievement } from '@/types/achievement';
import '@/components/Achievements/Achievements.css';

type Tab = 'all' | AchievementCategory;

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'gameplay', label: 'Gameplay' },
  { id: 'collection', label: 'Collection' },
  { id: 'social', label: 'Social' },
  { id: 'milestone', label: 'Milestones' },
];

export default function Achievements() {
  const { contentPadding, isDesktop } = useLayout();
  const {
    achievements,
    getProgress,
    claimAchievement,
    checkAchievements,
    completedCount,
    unclaimedCount,
  } = useAchievements();

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [unlockPopup, setUnlockPopup] = useState<Achievement | null>(null);

  // Check achievements on mount
  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  // Filter achievements by tab
  const filteredAchievements = activeTab === 'all'
    ? achievements
    : getAchievementsByCategory(activeTab);

  // Handle claim
  const handleClaim = async (achievementId: string) => {
    const success = await claimAchievement(achievementId);
    if (success) {
      // Optionally show a toast or animation
    }
  };

  // Handle popup claim
  const handlePopupClaim = async () => {
    if (unlockPopup) {
      await claimAchievement(unlockPopup.id);
      setUnlockPopup(null);
    }
  };

  return (
    <PageTransition>
      <div
        style={{
          padding: contentPadding,
          maxWidth: isDesktop ? '700px' : undefined,
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div className="achievements-header">
          <h1 className="page-title">
            <Award size={24} />
            Achievements
          </h1>
          <div className="achievements-stats">
            <span className="stat">
              {completedCount} / {achievements.length} completed
            </span>
            {unclaimedCount > 0 && (
              <span className="unclaimed-badge">
                {unclaimedCount} to claim
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="achievements-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="achievements-grid">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              progress={getProgress(achievement.id)}
              onClaim={() => handleClaim(achievement.id)}
            />
          ))}
        </div>

        {/* Unlock Popup */}
        <AchievementUnlockPopup
          achievement={unlockPopup}
          onClose={() => setUnlockPopup(null)}
          onClaim={handlePopupClaim}
        />
      </div>
    </PageTransition>
  );
}
