import { useState, useEffect } from 'react';
import './BigPulpCharacter.css';

interface BigPulpCharacterProps {
  message: string;
  isTyping?: boolean;
  variant?: 'default' | 'crown' | 'wizard' | 'cowboy';
  onTypingComplete?: () => void;
}

const BigPulpCharacter: React.FC<BigPulpCharacterProps> = ({
  message,
  isTyping = false,
  variant = 'default',
  onTypingComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isAnimatingText, setIsAnimatingText] = useState(false);

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

  // Get character image based on variant
  const getCharacterImage = () => {
    // TODO: Replace with actual BigPulp images once provided
    // For now, using placeholder paths
    const images: Record<string, string> = {
      default: '/assets/BigPulp/characters/bigpulp-default.png',
      crown: '/assets/BigPulp/characters/bigpulp-crown.png',
      wizard: '/assets/BigPulp/characters/bigpulp-wizard.png',
      cowboy: '/assets/BigPulp/characters/bigpulp-cowboy.png',
    };
    return images[variant] || images.default;
  };

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

      {/* BigPulp Character */}
      <div className="bigpulp-character">
        <div className="character-wrapper">
          {/* Animated orange character */}
          <div className="orange-body">
            {/* Placeholder orange circle until real image provided */}
            <div className="orange-placeholder">
              <span className="orange-emoji">🍊</span>
              <div className="orange-face">
                <div className="orange-eyes">
                  <span className="eye left" />
                  <span className="eye right" />
                </div>
                <div className="orange-mouth" />
              </div>
            </div>
            {/* Real image (uncomment when available) */}
            {/* <img
              src={getCharacterImage()}
              alt="BigPulp"
              className="character-image"
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BigPulpCharacter;
