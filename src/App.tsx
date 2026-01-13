import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { GalleryProvider } from '@/contexts/GalleryContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { ToastContainer } from '@/components/ui/Toast';
import { PreloadProvider } from '@/components/preload/PreloadProvider';
import { SalesProvider } from '@/providers/SalesProvider';

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
const Orange2048 = lazy(() => import('./pages/Orange2048'));

function App() {
  return (
    <QueryProvider>
      <SalesProvider>
      <ThemeProvider defaultTheme="tang-orange">
        <SettingsProvider>
          <ToastProvider>
            <BrowserRouter>
              <PreloadProvider>
              <GalleryProvider>
                <LayoutProvider>
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
                    {/* Game Routes */}
                    <Route
                      path="orange-stack"
                      element={
                        <Suspense fallback={<PageSkeleton type="media" />}>
                          <OrangeStack />
                        </Suspense>
                      }
                    />
                    <Route
                      path="memory-match"
                      element={
                        <Suspense fallback={<PageSkeleton type="media" />}>
                          <MemoryMatch />
                        </Suspense>
                      }
                    />
                    <Route
                      path="orange-pong"
                      element={
                        <Suspense fallback={<PageSkeleton type="media" />}>
                          <OrangePong />
                        </Suspense>
                      }
                    />
                    <Route
                      path="wojak-runner"
                      element={
                        <Suspense fallback={<PageSkeleton type="media" />}>
                          <WojakRunner />
                        </Suspense>
                      }
                    />
                    <Route
                      path="orange-2048"
                      element={
                        <Suspense fallback={<PageSkeleton type="media" />}>
                          <Orange2048 />
                        </Suspense>
                      }
                    />
                  </Route>
                </Routes>
                  <ToastContainer />
                </LayoutProvider>
              </GalleryProvider>
              </PreloadProvider>
            </BrowserRouter>
          </ToastProvider>
        </SettingsProvider>
      </ThemeProvider>
      </SalesProvider>
    </QueryProvider>
  );
}

export default App;
