/**
 * Account Page
 *
 * User account management: profile info, wallet connection, messages, sign out.
 * Premium glassmorphism design with animated avatar ring.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useClerk, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import {
  User,
  AtSign,
  Wallet,
  LogOut,
  Edit3,
  Check,
  X,
  Loader2,
  ChevronRight,
  Bell,
  Flame,
  Trophy,
  Pencil,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useLayout } from '@/hooks/useLayout';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useSageWallet } from '@/sage-wallet';
import { MessagesModal } from '@/components/settings/MessagesModal';
import { Avatar } from '@/components/Avatar/Avatar';
import { AvatarPickerModal } from '@/components/AvatarPicker/AvatarPickerModal';

// Check if Clerk is configured
const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Wojak Farmers Plot collection ID
const WOJAK_COLLECTION_ID = 'col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';

interface EditableFieldProps {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  placeholder: string;
  onSave: (value: string) => Promise<boolean>;
  validation?: (value: string) => string | null;
}

function EditableField({ label, value, icon, placeholder, onSave, validation }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  const handleSave = async () => {
    if (validation) {
      const validationError = validation(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    const success = await onSave(editValue);

    setIsSaving(false);
    if (success) {
      setIsEditing(false);
    } else {
      setError('Failed to save');
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="space-y-1">
      <label
        className="text-xs font-medium"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {label}
      </label>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {icon}
            </span>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-3 py-2 rounded-lg text-sm"
              style={{
                background: 'var(--color-bg-primary)',
                border: error ? '1px solid #ef4444' : '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              autoFocus
            />
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-2 rounded-lg"
            style={{
              background: 'var(--color-brand-primary)',
              color: '#fff',
            }}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          </button>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
          style={{
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <span style={{ color: 'var(--color-text-tertiary)' }}>{icon}</span>
          <span
            className="flex-1 text-sm"
            style={{ color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
          >
            {value || placeholder}
          </span>
          <Edit3 size={14} style={{ color: 'var(--color-text-tertiary)' }} />
        </button>
      )}
      {error && (
        <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
      )}
    </div>
  );
}

export default function Account() {
  const { contentPadding, isDesktop } = useLayout();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  // Always call the hook unconditionally
  const clerkResult = useClerk();
  const clerk = CLERK_ENABLED ? clerkResult : { signOut: async () => {} };
  const {
    profile,
    clerkUser,
    isLoading: _isLoading,
    updateProfile,
    unreadMessages,
    effectiveDisplayName,
  } = useUserProfile();

  // Use the new Sage Wallet hook
  const {
    status: walletStatus,
    address: walletAddress,
    isInitialized: walletInitialized,
    connect: connectWallet,
    disconnect: disconnectWallet,
    getNFTs,
  } = useSageWallet();

  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [nftCount, setNftCount] = useState<number | null>(null);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);

  const isWalletConnected = walletStatus === 'connected' && !!walletAddress;
  const isWalletConnecting = walletStatus === 'connecting';

  const handleSignOut = async () => {
    if (CLERK_ENABLED && clerk) {
      await clerk.signOut();
      navigate('/gallery');
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('[Account] Wallet connect error:', error);
    }
  };

  // Fetch NFTs and save wallet address when wallet connects
  useEffect(() => {
    const onWalletConnected = async () => {
      if (!isWalletConnected || !walletAddress) {
        setNftCount(null);
        return;
      }

      // Save wallet address to profile (required for NFT avatar validation)
      if (profile?.walletAddress !== walletAddress) {
        console.log('[Account] Saving wallet address to profile:', walletAddress);
        await updateProfile({ walletAddress });
      }

      setIsLoadingNfts(true);
      try {
        const nfts = await getNFTs(WOJAK_COLLECTION_ID);
        setNftCount(nfts.length);
        console.log('[Account] Found', nfts.length, 'Wojak Farmer NFTs');
      } catch (error) {
        console.error('[Account] NFT fetch error:', error);
        setNftCount(0);
      } finally {
        setIsLoadingNfts(false);
      }
    };

    onWalletConnected();
  }, [isWalletConnected, walletAddress, getNFTs, profile?.walletAddress, updateProfile]);

  return (
    <PageTransition>
      <motion.div
        className="min-h-full"
        style={{ padding: contentPadding }}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="pb-24"
          style={{ maxWidth: isDesktop ? '600px' : undefined, margin: '0 auto' }}
        >
          {/* Page Header */}
          <div className="flex items-center gap-3 mb-6">
            <User size={24} style={{ color: 'var(--color-brand-primary)' }} />
            <h1
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Account
            </h1>
          </div>

          {/* Account Card - Premium Glassmorphism */}
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
            }}
          >
            {/* Decorative glow orb */}
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 200,
                height: 200,
                background: 'radial-gradient(circle, rgba(249, 115, 22, 0.3), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            {/* Auth not configured fallback */}
            {!CLERK_ENABLED && (
              <div className="p-8 text-center relative">
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center relative"
                  style={{
                    background: 'rgba(249, 115, 22, 0.05)',
                    border: '1px dashed rgba(249, 115, 22, 0.3)',
                  }}
                  animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <User size={48} style={{ color: 'rgba(249, 115, 22, 0.6)' }} />
                </motion.div>
                <h2
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Authentication Not Configured
                </h2>
                <p
                  className="text-sm max-w-xs mx-auto"
                  style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}
                >
                  Sign-in features require Clerk authentication to be configured.
                  Add VITE_CLERK_PUBLISHABLE_KEY to your environment variables.
                </p>
              </div>
            )}
            {CLERK_ENABLED && (
            <SignedOut>
              {/* Not signed in - Premium empty state */}
              <div className="p-8 text-center relative">
                {/* Floating user icon */}
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center relative"
                  style={{
                    background: 'rgba(249, 115, 22, 0.05)',
                    border: '1px dashed rgba(249, 115, 22, 0.3)',
                  }}
                  animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <User size={48} style={{ color: 'rgba(249, 115, 22, 0.6)' }} />
                </motion.div>
                <h2
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Sign in to your account
                </h2>
                <p
                  className="text-sm mb-8 max-w-xs mx-auto"
                  style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}
                >
                  Save your profile, compete on leaderboards, and receive notifications
                </p>
                <SignInButton mode="modal">
                  <motion.button
                    className="px-8 py-4 rounded-xl font-semibold text-white relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #EA580C)',
                      boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3)',
                    }}
                    whileHover={{ scale: 1.02, boxShadow: '0 6px 30px rgba(249, 115, 22, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Shine effect */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      }}
                      animate={{ left: ['−100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                    Sign In with Google
                  </motion.button>
                </SignInButton>
              </div>
            </SignedOut>
            )}
            {CLERK_ENABLED && (
            <SignedIn>
              {/* Always show content - don't block on profile loading */}
              {(
                <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {/* User Info Header with Clickable Avatar */}
                  <div className="p-5 flex items-center gap-4">
                    {/* Clickable Avatar with edit indicator */}
                    <button
                      onClick={() => setShowAvatarPicker(true)}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        setShowAvatarPicker(true);
                      }}
                      className="relative group cursor-pointer flex-shrink-0"
                      style={{ width: 56, height: 56 }}
                      aria-label="Change avatar"
                    >
                      {/* Avatar */}
                      <Avatar
                        avatar={profile?.avatar}
                        size="medium"
                        isNftHolder={profile?.avatar?.type === 'nft'}
                        showBadge={false}
                      />
                      {/* Small edit badge */}
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: '#F97316',
                          border: '2px solid var(--color-bg-secondary)',
                        }}
                      >
                        <Pencil size={10} style={{ color: '#fff' }} />
                      </div>
                    </button>
                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-lg font-bold truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {effectiveDisplayName}
                      </p>
                      <p
                        className="text-sm truncate"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {clerkUser?.email}
                      </p>
                    </div>
                  </div>

                  {/* Play Streak Stats */}
                  {(profile?.currentStreak || profile?.longestStreak) ? (
                    <div className="px-6 py-4 flex gap-4">
                      {/* Current Streak */}
                      <div
                        className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg"
                        style={{
                          background: 'var(--color-bg-tertiary)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <Flame
                          size={24}
                          style={{
                            color: profile.currentStreak > 0 ? '#f97316' : 'var(--color-text-muted)',
                          }}
                        />
                        <div>
                          <p
                            className="text-xl font-bold"
                            style={{ color: profile.currentStreak > 0 ? '#f97316' : 'var(--color-text-muted)' }}
                          >
                            {profile.currentStreak || 0}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--color-text-tertiary)' }}
                          >
                            Day Streak
                          </p>
                        </div>
                      </div>

                      {/* Longest Streak */}
                      <div
                        className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg"
                        style={{
                          background: 'var(--color-bg-tertiary)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <Trophy
                          size={24}
                          style={{
                            color: profile.longestStreak > 0 ? '#ffd700' : 'var(--color-text-muted)',
                          }}
                        />
                        <div>
                          <p
                            className="text-xl font-bold"
                            style={{ color: profile.longestStreak > 0 ? '#ffd700' : 'var(--color-text-muted)' }}
                          >
                            {profile.longestStreak || 0}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--color-text-tertiary)' }}
                          >
                            Best Streak
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Profile Fields */}
                  <div className="p-6 space-y-4">
                    <EditableField
                      label="Display Name"
                      value={profile?.displayName || null}
                      icon={<User size={16} />}
                      placeholder="Enter display name"
                      onSave={async (value) => updateProfile({ displayName: value })}
                      validation={(value) => {
                        if (!value.trim()) return 'Display name is required';
                        if (value.length < 3 || value.length > 20) return 'Must be 3-20 characters';
                        return null;
                      }}
                    />

                    <EditableField
                      label="X Handle"
                      value={profile?.xHandle ? `@${profile.xHandle}` : null}
                      icon={<AtSign size={16} />}
                      placeholder="@yourhandle"
                      onSave={async (value) => {
                        const clean = value.replace(/^@/, '');
                        return updateProfile({ xHandle: clean || null });
                      }}
                      validation={(value) => {
                        const clean = value.replace(/^@/, '');
                        if (clean && !/^[a-zA-Z0-9_]{1,15}$/.test(clean)) {
                          return 'Must be 1-15 alphanumeric characters';
                        }
                        return null;
                      }}
                    />
                  </div>

                  {/* Wallet Connection - Premium Section */}
                  <div className="p-6">
                    <label
                      className="text-xs font-medium uppercase tracking-wider mb-3 block"
                      style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    >
                      Sage Wallet
                    </label>
                    {isWalletConnected ? (
                      <div className="space-y-3">
                        <div
                          className="flex items-center gap-3 px-4 py-3 rounded-lg"
                          style={{
                            background: 'var(--color-bg-tertiary)',
                            border: '1px solid #22c55e',
                          }}
                        >
                          <Wallet size={20} style={{ color: '#22c55e' }} />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              Connected
                            </p>
                            <p
                              className="text-xs font-mono truncate"
                              style={{ color: 'var(--color-text-tertiary)' }}
                            >
                              {walletAddress.slice(0, 12)}...{walletAddress.slice(-8)}
                            </p>
                          </div>
                          <Check size={18} style={{ color: '#22c55e' }} />
                        </div>

                        {/* NFT Count */}
                        <div
                          className="px-4 py-2 rounded-lg text-sm"
                          style={{
                            background: 'var(--color-bg-primary)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          {isLoadingNfts ? (
                            <span className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                              <Loader2 size={14} className="animate-spin" />
                              Checking NFTs...
                            </span>
                          ) : nftCount !== null && nftCount > 0 ? (
                            <span style={{ color: '#22c55e' }}>
                              {nftCount} Wojak Farmer NFT{nftCount !== 1 ? 's' : ''} found
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-text-tertiary)' }}>
                              No Wojak Farmer NFTs in this wallet
                            </span>
                          )}
                        </div>

                        <button
                          onClick={disconnectWallet}
                          className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          style={{
                            background: 'transparent',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          Disconnect Wallet
                        </button>
                      </div>
                    ) : (
                      <div
                        className="rounded-xl p-6 text-center"
                        style={{
                          background: 'rgba(249, 115, 22, 0.05)',
                          border: '1px dashed rgba(249, 115, 22, 0.3)',
                        }}
                      >
                        {/* Floating wallet icon */}
                        <motion.div
                          className="text-5xl mb-4"
                          animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          💼
                        </motion.div>
                        <p
                          className="text-sm mb-4"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          Connect your wallet to verify NFT ownership
                        </p>
                        <motion.button
                          type="button"
                          onClick={handleConnectWallet}
                          disabled={!walletInitialized || isWalletConnecting}
                          className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-sm font-semibold relative overflow-hidden disabled:opacity-50"
                          style={{
                            background: 'linear-gradient(135deg, #F97316, #EA580C)',
                            color: '#fff',
                            boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3)',
                          }}
                          whileHover={!isWalletConnecting ? { scale: 1.02 } : {}}
                          whileTap={!isWalletConnecting ? { scale: 0.98 } : {}}
                        >
                          {/* Shine effect */}
                          {!isWalletConnecting && (
                            <motion.div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                              }}
                              animate={{ left: ['-100%', '100%'] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            />
                          )}
                          {isWalletConnecting ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Wallet size={18} />
                              Connect Sage Wallet
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <button
                    onClick={() => setShowMessagesModal(true)}
                    className="w-full p-6 flex items-center gap-4 text-left transition-colors hover:bg-black/5"
                  >
                    <div className="relative">
                      <Bell size={20} style={{ color: 'var(--color-text-secondary)' }} />
                      {unreadMessages > 0 && (
                        <span
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                          style={{ background: '#ef4444', color: '#fff' }}
                        >
                          {unreadMessages > 9 ? '9+' : unreadMessages}
                        </span>
                      )}
                    </div>
                    <span
                      className="flex-1 text-sm font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Messages
                    </span>
                    <ChevronRight size={18} style={{ color: 'var(--color-text-tertiary)' }} />
                  </button>

                  {/* Sign Out */}
                  <div className="p-6">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        background: 'transparent',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </SignedIn>
            )}
          </div>
        </div>
      </motion.div>

      {/* Messages Modal */}
      <MessagesModal
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
      />
      <AvatarPickerModal
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
      />
    </PageTransition>
  );
}
