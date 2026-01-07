import { useState, useEffect, useMemo } from 'react';
import './BigPulpCharacter.css';

interface BigPulpCharacterProps {
  message: string;
  isTyping?: boolean;
  headTrait?: string;
  onTypingComplete?: () => void;
}

// Map head traits to BigPulp images
const HEAD_TO_BIGPULP: Record<string, string> = {
  'Crown': 'BigP_crown.png',
  'Clown': 'BigP_clown.png',
  'Military Beret': 'BigP_beret.png',
  'Viking Helmet': 'BigP_viking.png',
  'Tin Foil Hat': 'BigP_tin.png',
  'Super Wojak Hat': 'BigP_super_wojak.png',
  'Propeller Hat': 'BigP_propeller.png',
  'Fedora': 'BigP_Fedora.png',
};

// Wizard hat colors for random selection
const WIZARD_COLORS = [
  'BigP_wiz_orange.png',
  'BigP_wiz_red.png',
  'BigP_wiz_pink.png',
  'BigP_wiz_blue.png',
  'BigP_wiz_yellow.png',
  'BigP_wiz_dark_blue.png',
];

// All available BigPulp images for random selection when no match
const ALL_BIGPULP_IMAGES = [
  'BigP_crown.png',
  'BigP_clown.png',
  'BigP_beret.png',
  'BigP_viking.png',
  'BigP_tin.png',
  'BigP_super_wojak.png',
  'BigP_propeller.png',
  'BigP_Fedora.png',
  ...WIZARD_COLORS,
];

const BigPulpCharacter: React.FC<BigPulpCharacterProps> = ({
  message,
  isTyping = false,
  headTrait,
  onTypingComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isAnimatingText, setIsAnimatingText] = useState(false);

  // Determine the BigPulp image based on head trait
  const bigPulpImage = useMemo(() => {
    if (!headTrait) {
      // No trait provided - pick random
      return ALL_BIGPULP_IMAGES[Math.floor(Math.random() * ALL_BIGPULP_IMAGES.length)];
    }

    // Check for Wizard Hat - pick random wizard color
    if (headTrait === 'Wizard Hat') {
      return WIZARD_COLORS[Math.floor(Math.random() * WIZARD_COLORS.length)];
    }

    // Check for direct match
    if (HEAD_TO_BIGPULP[headTrait]) {
      return HEAD_TO_BIGPULP[headTrait];
    }

    // No match - pick random
    return ALL_BIGPULP_IMAGES[Math.floor(Math.random() * ALL_BIGPULP_IMAGES.length)];
  }, [headTrait]);

  const baseImagePath = '/assets/BigPulp/art/BigP_base.png';
  const characterImagePath = `/assets/BigPulp/art/${bigPulpImage}`;

  // Typing animation effect
  useEffect(() => {
    if (!message) {
      setDisplayedText('');
      return;
    }

    if (isTyping) {
      setIsAnimatingText(true);
      setDisplayedText('');
      let index = 0;
      const typingSpeed = 20; // ms per character

      const timer = setInterval(() => {
        if (index < message.length) {
          setDisplayedText(message.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          setIsAnimatingText(false);
          onTypingComplete?.();
        }
      }, typingSpeed);

      return () => clearInterval(timer);
    } else {
      setDisplayedText(message);
      setIsAnimatingText(false);
    }
  }, [message, isTyping, onTypingComplete]);

  return (
    <div className="bigpulp-character-container">
      {/* Speech Bubble */}
      <div className={`speech-bubble ${displayedText ? 'visible' : ''}`}>
        <div className="speech-content">
          {displayedText}
          {isAnimatingText && <span className="typing-cursor">|</span>}
        </div>
        <div className="speech-tail" />
      </div>

      {/* BigPulp Character - Two Layer Animation */}
      <div className="bigpulp-character">
        <div className="character-layers">
          {/* Layer 1: Static base (feet) */}
          <img
            src={baseImagePath}
            alt="BigPulp base"
            className="bigpulp-layer bigpulp-layer-static"
          />
          {/* Layer 2: Character variant (moves) */}
          <img
            src={characterImagePath}
            alt="BigPulp"
            className="bigpulp-layer bigpulp-layer-moving"
          />
        </div>
      </div>
    </div>
  );
};

export default BigPulpCharacter;
