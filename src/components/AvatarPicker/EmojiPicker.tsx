/**
 * Emoji Picker Component
 *
 * Grid of emoji options for avatar selection.
 */

import React from 'react';
import { EMOJI_AVATARS } from '../../constants/avatars';
import './AvatarPicker.css';

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  selectedEmoji,
  onSelect
}) => {
  return (
    <div className="emoji-picker">
      <h3 className="picker-title">Choose Your Emoji Avatar</h3>
      <div className="emoji-grid">
        {EMOJI_AVATARS.map((emoji) => (
          <button
            key={emoji}
            className={`emoji-option ${selectedEmoji === emoji ? 'selected' : ''}`}
            onClick={() => onSelect(emoji)}
            type="button"
            aria-label={`Select ${emoji} as avatar`}
            aria-pressed={selectedEmoji === emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
