/**
 * ChatHub Page
 *
 * Landing page for chat rooms showing available rooms and eligibility status.
 * Users can see which rooms they qualify for based on their verified NFT holdings.
 *
 * User states:
 * 1. Not signed in -> Show "Sign in" button, footer message
 * 2. Signed in, no wallet verified -> Show lock icon, footer message with Account link
 * 3. Signed in, verified with NFTs but not eligible -> Show progress (X / Y NFTs)
 * 4. Signed in, eligible -> Show "Enter Chat" with gradient border
 */

import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SignInButton } from '@clerk/clerk-react';
import { ExternalLink, Lock } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { PageSEO } from '@/components/seo';
import { CHAT_ROOMS, type ChatType, isEligibleForRoom } from '@/config/chatRooms';
import './GatedChat.css';

// MintGarden collection URL
const MINTGARDEN_URL = 'https://mintgarden.io/collections/wojak-farmers-plot-col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';

// Loading skeleton component
function RoomCardSkeleton() {
  return (
    <div className="gc-room-card gc-room-card--skeleton">
      <div className="gc-skeleton gc-skeleton--icon" />
      <div className="gc-skeleton gc-skeleton--title" />
      <div className="gc-skeleton gc-skeleton--pill" />
      <div className="gc-skeleton gc-skeleton--button" />
    </div>
  );
}

export default function ChatHub() {
  const navigate = useNavigate();
  const { isLoaded } = useAuthenticatedFetch();
  const { profile, isSignedIn, effectiveDisplayName, isAdmin } = useUserProfile();

  // Get NFT count from profile (null = never verified)
  const nftCount = profile?.nftCount;
  const hasVerified = nftCount !== null && nftCount !== undefined;

  const handleEnterRoom = (chatType: ChatType) => {
    navigate(CHAT_ROOMS[chatType].path);
  };

  // Loading state with skeleton cards
  if (!isLoaded) {
    return (
      <PageTransition>
        <div className="gc-container">
          <div className="gc-content">
            <div className="gc-header">
              <h1 className="gc-title">Chat Rooms</h1>
              <p className="gc-subtitle">Connect with fellow Wojak NFT holders</p>
            </div>
            <div className="gc-room-grid">
              <RoomCardSkeleton />
              <RoomCardSkeleton />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageSEO
        title="Chat Rooms | Wojak.ink"
        description="Join the Wojak NFT holder chat rooms"
        path="/chat"
      />
      <div className="gc-container">
        <div className="gc-content">
          <div className="gc-header">
            <h1 className="gc-title">Chat Rooms</h1>
            <p className="gc-subtitle">
              Connect with fellow Wojak NFT holders
            </p>
          </div>

          {/* Welcome message for signed-in users */}
          {isSignedIn && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="gc-welcome-bar"
            >
              <span className="gc-welcome-text">
                Welcome back, <strong>{effectiveDisplayName}</strong>
              </span>
              {hasVerified && (
                <span className="gc-nft-badge">
                  {nftCount} NFT{nftCount !== 1 ? 's' : ''}
                </span>
              )}
              {isAdmin && <span className="gc-admin-badge">Admin</span>}
            </motion.div>
          )}

          {/* Room Cards */}
          <div className="gc-room-grid">
            {Object.entries(CHAT_ROOMS).map(([key, room]) => {
              const chatType = key as ChatType;
              // Admins bypass NFT verification entirely
              const isEligible = isAdmin || (hasVerified && isEligibleForRoom(nftCount!, chatType, false));
              const neededMore = room.minNfts - (nftCount || 0);

              return (
                <motion.div
                  key={chatType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: chatType === 'whale' ? 0 : 0.1 }}
                  className={`gc-room-card ${isEligible ? 'gc-room-card--eligible' : ''}`}
                >
                  {/* Large centered icon */}
                  <div className="gc-room-icon">{room.icon}</div>
                  
                  {/* Room name */}
                  <h2 className="gc-room-title">{room.label}</h2>

                  {/* Requirement pill */}
                  <div className="gc-room-requirement">
                    <span className="gc-room-min">
                      {room.minNfts}+ NFT{room.minNfts > 1 ? 's' : ''} required
                    </span>
                  </div>

                  {/* State 1: Not signed in - show sign in button */}
                  {!isSignedIn && (
                    <div className="gc-room-action-area">
                      <SignInButton mode="modal">
                        <button className="gc-room-button gc-room-button--signin">
                          Sign In
                        </button>
                      </SignInButton>
                    </div>
                  )}

                  {/* State 2: Signed in, wallet not verified (non-admins only) - show lock */}
                  {isSignedIn && !hasVerified && !isAdmin && (
                    <div className="gc-room-action-area gc-room-action-area--locked">
                      <Lock size={20} aria-label="Locked - verify wallet to check eligibility" />
                      <span className="gc-room-locked-text">Locked</span>
                    </div>
                  )}

                  {/* State 3: Verified but not eligible (non-admins only) - show progress */}
                  {isSignedIn && hasVerified && !isEligible && !isAdmin && (
                    <div className="gc-room-action-area gc-room-action-area--progress">
                      <div 
                        className="gc-room-progress"
                        role="progressbar"
                        aria-valuenow={nftCount || 0}
                        aria-valuemin={0}
                        aria-valuemax={room.minNfts}
                        aria-label={`${nftCount || 0} of ${room.minNfts} NFTs required`}
                      >
                        <span className="gc-room-progress-text">
                          {nftCount || 0} / {room.minNfts} NFTs
                        </span>
                      </div>
                      <span className="gc-room-need">
                        Need {neededMore} more
                      </span>
                      <a
                        href={MINTGARDEN_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gc-room-link"
                      >
                        Browse Collection
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}

                  {/* State 4: Eligible (including admins) - show enter button */}
                  {isSignedIn && isEligible && (
                    <div className="gc-room-action-area">
                      <button
                        className="gc-room-button gc-room-button--enter"
                        onClick={() => handleEnterRoom(chatType)}
                      >
                        Enter Chat
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Contextual footer help text - single instance */}
          {!isSignedIn && (
            <p className="gc-help-text">
              Join the conversation — sign in to continue
            </p>
          )}

          {isSignedIn && !hasVerified && (
            <p className="gc-help-text">
              Verify your wallet on the{' '}
              <Link to="/account" className="gc-help-link">Account page</Link>
              {' '}to see your eligibility.
            </p>
          )}

          {isSignedIn && hasVerified && nftCount === 0 && (
            <p className="gc-help-text">
              Get your first Wojak Farmers Plot NFT to unlock the Holder Chat!
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
