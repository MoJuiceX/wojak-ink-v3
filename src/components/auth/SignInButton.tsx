/**
 * Sign In Button Component
 *
 * Shows sign in button when logged out, or user avatar/menu when logged in.
 * Handles the auth flow including Google sign-in and username picker.
 */

import React, { useState } from 'react';
import { IonButton, IonSpinner, IonPopover, IonList, IonItem, IonIcon } from '@ionic/react';
import { personCircleOutline, logOutOutline, createOutline, walletOutline } from 'ionicons/icons';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../Avatar/Avatar';
import { AvatarPickerModal } from '../AvatarPicker';
import { UsernamePicker } from '../UsernamePicker';
import './SignInButton.css';

interface SignInButtonProps {
  variant?: 'compact' | 'full';
}

export const SignInButton: React.FC<SignInButtonProps> = ({
  variant = 'compact'
}) => {
  const {
    user,
    isLoading,
    isAuthenticated,
    isNewUser,
    signInWithGoogle,
    signOut,
    connectWallet,
    disconnectWallet
  } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [_showUsernamePicker, _setShowUsernamePicker] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Google login hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Exchange access token for ID token via Google's userinfo endpoint
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        });
        const userData = await userInfo.json();
        // For demo purposes, create a mock credential from user data
        await signInWithGoogle(JSON.stringify(userData));
      } catch (error) {
        console.error('Sign in failed:', error);
      } finally {
        setIsSigningIn(false);
      }
    },
    onError: () => {
      console.error('Google login failed');
      setIsSigningIn(false);
    },
  });

  const handleSignIn = () => {
    setIsSigningIn(true);
    googleLogin();
  };

  const handleSignOut = async () => {
    setShowMenu(false);
    await signOut();
  };

  const handleWalletAction = async () => {
    setShowMenu(false);
    if (user?.walletAddress) {
      await disconnectWallet();
    } else {
      await connectWallet();
    }
  };

  const handleAvatarClick = () => {
    setShowMenu(false);
    setShowAvatarPicker(true);
  };

  const handleUsernameComplete = () => {
    _setShowUsernamePicker(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="sign-in-button-loading">
        <IonSpinner name="crescent" />
      </div>
    );
  }

  // Not authenticated - show sign in button
  if (!isAuthenticated) {
    return (
      <>
        <IonButton
          onClick={handleSignIn}
          disabled={isSigningIn}
          className={`sign-in-button ${variant}`}
          fill="solid"
        >
          {isSigningIn ? (
            <IonSpinner name="crescent" />
          ) : (
            <>
              <IonIcon slot="start" icon={personCircleOutline} />
              {variant === 'full' ? 'Sign In with Google' : 'Sign In'}
            </>
          )}
        </IonButton>

        {/* Username picker for new users */}
        <UsernamePicker
          isOpen={isNewUser}
          onComplete={handleUsernameComplete}
        />
      </>
    );
  }

  // Authenticated - show user avatar with menu
  return (
    <>
      <button
        className="user-avatar-button"
        onClick={() => setShowMenu(true)}
        id="user-menu-trigger"
        aria-label="User menu"
      >
        <Avatar
          type={user?.avatar.type || 'emoji'}
          value={user?.avatar.value || '🍊'}
          size="small"
          isNftHolder={!!user?.walletAddress && user?.avatar.type === 'nft'}
        />
        {variant === 'full' && (
          <span className="username-label">{user?.username || 'User'}</span>
        )}
      </button>

      <IonPopover
        isOpen={showMenu}
        onDidDismiss={() => setShowMenu(false)}
        trigger="user-menu-trigger"
        dismissOnSelect={true}
        className="user-menu-popover"
      >
        <IonList>
          <IonItem lines="none" className="user-menu-header">
            <Avatar
              type={user?.avatar.type || 'emoji'}
              value={user?.avatar.value || '🍊'}
              size="medium"
              isNftHolder={!!user?.walletAddress && user?.avatar.type === 'nft'}
            />
            <div className="user-info">
              <span className="user-name">{user?.username || 'User'}</span>
              {user?.walletAddress && (
                <span className="wallet-badge">Wallet Connected</span>
              )}
            </div>
          </IonItem>

          <IonItem button onClick={handleAvatarClick}>
            <IonIcon slot="start" icon={createOutline} />
            Change Avatar
          </IonItem>

          <IonItem button onClick={handleWalletAction}>
            <IonIcon slot="start" icon={walletOutline} />
            {user?.walletAddress ? 'Disconnect Wallet' : 'Connect Wallet'}
          </IonItem>

          <IonItem button onClick={handleSignOut} className="sign-out-item">
            <IonIcon slot="start" icon={logOutOutline} />
            Sign Out
          </IonItem>
        </IonList>
      </IonPopover>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
      />

      {/* Username Picker for new users */}
      <UsernamePicker
        isOpen={isNewUser && !user?.username}
        onComplete={handleUsernameComplete}
      />
    </>
  );
};

export default SignInButton;
