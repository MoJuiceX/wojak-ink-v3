/**
 * Final CTA Section
 *
 * End of landing page with wallet connect prompt,
 * navigation options, and social links.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FinalCTAProps {
  onNavigate: (path: string) => void;
}

const NAV_OPTIONS = [
  { label: 'Gallery', path: '/gallery' },
  { label: 'BigPulp', path: '/bigpulp' },
  { label: 'Generator', path: '/generator' },
  { label: 'Games', path: '/games' },
];

const SOCIAL_LINKS = [
  { icon: '𝕏', href: 'https://twitter.com/MoJuiceX', label: 'Twitter' },
  { icon: '💬', href: 'https://discord.gg/wojak', label: 'Discord' },
];

export const FinalCTA: React.FC<FinalCTAProps> = ({ onNavigate }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="final-cta"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        viewport={{ once: true }}
      >
        Ready to Join?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
      >
        Explore the collection, analyze with BigPulp, create your avatar, and
        compete in games.
      </motion.p>

      {/* Primary CTAs */}
      <motion.div
        className="cta-buttons"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        viewport={{ once: true }}
      >
        <motion.button
          className="cta-btn primary"
          onClick={() => onNavigate('/gallery')}
          whileHover={!prefersReducedMotion ? { scale: 1.05, y: -2 } : {}}
          whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
        >
          Enter the Grove
        </motion.button>
        <motion.button
          className="cta-btn secondary"
          onClick={() => onNavigate('/account')}
          whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
          whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
        >
          Connect Wallet
        </motion.button>
      </motion.div>

      {/* Quick nav links */}
      <motion.div
        style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          marginBottom: 32,
          flexWrap: 'wrap',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        viewport={{ once: true }}
      >
        {NAV_OPTIONS.map((option) => (
          <motion.button
            key={option.path}
            onClick={() => onNavigate(option.path)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              padding: '8px 16px',
            }}
            whileHover={
              !prefersReducedMotion ? { color: '#F97316', x: 3 } : {}
            }
          >
            {option.label} →
          </motion.button>
        ))}
      </motion.div>

      {/* Social links */}
      <motion.div
        className="social-links"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        viewport={{ once: true }}
      >
        {SOCIAL_LINKS.map((link) => (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label={link.label}
            whileHover={!prefersReducedMotion ? { scale: 1.1 } : {}}
            whileTap={!prefersReducedMotion ? { scale: 0.9 } : {}}
          >
            {link.icon}
          </motion.a>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default FinalCTA;
