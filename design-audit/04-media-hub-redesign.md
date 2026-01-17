# Media Hub Redesign - Immersive Entertainment Center

## Current Issues
- Very plain and static layout
- Video thumbnails have no hover effects
- Background music player is basic
- No visual excitement for entertainment content
- Missing the "entertainment hub" atmosphere
- Cards feel like simple boxes

---

## Target Design: Cyberpunk Media Theater

### 1. Video Card Enhancement

#### Premium Video Card
```css
.video-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(249, 115, 22, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Thumbnail container */
.video-thumbnail {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

/* Gradient overlay */
.video-thumbnail::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
}

/* Play button overlay */
.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.play-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(249, 115, 22, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.8);
  transition: transform 0.3s;
}

.play-button svg {
  width: 24px;
  height: 24px;
  color: white;
  margin-left: 4px; /* Visual centering for play icon */
}

/* Hover effects */
.video-card:hover {
  transform: translateY(-8px);
  border-color: rgba(249, 115, 22, 0.4);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(249, 115, 22, 0.2);
}

.video-card:hover .video-thumbnail img {
  transform: scale(1.1);
}

.video-card:hover .play-overlay {
  opacity: 1;
}

.video-card:hover .play-button {
  transform: scale(1);
  box-shadow: 0 0 30px rgba(249, 115, 22, 0.6);
}
```

#### Video Info Section
```css
.video-info {
  padding: 16px;
}

.video-title {
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
  transition: color 0.2s;
}

.video-card:hover .video-title {
  color: #F97316;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

/* Type badge */
.video-type-badge {
  padding: 4px 10px;
  background: rgba(249, 115, 22, 0.15);
  border-radius: 20px;
  color: #F97316;
  font-size: 11px;
  font-weight: 500;
}

/* View count with icon */
.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
}
```

---

### 2. Video Grid Animation

```tsx
const videoGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const videoCardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

<motion.div
  className="video-grid"
  variants={videoGridVariants}
  initial="hidden"
  animate="visible"
>
  {videos.map((video, index) => (
    <motion.div
      key={video.id}
      variants={videoCardVariants}
      whileHover={{ y: -8 }}
    >
      <VideoCard video={video} />
    </motion.div>
  ))}
</motion.div>
```

---

### 3. Background Music Player Enhancement

#### Premium Music Player
```css
.music-player {
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.1) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 20px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

/* Animated background gradient */
.music-player::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(249, 115, 22, 0.1) 50%,
    transparent 70%
  );
  background-size: 200% 200%;
  animation: shimmer 3s ease infinite;
  opacity: 0;
  transition: opacity 0.3s;
}

.music-player.playing::before {
  opacity: 1;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Music icon with animation */
.music-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(249, 115, 22, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.music-icon.playing {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Equalizer bars animation */
.equalizer {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 20px;
}

.eq-bar {
  width: 3px;
  background: #F97316;
  border-radius: 2px;
  animation: eqBounce 0.5s ease-in-out infinite;
}

.eq-bar:nth-child(1) { animation-delay: 0s; height: 8px; }
.eq-bar:nth-child(2) { animation-delay: 0.1s; height: 16px; }
.eq-bar:nth-child(3) { animation-delay: 0.2s; height: 12px; }
.eq-bar:nth-child(4) { animation-delay: 0.15s; height: 18px; }
.eq-bar:nth-child(5) { animation-delay: 0.05s; height: 10px; }

@keyframes eqBounce {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
}

/* Paused state - bars don't animate */
.music-player:not(.playing) .eq-bar {
  animation: none;
  height: 4px !important;
}
```

#### Play Button with State Animation
```tsx
<motion.button
  className="play-btn"
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  animate={{
    boxShadow: isPlaying
      ? "0 0 20px rgba(249, 115, 22, 0.5)"
      : "0 0 0px rgba(249, 115, 22, 0)"
  }}
>
  <AnimatePresence mode="wait">
    <motion.div
      key={isPlaying ? "pause" : "play"}
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 90 }}
      transition={{ duration: 0.2 }}
    >
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </motion.div>
  </AnimatePresence>
</motion.button>
```

---

### 4. Section Headers

#### Glowing Section Title
```css
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.section-icon {
  font-size: 24px;
  filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.5));
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  position: relative;
}

/* Underline glow */
.section-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #F97316, transparent);
}
```

---

### 5. Category Filter Tabs

```css
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.filter-tab {
  padding: 10px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  background: rgba(249, 115, 22, 0.1);
  border-color: rgba(249, 115, 22, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

.filter-tab.active {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(249, 115, 22, 0.1));
  border-color: rgba(249, 115, 22, 0.5);
  color: #F97316;
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.3);
}
```

---

### 6. Video Player Modal (When Playing)

```css
.video-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.video-modal-content {
  width: 90%;
  max-width: 1200px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 0 60px rgba(249, 115, 22, 0.3),
    0 25px 50px rgba(0, 0, 0, 0.5);
}
```

```tsx
// Modal animation
<motion.div
  className="video-modal"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  <motion.div
    className="video-modal-content"
    initial={{ scale: 0.9, y: 20 }}
    animate={{ scale: 1, y: 0 }}
    exit={{ scale: 0.95, y: 10 }}
    transition={{ type: "spring", damping: 25 }}
  >
    {/* Video player */}
  </motion.div>
</motion.div>
```

---

### 7. Empty State Enhancement

```tsx
// When no videos in a category
<motion.div
  className="empty-state"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  <motion.div
    animate={{
      y: [0, -10, 0],
      rotate: [0, 5, -5, 0]
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="empty-icon"
  >
    🎬
  </motion.div>
  <h3>No videos yet</h3>
  <p>Check back soon for new content!</p>
</motion.div>
```

---

## Implementation Checklist

- [ ] Redesign video cards with hover effects and play overlay
- [ ] Add thumbnail zoom effect on hover
- [ ] Implement staggered grid entry animation
- [ ] Enhance music player with equalizer animation
- [ ] Add play/pause button state animation
- [ ] Style section headers with glow effect
- [ ] Create animated filter tabs
- [ ] Design video player modal with animations
- [ ] Add engaging empty state

---

## Files to Modify

1. `src/pages/Media.tsx` or `MediaPage.tsx`
2. `src/components/media/VideoCard.tsx`
3. `src/components/media/MusicPlayer.tsx` or `BackgroundMusic.tsx`
4. `src/components/media/VideoGrid.tsx`
5. `src/components/media/VideoModal.tsx` (if exists)
6. Add CSS for media-specific animations

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/04-media-hub-redesign.md and implement the Media Hub enhancements. Add premium video cards with hover effects and play overlays, enhance the music player with equalizer animations, implement staggered grid animations, and style the filter tabs with glow effects. Test on localhost:5173/media.
```
