/**
 * UserDisplayName Component
 *
 * Renders a username with optional cosmetics (emoji ring, name effect, title).
 * Used throughout the site for consistent display of user identities.
 *
 * For leaderboards: Pass pre-fetched cosmetics data to avoid individual API calls.
 * For profiles/single users: Use with useUserDisplay hook.
 */

import { EmojiRing } from '@/components/Shop/EmojiRing';
import type { EmojiRingPositions } from '@/components/Shop/EmojiRing';

export interface UserCosmetics {
  emojiRing?: EmojiRingPositions | null;
  nameEffectClass?: string | null;
  title?: string | null;
  frameClass?: string | null;
}

interface UserDisplayNameProps {
  username: string;
  userId?: string;
  cosmetics?: UserCosmetics | null;
  size?: 'compact' | 'normal' | 'large';
  showTitle?: boolean;
  className?: string;
}

/**
 * Displays a username with optional cosmetics.
 *
 * @example
 * // Simple usage (no cosmetics)
 * <UserDisplayName username="JohnDoe" />
 *
 * @example
 * // With cosmetics from API
 * <UserDisplayName
 *   username="JohnDoe"
 *   cosmetics={{
 *     emojiRing: { left_1: '🍊', right_1: '🎮' },
 *     nameEffectClass: 'name-fire-text',
 *     title: 'Champion'
 *   }}
 * />
 */
export function UserDisplayName({
  username,
  cosmetics,
  size = 'normal',
  showTitle = true,
  className = '',
}: UserDisplayNameProps) {
  // If no cosmetics, just render the plain username
  if (!cosmetics || (!cosmetics.emojiRing && !cosmetics.nameEffectClass && !cosmetics.title)) {
    return (
      <span className={`user-display-name ${className}`}>
        {username}
      </span>
    );
  }

  // Check if emoji ring has any emojis
  const hasEmojiRing = cosmetics.emojiRing && Object.values(cosmetics.emojiRing).some(v => v);

  // If has emoji ring, use the EmojiRing component
  if (hasEmojiRing) {
    return (
      <EmojiRing
        username={username}
        nameEffectClass={cosmetics.nameEffectClass || undefined}
        positions={cosmetics.emojiRing as EmojiRingPositions}
        size={size}
        showTitle={showTitle && !!cosmetics.title}
        title={cosmetics.title}
        className={className}
      />
    );
  }

  // No emoji ring but has name effect or title
  return (
    <span className={`user-display-name ${className}`}>
      <span
        className={`ring-username ${cosmetics.nameEffectClass || ''}`}
        data-text={username}
      >
        {username}
      </span>
      {showTitle && cosmetics.title && (
        <span className="ring-title ml-1">"{cosmetics.title}"</span>
      )}
    </span>
  );
}

/**
 * Wrapper component that adds a frame around an avatar.
 */
interface FramedAvatarProps {
  children: React.ReactNode;
  frameClass?: string | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function FramedAvatar({
  children,
  frameClass,
  size = 'medium',
  className = '',
}: FramedAvatarProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div
      className={`
        framed-avatar relative inline-flex items-center justify-center
        ${sizeClasses[size]} ${frameClass || ''} ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}

export default UserDisplayName;
