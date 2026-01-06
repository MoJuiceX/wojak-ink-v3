import { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronForward, chevronBack } from 'ionicons/icons';
import './FloatingVideoPlayer.css';

interface FloatingVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'local' | 'youtube';
  videoSrc: string;
  title?: string;
}

const FloatingVideoPlayer: React.FC<FloatingVideoPlayerProps> = ({
  isOpen,
  onClose,
  platform,
  videoSrc,
}) => {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset state and autoplay when opening
  useEffect(() => {
    if (isOpen && videoSrc) {
      setPosition({ x: 20, y: 100 });
      setIsMinimized(false);
      setIsPlaying(false);
      setHasMoved(false);

      // Autoplay after a short delay
      if (platform === 'local') {
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => setIsPlaying(true))
              .catch(err => {
                console.log('Autoplay blocked:', err);
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  videoRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(() => setIsPlaying(false));
                }
              });
          }
        }, 100);
      }
    }
  }, [isOpen, videoSrc, platform]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.log('Play failed:', err));
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't interfere with close button
    if ((e.target as HTMLElement).closest('.close-x')) return;

    const touch = e.touches[0];
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startPosX: position.x,
      startPosY: position.y
    };
    setIsDragging(true);
    setHasMoved(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragRef.current.startX;
    const deltaY = touch.clientY - dragRef.current.startY;

    // Mark as moved if dragged more than 5px
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setHasMoved(true);
    }

    const newX = dragRef.current.startPosX + deltaX;
    const newY = dragRef.current.startPosY + deltaY;

    const playerWidth = isMinimized ? 50 : 260;
    const playerHeight = isMinimized ? 70 : 180;
    const maxX = window.innerWidth - playerWidth;
    const maxY = window.innerHeight - playerHeight;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(50, Math.min(newY, maxY))
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Don't interfere with close button
    if ((e.target as HTMLElement).closest('.close-x')) return;

    if (!dragRef.current) {
      // No drag started, might be a simple tap
      if (!hasMoved) {
        togglePlayPause();
      }
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - dragRef.current.startX;
    const deltaY = touch.clientY - dragRef.current.startY;
    const totalMovement = Math.abs(deltaX) + Math.abs(deltaY);

    // If barely moved, treat as tap to play/pause
    if (totalMovement < 15 && !isMinimized && !hasMoved) {
      e.preventDefault();
      togglePlayPause();
    } else if (!isMinimized && Math.abs(deltaX) > 80) {
      // Swipe to minimize
      if (deltaX < 0) {
        setIsMinimized(true);
        setPosition(prev => ({ ...prev, x: 0 }));
      } else {
        setIsMinimized(true);
        setPosition(prev => ({ ...prev, x: window.innerWidth - 50 }));
      }
    }

    setIsDragging(false);
    dragRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y
    };
    setIsDragging(true);
    setHasMoved(false);
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!dragRef.current) return;

        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;

        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          setHasMoved(true);
        }

        const newX = dragRef.current.startPosX + deltaX;
        const newY = dragRef.current.startPosY + deltaY;

        const playerWidth = isMinimized ? 50 : 260;
        const playerHeight = isMinimized ? 70 : 180;
        const maxX = window.innerWidth - playerWidth;
        const maxY = window.innerHeight - playerHeight;

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(50, Math.min(newY, maxY))
        });
      };

      const handleGlobalMouseUp = (e: MouseEvent) => {
        if (dragRef.current) {
          const deltaX = e.clientX - dragRef.current.startX;
          const deltaY = e.clientY - dragRef.current.startY;
          const totalMovement = Math.abs(deltaX) + Math.abs(deltaY);

          // If barely moved, treat as click to play/pause
          if (totalMovement < 10 && !isMinimized) {
            togglePlayPause();
          }
        }
        setIsDragging(false);
        dragRef.current = null;
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, isMinimized, isPlaying]);

  const handleExpand = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsMinimized(false);
    const centerX = Math.max(20, (window.innerWidth - 260) / 2);
    setPosition(prev => ({ ...prev, x: centerX }));
  };

  // Close on swipe down when minimized or double-tap
  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  };

  if (!isOpen) return null;

  const isOnRightSide = position.x > window.innerWidth / 2;

  return (
    <div
      ref={containerRef}
      className={`floating-video-player ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* Video element - ALWAYS rendered to keep audio playing when minimized */}
      <div
        className="video-wrapper"
        style={{ display: isMinimized ? 'none' : 'block' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {platform === 'youtube' ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoSrc}?autoplay=1&playsinline=1&mute=0&enablejsapi=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}
        {/* Close button - small X in corner */}
        <button className="close-x" onClick={handleClose}>×</button>
        {/* Play/Pause indicator overlay */}
        {!isPlaying && (
          <div className="play-indicator">▶</div>
        )}
      </div>

      {/* Minimized pill UI - shown when minimized */}
      {isMinimized && (
        <div
          className="minimized-player"
          onClick={handleExpand}
          onTouchEnd={handleExpand}
        >
          <IonIcon icon={isOnRightSide ? chevronBack : chevronForward} className="expand-icon" />
          <div className="mini-title">{isPlaying ? '▶' : '⏸'}</div>
        </div>
      )}
    </div>
  );
};

export default FloatingVideoPlayer;
