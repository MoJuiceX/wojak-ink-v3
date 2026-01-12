/**
 * Toast Component
 *
 * Toast notification display with animations.
 */

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { toastVariants, reducedMotionVariants } from '@/config/settingsAnimations';
import type { ToastType } from '@/types/settings';

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
};

const toastColors: Record<ToastType, string> = {
  success: '#22c55e',
  error: '#ef4444',
  info: '#3b82f6',
  warning: '#f59e0b',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 md:bottom-6 md:right-6 md:left-auto md:translate-x-0"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            variants={prefersReducedMotion ? reducedMotionVariants.toast : toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span style={{ color: toastColors[toast.type] }}>
              {toastIcons[toast.type]}
            </span>
            <p
              className="flex-1 text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-md transition-colors hover:bg-[var(--color-glass-hover)]"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastContainer;
