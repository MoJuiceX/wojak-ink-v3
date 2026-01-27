/**
 * Achievements Lightbox Component
 *
 * Lightbox modal for viewing and claiming achievements.
 * Reuses AchievementCard and AchievementsContext.
 */

import { useState, useEffect } from 'react';
import { Award, Trophy, Star, Target, Zap } from 'lucide-react';
import { Lightbox } from '@/components/ui/Lightbox';
import { useAchievements } from '@/contexts/AchievementsContext';
import { AchievementCard } from '@/components/Achievements/AchievementCard';
import { AchievementUnlockPopup } from '@/components/Achievements/AchievementUnlockPopup';
import { getAchievementsByCategory } from '@/config/achievements';
import type { AchievementCategory, Achievement } from '@/types/achievement';
import '@/components/Achievements/Achievements.css';

type Tab = 'all' | 'claimable' | AchievementCategory;

const TABS: { id: Tab; label: string; icon?: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Award size={14} /> },
  { id: 'claimable', label: 'Claimable', icon: <Star size={14} /> },
  { id: 'gameplay', label: 'Gameplay', icon: <Target size={14} /> },
  { id: 'collection', label: 'Collection', icon: <Trophy size={14} /> },
  { id: 'social', label: 'Social', icon: <Zap size={14} /> },
];

interface AchievementsLightboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsLightbox({ isOpen, onClose }: AchievementsLightboxProps) {
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

  // Check achievements when lightbox opens
  useEffect(() => {
    if (isOpen) {
      checkAchievements();
    }
  }, [isOpen, checkAchievements]);

  // Filter achievements by tab
  const getFilteredAchievements = () => {
    if (activeTab === 'all') {
      return achievements;
    }
    if (activeTab === 'claimable') {
      return achievements.filter(a => {
        const progress = getProgress(a.id);
        return progress?.completed && !progress?.claimed;
      });
    }
    return getAchievementsByCategory(activeTab as AchievementCategory);
  };

  const filteredAchievements = getFilteredAchievements();

  // Handle claim
  const handleClaim = async (achievementId: string) => {
    await claimAchievement(achievementId);
  };

  // Handle popup claim
  const handlePopupClaim = async () => {
    if (unlockPopup) {
      await claimAchievement(unlockPopup.id);
      setUnlockPopup(null);
    }
  };

  const progressPercent = achievements.length > 0
    ? Math.round((completedCount / achievements.length) * 100)
    : 0;

  return (
    <Lightbox
      isOpen={isOpen}
      onClose={onClose}
      title="Achievements"
      size="lg"
    >
      {/* Stats Bar */}
      <div className="achievements-lightbox-stats">
        <div className="stat-progress">
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="progress-text">
            {completedCount} / {achievements.length} ({progressPercent}%)
          </span>
        </div>
        {unclaimedCount > 0 && (
          <span className="unclaimed-badge">
            {unclaimedCount} to claim
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="lightbox-tabs achievements-lightbox-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`lightbox-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'claimable' && unclaimedCount > 0 && (
              <span className="tab-badge highlight">{unclaimedCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="achievements-lightbox-grid">
        {filteredAchievements.length === 0 ? (
          <div className="lightbox-empty">
            <span className="empty-icon">
              {activeTab === 'claimable' ? '🎉' : '🏆'}
            </span>
            <p>
              {activeTab === 'claimable'
                ? 'No achievements to claim. Keep playing!'
                : 'No achievements in this category.'}
            </p>
          </div>
        ) : (
          filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              progress={getProgress(achievement.id)}
              onClaim={() => handleClaim(achievement.id)}
            />
          ))
        )}
      </div>

      {/* Unlock Popup */}
      <AchievementUnlockPopup
        achievement={unlockPopup}
        onClose={() => setUnlockPopup(null)}
        onClaim={handlePopupClaim}
      />
    </Lightbox>
  );
}

export default AchievementsLightbox;
