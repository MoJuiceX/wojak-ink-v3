import React from 'react';
import { usePWA } from './PWAContext';
import './pwa.css';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="offline-indicator">
      <span className="offline-icon">📡</span>
      <span className="offline-text">You're offline</span>
    </div>
  );
};
