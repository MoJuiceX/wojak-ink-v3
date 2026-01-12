/**
 * Copy to Clipboard Hook
 *
 * Provides copy functionality with feedback.
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useHaptic } from './useHaptic';

interface CopyOptions {
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
  haptic?: boolean;
  resetDelay?: number;
}

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();
  const { success: hapticSuccess, error: hapticError } = useHaptic();

  const copy = useCallback(
    async (text: string, options: CopyOptions = {}): Promise<boolean> => {
      const {
        successMessage = 'Copied to clipboard',
        errorMessage = 'Failed to copy',
        showToast: shouldShowToast = true,
        haptic = true,
        resetDelay = 2000,
      } = options;

      try {
        await navigator.clipboard.writeText(text);

        setCopied(true);
        setError(null);

        if (haptic) hapticSuccess();

        if (shouldShowToast) {
          showToast('success', successMessage, 2000);
        }

        // Reset after delay
        setTimeout(() => setCopied(false), resetDelay);

        return true;
      } catch (err) {
        const copyError = err instanceof Error ? err : new Error('Copy failed');
        setError(copyError);

        if (haptic) hapticError();

        if (shouldShowToast) {
          showToast('error', errorMessage);
        }

        return false;
      }
    },
    [showToast, hapticSuccess, hapticError]
  );

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
  }, []);

  return { copy, copied, error, reset };
}

export default useCopyToClipboard;
