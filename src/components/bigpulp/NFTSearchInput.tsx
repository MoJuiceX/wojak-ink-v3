/**
 * NFTSearchInput Component
 *
 * NFT ID search with auto-execute at 4 digits.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, Hash, Loader2 } from 'lucide-react';
import {
  searchInputVariants,
  diceRollVariants,
} from '@/config/bigpulpAnimations';

interface NFTSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (id: string) => void;
  onSurprise: () => void;
  isLoading: boolean;
  error?: string;
}

export function NFTSearchInput({
  value,
  onChange,
  onSearch,
  onSurprise,
  isLoading,
  error,
}: NFTSearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Auto-search when 4 digits entered
  useEffect(() => {
    if (value.length === 4 && !hasAutoSearched && !isLoading) {
      setHasAutoSearched(true);
      onSearch(value);
      inputRef.current?.blur();
    }
  }, [value, hasAutoSearched, isLoading, onSearch]);

  // Reset auto-search flag when value changes
  useEffect(() => {
    if (value.length < 4) {
      setHasAutoSearched(false);
    }
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.replace(/\D/g, '').slice(0, 4);
      onChange(newValue);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && value.length > 0) {
        const paddedValue = value.padStart(4, '0');
        onChange(paddedValue);
        onSearch(paddedValue);
        inputRef.current?.blur();
      }
    },
    [value, onChange, onSearch]
  );

  const handleSurprise = useCallback(() => {
    if (!isLoading) {
      setIsRolling(true);
      onSurprise();
      // Reset rolling state after animation
      setTimeout(() => setIsRolling(false), 600);
    }
  }, [isLoading, onSurprise]);

  const variants = prefersReducedMotion ? undefined : searchInputVariants;

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        {/* Search input */}
        <motion.div
          className="flex-1 relative"
          variants={variants}
          animate={error ? 'error' : isFocused ? 'focused' : 'idle'}
        >
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 transition-colors"
            style={{
              background: 'var(--color-glass-bg)',
              border: `2px solid ${error ? 'var(--color-error, #ef4444)' : isFocused ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
            }}
          >
            <Search
              size={20}
              style={{
                color: isFocused
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-text-muted)',
              }}
            />
            <Hash
              size={18}
              style={{
                color: isFocused
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-text-muted)',
                marginLeft: '-4px',
              }}
            />
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0420"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
              aria-label="Search NFT by ID number"
              aria-describedby={error ? 'search-error' : undefined}
              className="flex-1 bg-transparent outline-none text-lg font-mono placeholder:opacity-40"
              style={{ color: 'var(--color-text-primary)', marginLeft: '-4px' }}
            />
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2
                    size={20}
                    className="animate-spin"
                    style={{ color: 'var(--color-brand-primary)' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Random dice button - blue like Generator */}
        <button
          className="w-12 h-12 flex items-center justify-center rounded-xl transition-colors"
          style={{
            background: '#3B82F6',
            border: '1px solid #3B82F6',
          }}
          onClick={handleSurprise}
          disabled={isLoading}
          aria-label="Get random NFT"
        >
          <motion.span
            className="text-xl block"
            variants={prefersReducedMotion ? undefined : diceRollVariants}
            animate={isRolling || isLoading ? 'rolling' : 'idle'}
          >
            🎲
          </motion.span>
        </button>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id="search-error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm px-1"
            style={{ color: 'var(--color-error, #ef4444)' }}
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Tagline */}
      <p
        className="text-xs px-1 font-medium"
        style={{ color: 'var(--color-text-muted)' }}
      >
        AI-Powered NFT Analysis And Market Insights
      </p>
    </div>
  );
}

export default NFTSearchInput;
