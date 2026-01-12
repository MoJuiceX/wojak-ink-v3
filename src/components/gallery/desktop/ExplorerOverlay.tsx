/**
 * ExplorerOverlay Component
 *
 * Backdrop overlay for desktop explorer panel.
 * - Darkened background with blur
 * - Click to close panel
 * - Manages body scroll lock
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DESKTOP_LAYOUT } from '@/config/desktopLayout';
import { DESKTOP_ANIMATIONS } from '@/config/desktopAnimations';

interface ExplorerOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export function ExplorerOverlay({ isVisible, onClose }: ExplorerOverlayProps) {
  const { overlay: overlayConfig, zIndex } = DESKTOP_LAYOUT;
  const { overlay: overlayAnimation } = DESKTOP_ANIMATIONS;

  // Body scroll lock
  useEffect(() => {
    if (isVisible) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0"
          style={{
            zIndex: zIndex.overlay,
            background: overlayConfig.background,
            backdropFilter: `blur(${overlayConfig.blur}px)`,
            WebkitBackdropFilter: `blur(${overlayConfig.blur}px)`,
          }}
          initial={overlayAnimation.enter.initial}
          animate={overlayAnimation.enter.animate}
          exit={overlayAnimation.exit.animate}
          transition={overlayAnimation.enter.transition}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}

export default ExplorerOverlay;
