import { useState, useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { images, wallet, bulb, colorPalette, musicalNotes, ellipsisVertical } from 'ionicons/icons';

// Pages
import Gallery from './pages/Gallery';
import Treasury from './pages/Treasury';
import BigPulp from './pages/BigPulp';
import Generator from './pages/Generator';
import Media from './pages/Media';
import SettingsPage from './pages/SettingsPage';
import AdminStats from './pages/AdminStats';

// Components
import { loadSettings, applyTheme, AppSettings } from './components/Settings';
import FloatingVideoPlayer from './components/FloatingVideoPlayer';
import { AudioProvider } from './contexts/AudioContext';
import { VideoPlayerProvider, useVideoPlayer } from './contexts/VideoPlayerContext';

// Boot Sequence
import StartupSequence from './components/StartupSequence';

// Initialize Parse connection (temporarily disabled for debugging)
// import './services/parseClient';

// Prefetch treasury data on app start for instant loading
import { prefetchWalletData, preloadTokenLogos } from './services/treasuryApi';
prefetchWalletData();
preloadTokenLogos();

// Initialize gallery preloader - starts loading NFT images during boot
import { initGalleryPreloader, startPreloading } from './services/galleryPreloader';
initGalleryPreloader().then(() => {
  // Start aggressive preloading once initialized
  startPreloading();
});

// Prefetch market listings IMMEDIATELY during boot sequence
// This runs while user watches the startup animation
import { prefetchListings, preloadListingImages } from './services/marketApi';
import { fetchTradeValues, fetchCollectionStats } from './services/tradeValuesService';

// Start ALL prefetching immediately - boot sequence gives us time
prefetchListings();
fetchTradeValues().catch(() => {}); // Prefetch trade/attribute data
fetchCollectionStats().catch(() => {}); // Prefetch collection stats

// Preload images after data is fetched
setTimeout(() => preloadListingImages(), 2000);

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables & Design System */
import './theme/variables.css';
import './theme/ionic-overrides.css';
import './theme/global.css';

setupIonicReact();

// Skip boot sequence in development mode for faster testing
const SKIP_BOOT_IN_DEV = true;

// Floating Video Player that uses context
const GlobalFloatingPlayer: React.FC = () => {
  const { currentVideo, nextVideo, isOpen, closeVideo, playNext } = useVideoPlayer();

  return (
    <FloatingVideoPlayer
      isOpen={isOpen}
      onClose={closeVideo}
      onVideoEnded={playNext}
      platform={currentVideo?.platform || 'local'}
      videoSrc={currentVideo?.videoFile || ''}
      nextVideoSrc={nextVideo?.videoFile}
      title={currentVideo?.title}
    />
  );
};

const App: React.FC = () => {
  // In dev mode, skip boot sequence if SKIP_BOOT_IN_DEV is true
  const skipBoot = import.meta.env.DEV && SKIP_BOOT_IN_DEV;
  const [isStartupComplete, setIsStartupComplete] = useState(skipBoot);

  // Load and apply theme on mount
  useEffect(() => {
    const settings = loadSettings();
    applyTheme(settings.theme);
  }, []);

  return (
    <AudioProvider>
    <VideoPlayerProvider>
    <IonApp>
      {/* Boot Sequence - skipped in dev mode for faster testing */}
      {!isStartupComplete && (
        <StartupSequence onComplete={() => setIsStartupComplete(true)} />
      )}

      {/* Main App - renders behind startup, revealed when complete */}
      <div style={{
        opacity: isStartupComplete ? 1 : 0,
        pointerEvents: isStartupComplete ? 'auto' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: isStartupComplete ? 1 : 0,
        transition: 'opacity 0.3s ease-in',
        visibility: isStartupComplete ? 'visible' : 'hidden'
      }}>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/gallery">
                <Gallery />
              </Route>
              <Route exact path="/treasury">
                <Treasury />
              </Route>
              <Route exact path="/bigpulp">
                <BigPulp />
              </Route>
              <Route exact path="/generator">
                <Generator />
              </Route>
              <Route exact path="/media">
                <Media />
              </Route>
              <Route exact path="/settings">
                <SettingsPage />
              </Route>
              <Route exact path="/admin/stats">
                <AdminStats />
              </Route>
              <Route exact path="/">
                <Redirect to="/gallery" />
              </Route>
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton tab="gallery" href="/gallery">
                <IonIcon aria-hidden="true" icon={images} />
              </IonTabButton>
              <IonTabButton tab="treasury" href="/treasury">
                <IonIcon aria-hidden="true" icon={wallet} />
              </IonTabButton>
              <IonTabButton tab="bigpulp" href="/bigpulp">
                <IonIcon aria-hidden="true" icon={bulb} />
              </IonTabButton>
              <IonTabButton tab="generator" href="/generator">
                <IonIcon aria-hidden="true" icon={colorPalette} />
              </IonTabButton>
              <IonTabButton tab="media" href="/media">
                <IonIcon aria-hidden="true" icon={musicalNotes} />
              </IonTabButton>
              <IonTabButton tab="settings" href="/settings">
                <IonIcon aria-hidden="true" icon={ellipsisVertical} />
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>

        {/* Global Floating Video Player - visible on all screens */}
        <GlobalFloatingPlayer />
      </div>
    </IonApp>
    </VideoPlayerProvider>
    </AudioProvider>
  );
};

export default App;
