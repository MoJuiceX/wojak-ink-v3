/**
 * Account Page
 *
 * User account management: profile info, wallet connection, messages, sign out.
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
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useLayout } from '@/hooks/useLayout';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useSageWallet } from '@/sage-wallet';
import { MessagesModal } from '@/components/settings/MessagesModal';

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
  const { signOut } = CLERK_ENABLED ? useClerk() : { signOut: () => {} };
  const {
    profile,
    clerkUser,
    isLoading,
    updateProfile,
    unreadMessages,
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
  const [nftCount, setNftCount] = useState<number | null>(null);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);

  const isWalletConnected = walletStatus === 'connected' && !!walletAddress;
  const isWalletConnecting = walletStatus === 'connecting';

  const handleSignOut = async () => {
    if (CLERK_ENABLED) {
      await signOut();
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

  // Fetch NFTs when wallet connects
  useEffect(() => {
    const fetchNfts = async () => {
      if (!isWalletConnected || !walletAddress) {
        setNftCount(null);
        return;
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

    fetchNfts();
  }, [isWalletConnected, walletAddress, getNFTs]);

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

          {/* Account Card */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--color-glass-bg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <SignedOut>
              {/* Not signed in */}
              <div className="p-8 text-center">
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-bg-tertiary)' }}
                >
                  <User size={40} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <h2
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Sign in to your account
                </h2>
                <p
                  className="text-sm mb-6"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Save your profile, compete on leaderboards, and receive notifications
                </p>
                <SignInButton mode="modal">
                  <motion.button
                    className="px-8 py-3 rounded-lg font-medium text-white"
                    style={{ background: 'var(--color-brand-primary)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign In with Google
                  </motion.button>
                </SignInButton>
              </div>
            </SignedOut>

            <SignedIn>
              {isLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-brand-primary)' }} />
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {/* User Info Header */}
                  <div className="p-6 flex items-center gap-4">
                    {clerkUser?.imageUrl ? (
                      <img
                        src={clerkUser.imageUrl}
                        alt="Profile"
                        className="w-16 h-16 rounded-full"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--gradient-accent)' }}
                      >
                        <User size={32} style={{ color: '#fff' }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-lg font-semibold truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {profile?.displayName || clerkUser?.firstName || 'User'}
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
                    <div className="px-6 pb-6 flex gap-4">
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

                  {/* Wallet Connection */}
                  <div className="p-6">
                    <label
                      className="text-xs font-medium mb-3 block"
                      style={{ color: 'var(--color-text-tertiary)' }}
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
                      <button
                        type="button"
                        onClick={handleConnectWallet}
                        disabled={!walletInitialized || isWalletConnecting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
                        style={{
                          background: 'var(--color-brand-primary)',
                          color: '#fff',
                        }}
                      >
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
                      </button>
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
          </div>
        </div>
      </motion.div>

      {/* Messages Modal */}
      <MessagesModal
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
      />
    </PageTransition>
  );
}
