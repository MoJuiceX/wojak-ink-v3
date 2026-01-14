import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { GalleryProvider } from '@/contexts/GalleryContext';
import { MediaProvider } from '@/contexts/MediaContext';
import { AudioProvider } from '@/contexts/AudioContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { ToastContainer } from '@/components/ui/Toast';
import { PreloadProvider } from '@/components/preload/PreloadProvider';
import { SalesProvider } from '@/providers/SalesProvider';
import { GlobalVideoPlayer } from '@/components/media/video/GlobalVideoPlayer';
import StartupSequence from '@/components/StartupSequence';

// Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Lazy load all pages for code splitting
const Gallery = lazy(() => import('./pages/Gallery'));
const Treasury = lazy(() => import('./pages/Treasury'));
const BigPulp = lazy(() => import('./pages/BigPulp'));
const Generator = lazy(() => import('./pages/Generator'));
const Media = lazy(() => import('./pages/Media'));
const Settings = lazy(() => import('./pages/Settings'));

// Games
const OrangeStack = lazy(() => import('./pages/OrangeStack'));
const MemoryMatch = lazy(() => import('./pages/MemoryMatch'));
const OrangePong = lazy(() => import('./pages/OrangePong'));
const WojakRunner = lazy(() => import('./pages/WojakRunner'));
const OrangeJuggle = lazy(() => import('./pages/OrangeJuggle'));
const KnifeGame = lazy(() => import('./pages/KnifeGame'));

// Skip boot sequence in development for faster testing
const SKIP_BOOT_IN_DEV = true;

// Inner app component with access to router
function AppContent() {
  // In dev mode, skip boot sequence entirely
  const [isStartupComplete, setIsStartupComplete] = useState(
    import.meta.env.DEV && SKIP_BOOT_IN_DEV
  );
  const navigate = useNavigate();

  const handleStartupComplete = () => {
    // Navigate to Gallery FIRST, before showing content
    navigate('/gallery', { replace: true });
    // Small delay ensures navigation completes before content becomes visible
    setTimeout(() => {
      setIsStartupComplete(true);
    }, 50);
  };

  return (
    <PreloadProvider>
      <GalleryProvider>
        <LayoutProvider>
          {/* Boot Sequence - shows until complete, then navigates to Gallery */}
          {!isStartupComplete && (
            <StartupSequence onComplete={handleStartupComplete} />
          )}

          {/* Main App Content - hidden until startup completes */}
          <div
            style={{
              opacity: isStartupComplete ? 1 : 0,
              pointerEvents: isStartupComplete ? 'auto' : 'none',
              transition: 'opacity 0.3s ease-in',
              visibility: isStartupComplete ? 'visible' : 'hidden',
            }}
          >
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/gallery" replace />} />
                <Route
                  path="gallery"
                  element={
                    <Suspense fallback={<PageSkeleton type="gallery" />}>
                      <Gallery />
                    </Suspense>
                  }
                />
                <Route
                  path="gallery/:nftId"
                  element={
                    <Suspense fallback={<PageSkeleton type="detail" />}>
                      <Gallery />
                    </Suspense>
                  }
                />
                <Route
                  path="treasury"
                  element={
                    <Suspense fallback={<PageSkeleton type="treasury" />}>
                      <Treasury />
                    </Suspense>
                  }
                />
                <Route
                  path="bigpulp"
                  element={
                    <Suspense fallback={<PageSkeleton type="bigpulp" />}>
                      <BigPulp />
                    </Suspense>
                  }
                />
                <Route
                  path="generator"
                  element={
                    <Suspense fallback={<PageSkeleton type="generator" />}>
                      <Generator />
                    </Suspense>
                  }
                />
                <Route
                  path="media"
                  element={
                    <Suspense fallback={<PageSkeleton type="media" />}>
                      <Media />
                    </Suspense>
                  }
                />
                <Route
                  path="settings/*"
                  element={
                    <Suspense fallback={<PageSkeleton type="settings" />}>
                      <Settings />
                    </Suspense>
                  }
                />
                {/* Game Routes - all under /media/games/* */}
                <Route
                  path="media/games/stack"
                  element={
                    <Suspense fallback={<PageSkeleton type="media" />}>
                      <OrangeStack />
                    </Suspense>
                  }
                />
                <Route
                  path="media/games/memory"
                  element={
                    <Suspense fallback={<PageSkeleton type="media" />}>
                      <MemoryMatch />
                    </Suspense>
                  }
                />
                <Route
                  path="media/games/pong"
                  element={
                    <Suspense fallback={<PageSkeleton type="media" />}>
                      <OrangePong />
                    </Suspense>
                  }
                />
                <Route
                  path="media/games/runner"
                  element={
                    <Suspense fallback={<PageSkeleton type="media" />}>
                      <WojakRunner />
                    </Suspense>
                  }
                />
                <Route
                  path="media/games/juggle"
                  element={
                    <Suspense fallback={<PageSkeleton type="media" />}>
                      <OrangeJuggle />
                    </Suspense>
                  }
                />
                <Route
                  path="media/games/knife"
                  element={
                    <Suspense fallback={<PageSkeleton type="media" />}>
                      <KnifeGame />
                    </Suspense>
                  }
                />
              </Route>
            </Routes>
            <ToastContainer />
            <GlobalVideoPlayer />
          </div>
        </LayoutProvider>
      </GalleryProvider>
    </PreloadProvider>
  );
}

function App() {
  // Warn in development if Clerk key is missing
  if (!CLERK_PUBLISHABLE_KEY) {
    console.warn(
      '[Clerk] Missing VITE_CLERK_PUBLISHABLE_KEY. Auth features will be disabled.\n' +
      'Add it to .env.local - see .env.example for details.'
    );
  }

  return (
    <QueryProvider>
      <SalesProvider>
      <ThemeProvider defaultTheme="tang-orange">
        <SettingsProvider>
          <ToastProvider>
            <AudioProvider>
            <MediaProvider>
            <BrowserRouter>
              {CLERK_PUBLISHABLE_KEY ? (
                <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
                  <AppContent />
                </ClerkProvider>
              ) : (
                <AppContent />
              )}
            </BrowserRouter>
            </MediaProvider>
            </AudioProvider>
          </ToastProvider>
        </SettingsProvider>
      </ThemeProvider>
      </SalesProvider>
    </QueryProvider>
  );
}

export default App;
