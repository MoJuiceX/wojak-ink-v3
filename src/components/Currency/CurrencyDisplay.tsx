/**
 * Currency Display Component
 *
 * Shows the user's current orange and gem balance.
 */

import React from 'react';
import { useCurrencySafe, useFormatCurrency } from '../../contexts/CurrencyContext';
import './Currency.css';

interface CurrencyDisplayProps {
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  showLabels = false,
  size = 'medium',
  onClick,
}) => {
  const context = useCurrencySafe();
  const formatNumber = useFormatCurrency();

  // If context not available, don't render anything
  if (!context) {
    return null;
  }

  const { currency, isLoading } = context;

  if (isLoading) {
    return (
      <div className={`currency-display currency-${size} loading`}>
        <div className="currency-skeleton" />
        <div className="currency-skeleton" />
      </div>
    );
  }

  return (
    <div
      className={`currency-display currency-${size} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="currency-item oranges">
        <span className="currency-icon">🍊</span>
        <span className="currency-value">{formatNumber(currency.oranges)}</span>
        {showLabels && <span className="currency-label">Oranges</span>}
      </div>

      <div className="currency-item gems">
        <span className="currency-icon">💎</span>
        <span className="currency-value">{formatNumber(currency.gems)}</span>
        {showLabels && <span className="currency-label">Gems</span>}
      </div>
    </div>
  );
};

export default CurrencyDisplay;
