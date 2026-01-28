/**
 * ChatHub Page
 *
 * Landing page for chat rooms showing available rooms and eligibility status.
 * Users can see which rooms they qualify for based on their verified NFT holdings.
 * Uses the same CRT frame as the chat rooms for consistent terminal aesthetic.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SignInButton } from '@clerk/clerk-react';
import { Lock } from 'lucide-react';
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
  const [isExiting, setIsExiting] = useState(false);

  // Get NFT count from profile (null = never verified)
  const nftCount = profile?.nftCount;
  const hasVerified = nftCount !== null && nftCount !== undefined;

  const handleEnterRoom = (chatType: ChatType) => {
    setIsExiting(true);
    // Delay navigation to allow fade-out animation
    setTimeout(() => {
      navigate(CHAT_ROOMS[chatType].path);
    }, 250);
  };

  // Loading state with skeleton cards
  if (!isLoaded) {
    return (
      <>
        <div className="gc-container">
          <div className="gc-content">
            <div className="gc-frame-wrapper">
              <div className="gc-frame-inner" />
              <div className="gc-chat-screen">
                <div className="gc-hub-content">
                  <div className="gc-hub-header">
                    <Link to="/" className="gc-header-back">
                      ← BACK
                    </Link>
                    <div className="gc-hub-header-text">
                      <span className="gc-hub-title">CHAT ROOMS</span>
                    </div>
                  </div>
                  <div className="gc-connecting-inline">
                    <div className="gc-spinner gc-terminal-spinner" />
                    <span>LOADING...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageSEO
        title="Chat Rooms | Wojak.ink"
        description="Join the Wojak NFT holder chat rooms"
        path="/chat"
      />
      <div className="gc-container">
        <div className="gc-content">
          <div className="gc-frame-wrapper">
            <div className="gc-frame-inner" />
            <div className="gc-chat-screen">
              <motion.div 
                className="gc-hub-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: isExiting ? 0 : 1 }}
                transition={{ duration: 0.25 }}
              >
                {/* Terminal Header with back button */}
                <div className="gc-hub-header">
                  <Link to="/" className="gc-header-back">
                    ← BACK
                  </Link>
                  <div className="gc-hub-header-text">
                    <span className="gc-hub-title">CHAT ROOMS</span>
                    <span className="gc-hub-subtitle">Select a channel to connect</span>
                  </div>
                </div>

                {/* Welcome message for signed-in users */}
                {isSignedIn && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="gc-hub-welcome"
                  >
                    <span>USER: {effectiveDisplayName}</span>
                    {hasVerified && <span className="gc-hub-nft-count">[{nftCount} NFT{nftCount !== 1 ? 's' : ''}]</span>}
                    {isAdmin && <span className="gc-hub-admin">[ADMIN]</span>}
                  </motion.div>
                )}

                {/* Room Cards - Terminal Style */}
                <div className="gc-hub-rooms">
                  {Object.entries(CHAT_ROOMS).map(([key, room], index) => {
                    const chatType = key as ChatType;
                    const isEligible = isAdmin || (hasVerified && isEligibleForRoom(nftCount!, chatType, false));
                    const neededMore = room.minNfts - (nftCount || 0);

                    return (
                      <motion.div
                        key={chatType}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`gc-hub-room ${isEligible ? 'gc-hub-room--eligible gc-hub-room--clickable' : 'gc-hub-room--locked'}`}
                        onClick={isEligible ? () => handleEnterRoom(chatType) : undefined}
                        style={isEligible ? { cursor: 'pointer' } : undefined}
                      >
                        <div className="gc-hub-room-header">
                          <span className="gc-hub-room-icon">{room.icon}</span>
                          <span className="gc-hub-room-name">{room.label}</span>
                          <span className="gc-hub-room-req">[{room.minNfts}+ NFTs]</span>
                        </div>

                        <div className="gc-hub-room-status">
                          {!isSignedIn && (
                            <SignInButton mode="modal">
                              <button className="gc-hub-room-btn gc-hub-room-btn--signin" onClick={(e) => e.stopPropagation()}>
                                [ SIGN IN ]
                              </button>
                            </SignInButton>
                          )}

                          {isSignedIn && !hasVerified && !isAdmin && (
                            <span className="gc-hub-room-locked">
                              <Lock size={14} /> LOCKED - VERIFY WALLET
                            </span>
                          )}

                          {isSignedIn && hasVerified && !isEligible && !isAdmin && (
                            <span className="gc-hub-room-progress">
                              NEED {neededMore} MORE NFT{neededMore !== 1 ? 'S' : ''}
                            </span>
                          )}

                          {isSignedIn && isEligible && (
                            <span className="gc-hub-room-hint">
                              [ CLICK TO CONNECT ]
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Help text */}
                <div className="gc-hub-footer">
                  {!isSignedIn && (
                    <span>{'>'} Sign in to access chat rooms</span>
                  )}
                  {isSignedIn && !hasVerified && (
                    <span>
                      {'>'} Verify wallet on <Link to="/account" className="gc-hub-link">Account</Link> page
                    </span>
                  )}
                  {isSignedIn && hasVerified && nftCount === 0 && (
                    <span>{'>'} Acquire NFTs to unlock channels</span>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
