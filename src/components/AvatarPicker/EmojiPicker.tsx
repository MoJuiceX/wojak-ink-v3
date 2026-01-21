/**
 * EmojiPicker Component
 *
 * Grid of 15 curated emojis for avatar selection.
 * Used in AvatarPickerModal.
 */

import { DEFAULT_EMOJIS } from '@/types/avatar';
import './EmojiPicker.css';

interface EmojiPickerProps {
  selectedEmoji?: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ selectedEmoji, onSelect }: EmojiPickerProps) {
  return (
    <div className="emoji-picker">
      <p className="emoji-picker-hint">Choose your avatar emoji</p>
      <div className="emoji-grid">
        {DEFAULT_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={`emoji-option ${selectedEmoji === emoji ? 'selected' : ''}`}
            onClick={() => onSelect(emoji)}
            onTouchEnd={(e) => {
              e.preventDefault();
              onSelect(emoji);
            }}
            aria-label={`Select ${emoji} as avatar`}
            aria-pressed={selectedEmoji === emoji}
          >
            <span className="emoji-char">{emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default EmojiPicker;
