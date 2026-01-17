/**
 * Username Picker Component
 *
 * Modal for new users to set their username.
 * Features real-time validation, availability checking, and suggestions.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { IonModal, IonButton, IonInput, IonSpinner } from '@ionic/react';
import { debounce } from 'lodash';
import { useAuth } from '../../contexts/AuthContext';
import { validateUsername, generateUsernameSuggestions } from '../../utils/validation';
import { Avatar } from '../Avatar/Avatar';
import './UsernamePicker.css';

interface UsernamePickerProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const UsernamePicker: React.FC<UsernamePickerProps> = ({
  isOpen,
  onComplete
}) => {
  const { user, updateUsername } = useAuth();
  const [username, setUsername] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Debounced availability check
  const checkAvailability = useCallback(
    debounce(async (name: string) => {
      if (!name || name.length < 3) {
        setIsAvailable(null);
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      try {
        // Simulate API call - in production, this would check against the backend
        // For now, we check localStorage for existing usernames
        const existingUsers = JSON.parse(localStorage.getItem('wojak_users') || '{}');
        const isTaken = Object.values(existingUsers).some(
          (u: any) => u.username?.toLowerCase() === name.toLowerCase()
        );

        setIsAvailable(!isTaken);

        if (isTaken) {
          setSuggestions(generateUsernameSuggestions(name));
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Failed to check username availability:', error);
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, 500),
    []
  );

  // Handle username input change
  const handleUsernameChange = (value: string) => {
    const trimmedValue = value.trim();
    setUsername(trimmedValue);

    // Validate locally first
    const validation = validateUsername(trimmedValue);
    if (!validation.isValid) {
      setValidationError(validation.error || null);
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }

    setValidationError(null);
    checkAvailability(trimmedValue);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setUsername(suggestion);
    setValidationError(null);
    checkAvailability(suggestion);
  };

  // Handle save
  const handleSave = async () => {
    if (!username || validationError || !isAvailable) return;

    setIsSaving(true);
    try {
      await updateUsername(username);
      onComplete();
    } catch (error) {
      console.error('Failed to save username:', error);
      setValidationError('Failed to save username. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setValidationError(null);
      setIsAvailable(null);
      setSuggestions([]);
    }
  }, [isOpen]);

  // Get input status class
  const getInputStatusClass = () => {
    if (!username || username.length < 3) return '';
    if (validationError) return 'error';
    if (isChecking) return 'checking';
    if (isAvailable === true) return 'available';
    if (isAvailable === false) return 'taken';
    return '';
  };

  return (
    <IonModal
      isOpen={isOpen}
      backdropDismiss={false}
      className="username-picker-modal"
    >
      <div className="username-picker-content">
        {/* Header with Avatar */}
        <div className="username-picker-header">
          <div className="welcome-avatar">
            <Avatar
              type={user?.avatar.type || 'emoji'}
              value={user?.avatar.value || '🍊'}
              size="xlarge"
            />
          </div>
          <h2>Welcome to Wojak.ink!</h2>
          <p>Choose a username to get started</p>
        </div>

        {/* Username Input */}
        <div className={`username-input-container ${getInputStatusClass()}`}>
          <IonInput
            value={username}
            onIonInput={(e) => handleUsernameChange(e.detail.value || '')}
            placeholder="Enter username"
            maxlength={20}
            className="username-input"
          />
          <div className="input-status-icon">
            {isChecking && <IonSpinner name="crescent" />}
            {!isChecking && isAvailable === true && <span className="check-icon">✓</span>}
            {!isChecking && isAvailable === false && <span className="x-icon">✗</span>}
          </div>
        </div>

        {/* Validation/Status Message */}
        <div className="username-status">
          {validationError && (
            <span className="error-message">{validationError}</span>
          )}
          {!validationError && isAvailable === true && (
            <span className="success-message">Username is available!</span>
          )}
          {!validationError && isAvailable === false && (
            <span className="taken-message">Username is already taken</span>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="username-suggestions">
            <span className="suggestions-label">Try one of these:</span>
            <div className="suggestions-list">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                  type="button"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rules */}
        <div className="username-rules">
          <ul>
            <li>3-20 characters</li>
            <li>Letters, numbers, and underscores only</li>
            <li>No spaces or special characters</li>
          </ul>
        </div>

        {/* Action Button */}
        <IonButton
          expand="block"
          onClick={handleSave}
          disabled={!username || !!validationError || isAvailable !== true || isSaving}
          className="continue-button"
        >
          {isSaving ? 'Setting up...' : 'Continue'}
        </IonButton>
      </div>
    </IonModal>
  );
};

export default UsernamePicker;
