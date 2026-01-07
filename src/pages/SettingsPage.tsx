import { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonIcon,
  IonNote,
} from '@ionic/react';
import { musicalNotes, volumeHigh, sunny, moon, colorPalette } from 'ionicons/icons';
import { loadSettings, saveSettings, applyTheme, AppSettings, ThemeMode } from '../components/Settings';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);

    if (key === 'theme') {
      applyTheme(value);
    }
  };

  const themes: { id: ThemeMode; label: string; icon: string; color: string }[] = [
    { id: 'light', label: 'Light', icon: sunny, color: '#f5f5f5' },
    { id: 'dark', label: 'Dark', icon: moon, color: '#1a1a2e' },
    { id: 'orange', label: 'Orange', icon: colorPalette, color: '#ff8c00' },
    { id: 'green', label: 'Green', icon: colorPalette, color: '#2ecc71' },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="settings-page-content">
        {/* Audio Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">Audio</h3>
          <IonList inset>
            <IonItem>
              <IonIcon icon={musicalNotes} slot="start" className="settings-icon" />
              <IonLabel>
                <h2>Background Music</h2>
                <p>Play music while browsing</p>
              </IonLabel>
              <IonToggle
                checked={settings.backgroundMusic}
                onIonChange={(e) => handleSettingChange('backgroundMusic', e.detail.checked)}
              />
            </IonItem>
            <IonItem>
              <IonIcon icon={volumeHigh} slot="start" className="settings-icon" />
              <IonLabel>
                <h2>Sound Effects</h2>
                <p>UI sounds and game audio</p>
              </IonLabel>
              <IonToggle
                checked={settings.soundEffects}
                onIonChange={(e) => handleSettingChange('soundEffects', e.detail.checked)}
              />
            </IonItem>
          </IonList>
        </div>

        {/* Theme Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">Theme</h3>
          <div className="theme-grid">
            {themes.map(theme => (
              <div
                key={theme.id}
                className={`theme-option ${settings.theme === theme.id ? 'selected' : ''}`}
                data-theme={theme.id}
                onClick={() => handleSettingChange('theme', theme.id)}
              >
                <div
                  className="theme-preview"
                  style={{ backgroundColor: theme.color }}
                >
                  <IonIcon icon={theme.icon} />
                </div>
                <span className="theme-label">{theme.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="settings-footer">
          <IonNote>
            <p>Wojak.ink Mobile v1.0</p>
            <p>4200 Wojak Farmers Plot NFTs on Chia</p>
          </IonNote>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
