/**
 * Skip Link
 *
 * Accessibility component that allows keyboard users to skip
 * directly to main content, bypassing navigation.
 */

import React from 'react';
import './SkipLink.css';

interface SkipLinkProps {
  /** Target element ID (default: 'main-content') */
  targetId?: string;
  /** Link text (default: 'Skip to main content') */
  children?: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  children = 'Skip to main content',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

export default SkipLink;
