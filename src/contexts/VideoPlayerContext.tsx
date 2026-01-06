import React, { createContext, useContext, useState, useCallback } from 'react';

interface VideoItem {
  id: string;
  title: string;
  platform: 'local' | 'youtube';
  videoFile: string;
  thumbnail?: string;
  author?: string;
}

interface VideoPlayerContextType {
  currentVideo: VideoItem | null;
  isOpen: boolean;
  openVideo: (video: VideoItem) => void;
  closeVideo: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export const VideoPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openVideo = useCallback((video: VideoItem) => {
    setCurrentVideo(video);
    setIsOpen(true);
  }, []);

  const closeVideo = useCallback(() => {
    setIsOpen(false);
    setCurrentVideo(null);
  }, []);

  return (
    <VideoPlayerContext.Provider value={{ currentVideo, isOpen, openVideo, closeVideo }}>
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayer = () => {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
  }
  return context;
};
