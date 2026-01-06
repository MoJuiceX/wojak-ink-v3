import { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { images, wallet, bulb, colorPalette, gameController } from 'ionicons/icons';

// Pages
import Gallery from './pages/Gallery';
import Treasury from './pages/Treasury';
import BigPulp from './pages/BigPulp';
import Generator from './pages/Generator';
import Game from './pages/Game';

// Boot Sequence
import StartupSequence from './components/StartupSequence';

// Initialize Parse connection (temporarily disabled for debugging)
// import './services/parseClient';

// Prefetch treasury data on app start for instant loading
import { prefetchWalletData, preloadTokenLogos } from './services/treasuryApi';
prefetchWalletData();
preloadTokenLogos();

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

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const [isStartupComplete, setIsStartupComplete] = useState(false);

  return (
    <IonApp>
      {/* Boot Sequence - cannot be skipped */}
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
              <Route exact path="/game">
                <Game />
              </Route>
              <Route exact path="/">
                <Redirect to="/gallery" />
              </Route>
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton tab="gallery" href="/gallery">
                <IonIcon aria-hidden="true" icon={images} />
                <IonLabel>Gallery</IonLabel>
              </IonTabButton>
              <IonTabButton tab="treasury" href="/treasury">
                <IonIcon aria-hidden="true" icon={wallet} />
                <IonLabel>Treasury</IonLabel>
              </IonTabButton>
              <IonTabButton tab="bigpulp" href="/bigpulp">
                <IonIcon aria-hidden="true" icon={bulb} />
                <IonLabel>BigPulp</IonLabel>
              </IonTabButton>
              <IonTabButton tab="generator" href="/generator">
                <IonIcon aria-hidden="true" icon={colorPalette} />
                <IonLabel>Generator</IonLabel>
              </IonTabButton>
              <IonTabButton tab="game" href="/game">
                <IonIcon aria-hidden="true" icon={gameController} />
                <IonLabel>Game</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>
      </div>
    </IonApp>
  );
};

export default App;
