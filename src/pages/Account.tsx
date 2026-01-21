/**
 * Account Page
 *
 * User account dashboard with all profile data.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedOut, SignInButton, useClerk, useAuth } from '@clerk/clerk-react';
import { LogOut, Settings, Flame, Trophy } from 'lucide-react';

import { useUserProfile } from '@/contexts/UserProfileContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useSageWallet } from '@/sage-wallet';
import { useLayout } from '@/hooks/useLayout';

import { ProfileHeader } from '@/components/Account/ProfileHeader';
import { CurrencyStats } from '@/components/Account/CurrencyStats';
import { GameScoresGrid } from '@/components/Account/GameScoresGrid';
import { NftGallery } from '@/components/Account/NftGallery';
import { InventorySection } from '@/components/Account/InventorySection';
import { RecentActivity } from '@/components/Account/RecentActivity';
import { PageTransition } from '@/components/layout/PageTransition';

import '@/components/Account/Account.css';

// Check if Clerk is configured
const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Wojak Farmers Plot collection ID
const WOJAK_COLLECTION_ID = 'col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';

export default function Account() {
  const { contentPadding, isDesktop } = useLayout();
  const navigate = useNavigate();
  const clerk = useClerk();

  // Get user ID from Clerk for fetching scores
  const authResult = CLERK_ENABLED ? useAuth() : { userId: null };
  const userId = authResult.userId;

  const {
    profile,
    effectiveDisplayName,
    isSignedIn,
    updateAvatar,
  } = useUserProfile();

  const { currency } = useCurrency();

  const {
    status: walletStatus,
    address: walletAddress,
    getNFTs,
  } = useSageWallet();

  // Mock voting counts - replace with actual data from voting context
  const [votingCounts] = useState({ donuts: 10, poops: 10 });

  // Mock activities - replace with actual activity tracking
  const [activities] = useState<any[]>([]);

  // Mock inventory items - replace with actual CurrencyContext inventory
  const [inventoryItems] = useState<any[]>([]);

  // Track owned NFT IDs
  const [ownedNftIds, setOwnedNftIds] = useState<string[]>([]);

  // Fetch NFTs when wallet connects
  useEffect(() => {
    const fetchNfts = async () => {
      if (walletStatus !== 'connected' || !walletAddress) {
        setOwnedNftIds([]);
        return;
      }

      try {
        const nfts = await getNFTs(WOJAK_COLLECTION_ID);
        // Extract NFT IDs from the fetched NFTs
        const ids = nfts.map((nft: any) => {
          // Extract the NFT number from the name or ID
          const match = nft.name?.match(/\d+/) || nft.id?.match(/\d+/);
          return match ? match[0] : nft.id;
        }).filter(Boolean);
        setOwnedNftIds(ids);
      } catch (error) {
        console.error('[Account] Failed to fetch NFTs:', error);
      }
    };

    fetchNfts();
  }, [walletStatus, walletAddress, getNFTs]);

  const handleSignOut = async () => {
    if (CLERK_ENABLED && clerk) {
      await clerk.signOut();
      navigate('/');
    }
  };

  const handleSelectNft = async (nftId: string) => {
    const { getNftImageUrl } = await import('@/services/constants');
    await updateAvatar({
      type: 'nft',
      value: getNftImageUrl(nftId),
      source: 'wallet',
      nftId,
    });
  };

  // Not signed in state
  if (!CLERK_ENABLED || !isSignedIn) {
    return (
      <PageTransition>
        <div style={{ padding: contentPadding }}>
          <div className="account-signin-prompt">
            <h1>Account</h1>
            <p>Sign in to view your account dashboard</p>
            {CLERK_ENABLED && (
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="signin-button">Sign In with Google</button>
                </SignInButton>
              </SignedOut>
            )}
          </div>
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
          {/* Profile Header */}
          <ProfileHeader
            avatar={profile?.avatar || { type: 'emoji', value: '🎮', source: 'default' }}
            displayName={effectiveDisplayName}
            xHandle={profile?.xHandle}
            walletAddress={profile?.walletAddress}
            createdAt={new Date(profile?.updatedAt || Date.now())}
            isOwnProfile={true}
          />

          {/* Play Streak Stats */}
          {(profile?.currentStreak !== undefined || profile?.longestStreak !== undefined) && (
            <div className="streak-section">
              <h2 className="section-title">Play Streak</h2>
              <div className="streak-stats">
                <div className={`streak-card ${profile?.currentStreak ? 'streak-card-active' : ''}`}>
                  <Flame
                    size={24}
                    className="streak-icon"
                    style={{
                      color: profile?.currentStreak ? '#f97316' : 'var(--color-text-muted)',
                    }}
                  />
                  <div>
                    <div
                      className="streak-value"
                      style={{ color: profile?.currentStreak ? '#f97316' : 'var(--color-text-muted)' }}
                    >
                      {profile?.currentStreak || 0}
                    </div>
                    <div className="streak-label">Day Streak</div>
                  </div>
                </div>

                <div className="streak-card">
                  <Trophy
                    size={24}
                    className="streak-icon"
                    style={{
                      color: profile?.longestStreak ? '#ffd700' : 'var(--color-text-muted)',
                    }}
                  />
                  <div>
                    <div
                      className="streak-value"
                      style={{ color: profile?.longestStreak ? '#ffd700' : 'var(--color-text-muted)' }}
                    >
                      {profile?.longestStreak || 0}
                    </div>
                    <div className="streak-label">Best Streak</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Currency & Voting Stats */}
          <CurrencyStats
            oranges={currency?.oranges || 0}
            gems={currency?.gems || 0}
            donuts={votingCounts.donuts}
            poops={votingCounts.poops}
            lifetimeOranges={currency?.lifetimeOranges}
            lifetimeGems={currency?.lifetimeGems}
          />

          {/* Game Scores */}
          <GameScoresGrid userId={userId || ''} />

          {/* NFT Collection */}
          <NftGallery
            ownedNftIds={ownedNftIds}
            currentAvatar={profile?.avatar || { type: 'emoji', value: '🎮', source: 'default' }}
            walletConnected={walletStatus === 'connected'}
            isOwnProfile={true}
            onSelectNft={handleSelectNft}
          />

          {/* Shop Inventory */}
          <InventorySection
            items={inventoryItems}
            isOwnProfile={true}
          />

          {/* Recent Activity */}
          <RecentActivity activities={activities} />

          {/* Account Actions */}
          <div className="account-actions">
            <button
              className="action-button"
              onClick={() => navigate('/settings')}
            >
              <Settings size={18} />
              Settings
            </button>

            <button
              className="action-button action-signout"
              onClick={handleSignOut}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
