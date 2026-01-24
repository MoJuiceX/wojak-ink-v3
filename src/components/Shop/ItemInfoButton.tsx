/**
 * Item Info Button Component
 *
 * Shows a tooltip with item description, effect, and category info
 * when clicked or hovered.
 */

import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import './ItemInfoButton.css';

interface ItemInfoButtonProps {
  item: {
    name: string;
    description?: string | null;
    effect?: string | null;
    category: string;
  };
}

// Category explanations for users
const CATEGORY_INFO: Record<string, string> = {
  frame: 'Frames appear around your NFT in your drawer',
  title: 'Titles display below your username',
  name_effect: 'Effects animate your display name',
  background: 'Backgrounds change your profile backdrop',
  celebration: 'Animations that play when you achieve something',
  emoji_badge: 'Emojis display next to your name',
  bigpulp_hat: 'Hats for your BigPulp companion',
  bigpulp_mood: 'Expressions for your BigPulp companion',
  bigpulp_accessory: 'Accessories for your BigPulp companion',
  consumable: 'Items you can throw at NFTs',
  font_color: 'Changes the color of text in your drawer',
  font_style: 'Changes the style of text in your drawer',
  font_family: 'Changes the font in your drawer',
  page_background: 'Changes your drawer page background',
  avatar_glow: 'Adds glow effect around your avatar',
  avatar_size: 'Changes the size of your avatar',
  bigpulp_position: 'Changes where BigPulp appears',
  dialogue_style: 'Changes how BigPulp dialogue looks',
  collection_layout: 'Changes how NFTs are arranged',
  card_style: 'Changes how NFT cards look',
  entrance_animation: 'Animation when drawer loads',
  stats_style: 'Changes how stats are displayed',
  tabs_style: 'Changes how tabs look',
  visitor_counter: 'Shows visitor count on drawer',
  bundle: 'Multiple items at a discounted price',
};

export function ItemInfoButton({ item }: ItemInfoButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!showTooltip) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTooltip]);

  // Get category explanation
  const categoryExplanation = CATEGORY_INFO[item.category] || 'Customization item';

  // Don't render if no description and no effect
  const hasContent = item.description || item.effect;

  return (
    <div className="item-info-wrapper">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="item-info-button"
        aria-label="Item information"
      >
        <Info size={14} />
      </button>

      {showTooltip && (
        <div ref={tooltipRef} className="item-info-tooltip">
          <h4 className="item-info-name">{item.name}</h4>

          {hasContent ? (
            <>
              {item.description && (
                <p className="item-info-description">{item.description}</p>
              )}

              {item.effect && (
                <p className="item-info-effect">
                  <span className="effect-label">Effect:</span> {item.effect}
                </p>
              )}
            </>
          ) : (
            <p className="item-info-description">{categoryExplanation}</p>
          )}

          <p className="item-info-category">{categoryExplanation}</p>
        </div>
      )}
    </div>
  );
}
