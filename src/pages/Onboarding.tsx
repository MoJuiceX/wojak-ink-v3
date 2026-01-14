/**
 * Onboarding Page
 *
 * First-time user profile setup.
 * Collects display name, X handle, and wallet address.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/layout/PageTransition';
import { useLayout } from '@/hooks/useLayout';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

interface FormErrors {
  displayName?: string;
  xHandle?: string;
  walletAddress?: string;
}

export default function Onboarding() {
  const { contentPadding, isDesktop } = useLayout();
  const navigate = useNavigate();
  const { user } = useUser();
  const { authenticatedFetch } = useAuthenticatedFetch();

  const [displayName, setDisplayName] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate displayName (required, 3-20 chars)
    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (displayName.length < 3 || displayName.length > 20) {
      newErrors.displayName = 'Display name must be 3-20 characters';
    }

    // Validate xHandle (optional, alphanumeric + underscore, 1-15 chars)
    const cleanHandle = xHandle.replace(/^@/, '');
    if (cleanHandle && !/^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)) {
      newErrors.xHandle = 'Handle must be 1-15 alphanumeric characters or underscores';
    }

    // Validate walletAddress (optional, xch prefix, 62 chars)
    if (walletAddress.trim()) {
      const wallet = walletAddress.trim().toLowerCase();
      if (!wallet.startsWith('xch') || wallet.length !== 62) {
        newErrors.walletAddress = 'Enter a valid Chia address (xch...)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await authenticatedFetch('/api/profile', {
        method: 'POST',
        body: JSON.stringify({
          displayName: displayName.trim(),
          xHandle: xHandle.replace(/^@/, '') || undefined,
          walletAddress: walletAddress.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save profile');
      }

      // Success - navigate to gallery
      navigate('/gallery', { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <motion.div
        className="min-h-screen flex items-center justify-center"
        style={{
          padding: contentPadding,
          background: 'var(--color-bg-primary)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="w-full"
          style={{ maxWidth: isDesktop ? '480px' : '100%' }}
        >
          <div
            className="rounded-xl p-6"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h1
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Welcome to the tribe!
              </h1>
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Set up your Wojak profile to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Display Name */}
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Display Name *
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={user?.firstName || 'Your display name'}
                  className="w-full px-3 py-2 rounded-lg text-base"
                  style={{
                    background: 'var(--color-bg-primary)',
                    border: errors.displayName
                      ? '1px solid var(--color-error, #ef4444)'
                      : '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                {errors.displayName && (
                  <p className="text-sm mt-1" style={{ color: 'var(--color-error, #ef4444)' }}>
                    {errors.displayName}
                  </p>
                )}
              </div>

              {/* X Handle */}
              <div>
                <label
                  htmlFor="xHandle"
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  X Handle (optional)
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    @
                  </span>
                  <input
                    id="xHandle"
                    type="text"
                    value={xHandle}
                    onChange={(e) => setXHandle(e.target.value.replace(/^@/, ''))}
                    placeholder="yourhandle"
                    className="w-full pl-8 pr-3 py-2 rounded-lg text-base"
                    style={{
                      background: 'var(--color-bg-primary)',
                      border: errors.xHandle
                        ? '1px solid var(--color-error, #ef4444)'
                        : '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>
                {errors.xHandle && (
                  <p className="text-sm mt-1" style={{ color: 'var(--color-error, #ef4444)' }}>
                    {errors.xHandle}
                  </p>
                )}
              </div>

              {/* Wallet Address */}
              <div>
                <label
                  htmlFor="walletAddress"
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Chia Wallet Address (optional)
                </label>
                <input
                  id="walletAddress"
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="xch1..."
                  className="w-full px-3 py-2 rounded-lg text-base font-mono text-sm"
                  style={{
                    background: 'var(--color-bg-primary)',
                    border: errors.walletAddress
                      ? '1px solid var(--color-error, #ef4444)'
                      : '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                {errors.walletAddress && (
                  <p className="text-sm mt-1" style={{ color: 'var(--color-error, #ef4444)' }}>
                    {errors.walletAddress}
                  </p>
                )}
                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Link your wallet to see your Wojaks in your profile
                </p>
              </div>

              {/* Submit Error */}
              {submitError && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{
                    background: 'var(--color-error-bg, #fef2f2)',
                    color: 'var(--color-error, #ef4444)',
                  }}
                >
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg font-medium text-base transition-opacity"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-primary-foreground, #fff)',
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Saving...' : 'Join the Tribe'}
              </button>

              {/* Skip for now */}
              <button
                type="button"
                onClick={() => navigate('/gallery', { replace: true })}
                className="w-full py-2 text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Skip for now
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </PageTransition>
  );
}
