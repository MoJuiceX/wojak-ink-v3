/**
 * Emoji Ring Component
 *
 * Displays 18 emoji slots around a username:
 * - 3 left, 3 right, 6 top, 6 bottom
 * - Fixed width name area for leaderboard consistency
 */

interface EmojiRingPositions {
  left_1?: string | null;
  left_2?: string | null;
  left_3?: string | null;
  right_1?: string | null;
  right_2?: string | null;
  right_3?: string | null;
  top_1?: string | null;
  top_2?: string | null;
  top_3?: string | null;
  top_4?: string | null;
  top_5?: string | null;
  top_6?: string | null;
  bottom_1?: string | null;
  bottom_2?: string | null;
  bottom_3?: string | null;
  bottom_4?: string | null;
  bottom_5?: string | null;
  bottom_6?: string | null;
}

interface EmojiRingProps {
  username: string;
  nameEffectClass?: string;
  positions: EmojiRingPositions;
  size?: 'compact' | 'normal' | 'large';
  showTitle?: boolean;
  title?: string | null;
  className?: string;
}

const sizeClasses = {
  compact: 'ring-compact',
  normal: 'ring-normal',
  large: 'ring-large',
};

export function EmojiRing({
  username,
  nameEffectClass,
  positions,
  size = 'normal',
  showTitle = false,
  title,
  className = '',
}: EmojiRingProps) {
  // Check if any emojis are set
  const hasTopRow = positions.top_1 || positions.top_2 || positions.top_3 ||
                    positions.top_4 || positions.top_5 || positions.top_6;
  const hasBottomRow = positions.bottom_1 || positions.bottom_2 || positions.bottom_3 ||
                       positions.bottom_4 || positions.bottom_5 || positions.bottom_6;
  const hasLeftColumn = positions.left_1 || positions.left_2 || positions.left_3;
  const hasRightColumn = positions.right_1 || positions.right_2 || positions.right_3;

  const hasAnyEmoji = hasTopRow || hasBottomRow || hasLeftColumn || hasRightColumn;

  // If no emojis, just render username with optional effect
  if (!hasAnyEmoji) {
    return (
      <span className={`ring-username ${nameEffectClass || ''} ${className}`} data-text={username}>
        {username}
        {showTitle && title && <span className="ring-title ml-1">"{title}"</span>}
      </span>
    );
  }

  return (
    <div className={`emoji-ring ${sizeClasses[size]} ${className}`}>
      {/* Top Row */}
      {hasTopRow && (
        <div className="ring-row ring-top">
          {positions.top_1 && <span className="ring-emoji">{positions.top_1}</span>}
          {positions.top_2 && <span className="ring-emoji">{positions.top_2}</span>}
          {positions.top_3 && <span className="ring-emoji">{positions.top_3}</span>}
          {positions.top_4 && <span className="ring-emoji">{positions.top_4}</span>}
          {positions.top_5 && <span className="ring-emoji">{positions.top_5}</span>}
          {positions.top_6 && <span className="ring-emoji">{positions.top_6}</span>}
        </div>
      )}

      {/* Middle Section: Left + Name + Right */}
      <div className="ring-middle">
        {/* Left Column */}
        {hasLeftColumn && (
          <div className="ring-column ring-left">
            {positions.left_1 && <span className="ring-emoji">{positions.left_1}</span>}
            {positions.left_2 && <span className="ring-emoji">{positions.left_2}</span>}
            {positions.left_3 && <span className="ring-emoji">{positions.left_3}</span>}
          </div>
        )}

        {/* Name Area (Fixed Width) */}
        <div className="ring-name-area">
          <span
            className={`ring-username ${nameEffectClass || ''}`}
            data-text={username}
          >
            {username}
          </span>
          {showTitle && title && (
            <span className="ring-title">"{title}"</span>
          )}
        </div>

        {/* Right Column */}
        {hasRightColumn && (
          <div className="ring-column ring-right">
            {positions.right_1 && <span className="ring-emoji">{positions.right_1}</span>}
            {positions.right_2 && <span className="ring-emoji">{positions.right_2}</span>}
            {positions.right_3 && <span className="ring-emoji">{positions.right_3}</span>}
          </div>
        )}
      </div>

      {/* Bottom Row */}
      {hasBottomRow && (
        <div className="ring-row ring-bottom">
          {positions.bottom_1 && <span className="ring-emoji">{positions.bottom_1}</span>}
          {positions.bottom_2 && <span className="ring-emoji">{positions.bottom_2}</span>}
          {positions.bottom_3 && <span className="ring-emoji">{positions.bottom_3}</span>}
          {positions.bottom_4 && <span className="ring-emoji">{positions.bottom_4}</span>}
          {positions.bottom_5 && <span className="ring-emoji">{positions.bottom_5}</span>}
          {positions.bottom_6 && <span className="ring-emoji">{positions.bottom_6}</span>}
        </div>
      )}
    </div>
  );
}

export type { EmojiRingPositions, EmojiRingProps };
