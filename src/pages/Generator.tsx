import { useState, useEffect, useMemo } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { shuffle, sparkles } from 'ionicons/icons';
import './Generator.css';

// Layer configuration (in render order, bottom to top)
const LAYERS = [
  { name: 'Background', folder: 'BACKGROUND', prefix: 'BACKGROUND_' },
  { name: 'Base', folder: 'BASE', prefix: 'BASE_' },
  { name: 'Clothes', folder: 'CLOTHES', prefix: 'CLOTHES_' },
  { name: 'Mouth', folder: 'MOUTH', prefix: 'MOUTH_' },
  { name: 'Eyes', folder: 'EYE', prefix: 'EYE_' },
  { name: 'Head', folder: 'HEAD', prefix: 'HEAD_' },
];

interface LayerImage {
  filename: string;
  displayName: string;
  path: string;
}

interface LayerData {
  name: string;
  folder: string;
  images: LayerImage[];
}

// Parse filename to get display name
function parseDisplayName(filename: string, prefix: string): string {
  // Remove prefix and extension
  let name = filename.replace(prefix, '').replace('.png', '');
  // Replace underscores and dashes with spaces
  name = name.replace(/[_-]/g, ' ').trim();
  // Remove trailing color variants like "blue", "red", etc. for cleaner display
  return name || 'Default';
}

const Generator: React.FC = () => {
  const [layerData, setLayerData] = useState<LayerData[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState<string>('Base');

  // Load layer images from manifest
  useEffect(() => {
    const loadLayers = async () => {
      try {
        const response = await fetch('/assets/wojak-layers/manifest.json');
        const manifest: Record<string, string[]> = await response.json();

        const layers: LayerData[] = LAYERS.map(layer => {
          const files = manifest[layer.folder] || [];
          const images: LayerImage[] = files.map(filePath => {
            const filename = filePath.split('/').pop() || filePath;
            return {
              filename,
              displayName: parseDisplayName(filename, layer.prefix),
              path: `/assets/wojak-layers/${layer.folder}/${filePath}`,
            };
          });

          // Sort alphabetically by display name
          images.sort((a, b) => a.displayName.localeCompare(b.displayName));

          return {
            name: layer.name,
            folder: layer.folder,
            images,
          };
        });

        setLayerData(layers);

        // Set default selections (first image of each layer, skip Background)
        const defaults: Record<string, string> = {};
        layers.forEach(layer => {
          if (layer.images.length > 0 && layer.name !== 'Background') {
            defaults[layer.name] = layer.images[0].path;
          }
        });
        setSelections(defaults);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load layer manifest:', error);
        setLoading(false);
      }
    };

    loadLayers();
  }, []);

  // Get current layer options
  const currentLayerData = useMemo(() => {
    return layerData.find(l => l.name === activeLayer);
  }, [layerData, activeLayer]);

  // Handle trait selection
  const handleSelect = (layerName: string, path: string) => {
    setSelections(prev => ({
      ...prev,
      [layerName]: path,
    }));
  };

  // Clear a layer
  const handleClear = (layerName: string) => {
    setSelections(prev => {
      const next = { ...prev };
      delete next[layerName];
      return next;
    });
  };

  // Randomize all layers
  const handleRandomize = () => {
    const newSelections: Record<string, string> = {};
    layerData.forEach(layer => {
      if (layer.images.length > 0) {
        const randomIndex = Math.floor(Math.random() * layer.images.length);
        newSelections[layer.name] = layer.images[randomIndex].path;
      }
    });
    setSelections(newSelections);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Wojak Generator</IonTitle>
          <IonButton slot="end" fill="clear" onClick={handleRandomize}>
            <IonIcon icon={shuffle} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="generator-content">
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading layers...</p>
          </div>
        ) : (
          <div className="generator-container">
            {/* Preview */}
            <div className="preview-section">
              <div className="wojak-preview">
                {LAYERS.map(layer => (
                  selections[layer.name] && (
                    <img
                      key={layer.name}
                      src={selections[layer.name]}
                      alt={layer.name}
                      className="layer-image"
                      style={{ zIndex: LAYERS.findIndex(l => l.name === layer.name) }}
                    />
                  )
                ))}
                {Object.keys(selections).length === 0 && (
                  <div className="empty-preview">
                    <IonIcon icon={sparkles} />
                    <p>Select layers below</p>
                  </div>
                )}
              </div>
            </div>

            {/* Layer Tabs */}
            <div className="layer-tabs">
              {LAYERS.map(layer => (
                <button
                  key={layer.name}
                  className={`layer-tab ${activeLayer === layer.name ? 'active' : ''} ${selections[layer.name] ? 'has-selection' : ''}`}
                  onClick={() => setActiveLayer(layer.name)}
                >
                  {layer.name}
                </button>
              ))}
            </div>

            {/* Trait Selector */}
            <div className="trait-selector">
              <div className="trait-header">
                <span className="trait-title">{activeLayer}</span>
                {selections[activeLayer] && (
                  <button className="clear-btn" onClick={() => handleClear(activeLayer)}>
                    Clear
                  </button>
                )}
              </div>
              <div className="trait-grid">
                {currentLayerData?.images.map(image => (
                  <div
                    key={image.filename}
                    className={`trait-option ${selections[activeLayer] === image.path ? 'selected' : ''}`}
                    onClick={() => handleSelect(activeLayer, image.path)}
                  >
                    <img src={image.path} alt={image.displayName} />
                    <span className="trait-name">{image.displayName}</span>
                  </div>
                ))}
                {currentLayerData?.images.length === 0 && (
                  <p className="no-traits">No traits available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Generator;
