/**
 * WalletButton Component
 *
 * Displays wallet connection state with connect/disconnect functionality.
 * Shows truncated address when connected, "Connect Wallet" when disconnected.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ChevronDown, LogOut, Copy, Check, ExternalLink } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface WalletButtonProps {
  className?: string;
  size?: 'sm' | 'md';
}

// Placeholder wallet state - will be replaced with actual wallet integration
interface WalletState {
  connected: boolean;
  address: string | null;
}

const sizeStyles = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
} as const;

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletButton({ className = '', size = 'md' }: WalletButtonProps) {
  // Placeholder state - replace with actual wallet context
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { copy, copied } = useCopyToClipboard();

  const handleDisconnect = () => {
    setWallet({ connected: false, address: null });
    setIsDropdownOpen(false);
  };

  const handleCopyAddress = () => {
    if (wallet.address) {
      copy(wallet.address, { successMessage: 'Address copied!' });
    }
  };

  if (!wallet.connected) {
    return (
      <motion.div
        className={`
          relative flex items-center justify-center rounded-lg font-medium
          ${sizeStyles[size]}
          ${className}
        `}
        style={{
          background: 'rgba(30, 30, 40, 0.6)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
          cursor: 'not-allowed',
          opacity: 0.7,
        }}
        title="Wallet connection coming soon"
      >
        <Wallet size={size === 'sm' ? 16 : 18} style={{ opacity: 0.6 }} />
        <span style={{ color: '#666' }}>Connect</span>

        {/* Pulse animation glow effect */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            border: '1px solid var(--color-brand-primary)',
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.3, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        className={`
          flex items-center justify-center rounded-lg font-medium
          transition-colors duration-200
          ${sizeStyles[size]}
        `}
        style={{
          background: 'var(--color-glass-bg)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
        whileHover={{
          borderColor: 'var(--color-brand-primary)',
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {/* Avatar placeholder */}
        <div
          className="w-5 h-5 rounded-full"
          style={{
            background: 'var(--gradient-primary)',
          }}
        />
        <span className="font-mono">
          {wallet.address && truncateAddress(wallet.address)}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />

          <motion.div
            className="absolute right-0 top-full mt-2 w-48 rounded-lg overflow-hidden z-20"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
              style={{ color: copied ? '#22c55e' : 'var(--color-text-secondary)' }}
              onClick={handleCopyAddress}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-glass-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Address'}</span>
            </button>

            <a
              href={`https://spacescan.io/address/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              onClick={() => setIsDropdownOpen(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-glass-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ExternalLink size={16} />
              <span>View on Explorer</span>
            </a>

            <div
              className="h-px mx-3"
              style={{ background: 'var(--color-border)' }}
            />

            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
              style={{ color: 'var(--color-error)' }}
              onClick={handleDisconnect}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-glass-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={16} />
              <span>Disconnect</span>
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}

export default WalletButton;
