# Toast Notifications & User Feedback System

## Overview
A premium toast/notification system that provides consistent, beautiful feedback throughout the app. Every user action should have clear, satisfying feedback.

---

## 1. Toast Design System

### Base Toast Styling
```css
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  color: white;
  min-width: 300px;
  max-width: 420px;
}

/* Toast variants */
.toast.success {
  border-color: rgba(34, 197, 94, 0.4);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(34, 197, 94, 0.2);
}

.toast.error {
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(239, 68, 68, 0.2);
}

.toast.warning {
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(245, 158, 11, 0.2);
}

.toast.info {
  border-color: rgba(249, 115, 22, 0.4);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(249, 115, 22, 0.2);
}
```

### Toast Icon Styling
```css
.toast-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.toast.success .toast-icon {
  filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6));
}

.toast.error .toast-icon {
  filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.6));
}

.toast.warning .toast-icon {
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6));
}

.toast.info .toast-icon {
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.6));
}
```

### Toast Content
```css
.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
}

.toast-message {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

.toast-action {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: var(--color-primary-500);
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.toast-action:hover {
  background: rgba(255, 255, 255, 0.15);
}

.toast-close {
  padding: 4px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
```

---

## 2. Toast Component

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useContext, useState, useCallback } from 'react';

// Types
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  icon?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Context
const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
} | null>(null);

// Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto remove
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');

  return {
    toast: context.addToast,
    success: (title: string, message?: string) =>
      context.addToast({ type: 'success', title, message, icon: '✅' }),
    error: (title: string, message?: string) =>
      context.addToast({ type: 'error', title, message, icon: '❌' }),
    warning: (title: string, message?: string) =>
      context.addToast({ type: 'warning', title, message, icon: '⚠️' }),
    info: (title: string, message?: string) =>
      context.addToast({ type: 'info', title, message, icon: '🍊' }),
  };
};

