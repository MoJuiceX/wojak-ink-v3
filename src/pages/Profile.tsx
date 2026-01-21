/**
 * Public Profile Page
 *
 * Read-only view of any user's profile.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { useLayout } from '@/hooks/useLayout';
import { ProfileHeader } from '@/components/Account/ProfileHeader';
import { CurrencyStats } from '@/components/Account/CurrencyStats';
import { GameScoresGrid } from '@/components/Account/GameScoresGrid';
import { NftGallery } from '@/components/Account/NftGallery';
import { InventorySection } from '@/components/Account/InventorySection';
import { PageTransition } from '@/components/layout/PageTransition';

import '@/components/Account/Account.css';

interface PublicProfile {
  userId: string;
  displayName: string;
  avatar: { type: 'emoji' | 'nft'; value: string; source: 'default' | 'user' | 'wallet'; nftId?: string };
  xHandle?: string;
  walletAddress?: string;
  createdAt: string;
  oranges: number;
  gems: number;
  ownedNftIds: string[];
  ownedItems: any[];
  gameScores: any[];
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { contentPadding, isDesktop } = useLayout();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) return;

      try {
        const response = await fetch(`/api/profile/${userId}`);
        if (!response.ok) {
          throw new Error('Profile not found');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="profile-loading">
          <Loader2 className="spin" size={32} />
          <p>Loading profile...</p>
        </div>
      </PageTransition>
    );
  }

  if (error || !profile) {
    return (
      <PageTransition>
        <div className="profile-error">
          <h2>Profile Not Found</h2>
          <p>{error || 'This user does not exist'}</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div
        style={{
          padding: contentPadding,
          maxWidth: isDesktop ? '800px' : undefined,
          margin: '0 auto',
        }}
      >
        <div className="account-dashboard">
          <ProfileHeader
            avatar={profile.avatar}
            displayName={profile.displayName}
            xHandle={profile.xHandle}
            walletAddress={profile.walletAddress}
            createdAt={new Date(profile.createdAt)}
            isOwnProfile={false}
          />

          <CurrencyStats
            oranges={profile.oranges}
            gems={profile.gems}
            donuts={0} // Don't show voting counts on public profile
            poops={0}
          />

          <GameScoresGrid userId={profile.userId} scores={profile.gameScores} />

          <NftGallery
            ownedNftIds={profile.ownedNftIds}
            currentAvatar={profile.avatar}
            walletConnected={!!profile.walletAddress}
            isOwnProfile={false}
          />

          <InventorySection
            items={profile.ownedItems.map(item => ({ ...item, equipped: false }))}
            isOwnProfile={false}
          />
        </div>
      </div>
    </PageTransition>
  );
}