// Container
const ToastContainer: React.FC<{
  toasts: Toast[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => (
  <div className="toast-container">
    <AnimatePresence>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </AnimatePresence>
  </div>
);

// Individual Toast
const ToastItem: React.FC<{
  toast: Toast;
  onClose: () => void;
}> = ({ toast, onClose }) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: '🍊',
  };

  return (
    <motion.div
      className={`toast ${toast.type}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      layout
    >
      <span className="toast-icon">{toast.icon || icons[toast.type]}</span>

      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        {toast.message && <div className="toast-message">{toast.message}</div>}
      </div>

      {toast.action && (
        <button className="toast-action" onClick={toast.action.onClick}>
          {toast.action.label}
        </button>
      )}

      <button className="toast-close" onClick={onClose}>
        ✕
      </button>
    </motion.div>
  );
};
```

### Toast Container Positioning
```css
.toast-container {
  position: fixed;
  bottom: 100px; /* Above mobile nav */
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: var(--z-toast);
  pointer-events: none;
}

.toast-container .toast {
  pointer-events: auto;
}

/* Mobile: Full width at bottom */
@media (max-width: 480px) {
  .toast-container {
    left: 16px;
    right: 16px;
    bottom: calc(80px + env(safe-area-inset-bottom));
  }

  .toast {
    min-width: auto;
    max-width: none;
  }
}
```

---

## 3. Contextual Toast Presets

### Game Toasts
```tsx
// After game ends
toast.success('Game Over!', `You scored ${score} points`);

// New high score
toast({
  type: 'success',
  title: '🏆 New High Score!',
  message: `${score} points - You're on fire!`,
  icon: '🔥',
  duration: 7000,
});

// Leaderboard position
toast.info('Leaderboard Updated', `You're now ranked #${rank}`);
```

### Shop Toasts
```tsx
// Purchase success
toast({
  type: 'success',
  title: 'Purchase Complete!',
  message: `${item.name} has been added to your inventory`,
  icon: item.icon,
});

// Not enough currency
toast({
  type: 'warning',
  title: 'Not Enough Currency',
  message: `You need ${required - current} more ${currency}`,
  action: {
    label: 'Get More',
    onClick: () => navigate('/games'),
  },
});
```

### Wallet Toasts
```tsx
// Connected
toast({
  type: 'success',
  title: 'Wallet Connected',
  message: `Connected to ${truncateAddress(address)}`,
  icon: '💼',
});

// Disconnected
toast.info('Wallet Disconnected', 'Your wallet has been disconnected');

// Transaction pending
toast({
  type: 'info',
  title: 'Transaction Pending',
  message: 'Waiting for confirmation...',
  icon: '⏳',
  duration: 0, // Don't auto-dismiss
});
```

### Avatar Toasts
```tsx
// Avatar updated
toast({
  type: 'success',
  title: 'Avatar Updated!',
  message: `Now using Wojak #${nftId}`,
  icon: '👤',
});

// Avatar requirement
toast({
  type: 'warning',
  title: 'NFT Required',
  message: 'Connect wallet to use NFT as avatar',
  action: {
    label: 'Connect',
    onClick: () => openWalletModal(),
  },
});
```

### Error Toasts
```tsx
// Network error
toast.error('Connection Failed', 'Please check your internet connection');

// API error
toast.error('Something went wrong', 'Please try again later');

// Rate limited
toast({
  type: 'warning',
  title: 'Slow Down',
  message: 'Too many requests. Please wait a moment.',
  icon: '🐢',
});
```

---

## 4. Progress Toast (For Long Operations)

```tsx
interface ProgressToast extends Toast {
  progress: number;
}

const ProgressToastItem: React.FC<{ toast: ProgressToast }> = ({ toast }) => (
  <motion.div className="toast toast-progress">
    <span className="toast-icon">⏳</span>

    <div className="toast-content">
      <div className="toast-title">{toast.title}</div>
      {toast.message && <div className="toast-message">{toast.message}</div>}

      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${toast.progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  </motion.div>
);
```

```css
.toast-progress .progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.toast-progress .progress-fill {
  height: 100%;
  background: var(--gradient-orange);
  border-radius: 2px;
}
```

---

## 5. Confirmation Modal

For destructive actions:

```tsx
const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className={`confirm-modal ${variant}`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          <h3>{title}</h3>
          <p>{message}</p>

          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>
              {cancelText}
            </button>
            <button
              className={`btn-primary ${variant === 'danger' ? 'btn-danger' : ''}`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
```

```css
.confirm-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-secondary);
  border-radius: var(--radius-2xl);
  padding: 24px;
  max-width: 400px;
  width: 90%;
  z-index: var(--z-modal);
  border: 1px solid var(--border-default);
}

.confirm-modal h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.confirm-modal p {
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-danger {
  background: linear-gradient(135deg, #EF4444, #DC2626) !important;
}
```

---

## 6. Inline Feedback Components

### Success Checkmark Animation
```tsx
const SuccessCheck = () => (
  <motion.div className="success-check">
    <motion.svg
      viewBox="0 0 24 24"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1 },
        }}
        transition={{ duration: 0.3 }}
      />
      <motion.path
        d="M6 12l4 4 8-8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1 },
        }}
        transition={{ duration: 0.3, delay: 0.2 }}
      />
    </motion.svg>
  </motion.div>
);
```

```css
.success-check {
  width: 48px;
  height: 48px;
  color: var(--color-success-500);
  filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.5));
}
```

### Copy to Clipboard Feedback
```tsx
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      className="copy-btn"
      onClick={handleCopy}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            ✓
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            📋
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
```

---

## 7. Sound Effects (Optional)

```tsx
// Sound effect hook
const useSoundEffect = () => {
  const playSound = useCallback((type: 'success' | 'error' | 'click') => {
    const sounds = {
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      click: '/sounds/click.mp3',
    };

    const audio = new Audio(sounds[type]);
    audio.volume = 0.3; // Respect user's audio settings
    audio.play().catch(() => {}); // Ignore if autoplay blocked
  }, []);

  return playSound;
};

// Usage with toast
const { toast, success } = useToast();
const playSound = useSoundEffect();

const handlePurchase = async () => {
  try {
    await purchase();
    playSound('success');
    success('Purchase Complete!');
  } catch {
    playSound('error');
    toast.error('Purchase Failed');
  }
};
```

---

## Implementation Checklist

- [ ] Create Toast context and provider
- [ ] Create ToastItem component with animations
- [ ] Create ToastContainer with proper positioning
- [ ] Implement useToast hook with preset methods
- [ ] Style all toast variants (success, error, warning, info)
- [ ] Add progress toast variant
- [ ] Create ConfirmModal component
- [ ] Create SuccessCheck animation
- [ ] Create CopyButton with feedback
- [ ] Add mobile-specific toast positioning
- [ ] (Optional) Add sound effects

---

## Files to Create

1. `src/contexts/ToastContext.tsx` - Provider and context
2. `src/components/ui/Toast.tsx` - Toast components
3. `src/components/ui/ConfirmModal.tsx` - Confirmation dialog
4. `src/components/ui/CopyButton.tsx` - Copy with feedback
5. `src/hooks/useToast.ts` - Toast hook
6. `src/hooks/useSoundEffect.ts` - Sound effects (optional)
7. `src/styles/toast.css` - Toast styles

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/15-toast-notifications-feedback.md and implement the toast notification system. Create a ToastProvider context, ToastItem component with spring animations, and useToast hook with success/error/warning/info presets. Style toasts with colored glows matching their type, add a ConfirmModal for destructive actions, and create a CopyButton with animated feedback. Position toasts above mobile nav.
```
