import { useState, useEffect, useMemo } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonImg,
  IonModal,
  IonButton,
  IonIcon
} from '@ionic/react';
import { close, shuffle } from 'ionicons/icons';
import './Gallery.css';

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  edition: number;
  attributes: NFTAttribute[];
}

// The 14 base characters in order
const BASE_ORDER = [
  'Wojak',
  'Soyjak',
  'Waifu',
  'Baddie',
  'Papa Tang',
  'Monkey Zoo',
  'Bepe Wojak',
  'Bepe Soyjak',
  'Bepe Waifu',
  'Bepe Baddie',
  'Alien Wojak',
  'Alien Soyjak',
  'Alien Waifu',
  'Alien Baddie'
];

// Trait categories and their tap zones (percentage-based)
const TRAIT_ZONES = [
  { name: 'Head', top: 0, bottom: 25, label: 'Head' },
  { name: 'Face Wear', top: 20, bottom: 40, label: 'Eyes' },
  { name: 'Mouth', top: 35, bottom: 50, label: 'Mouth' },
  { name: 'Clothes', top: 45, bottom: 80, label: 'Clothes' },
  { name: 'Background', top: 0, bottom: 100, isBorder: true, label: 'Background' }
];

const Gallery: React.FC = () => {
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [currentNft, setCurrentNft] = useState<NFTMetadata | null>(null);
  const [lastTappedZone, setLastTappedZone] = useState<string | null>(null);

  // Load NFT metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch('/assets/nft-data/metadata.json');
        const data: NFTMetadata[] = await response.json();
        setNfts(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load NFT metadata:', error);
        setLoading(false);
      }
    };
    loadMetadata();
  }, []);

  // Group NFTs by base character
  const nftsByBase = useMemo(() => {
    const grouped: Record<string, NFTMetadata[]> = {};
    BASE_ORDER.forEach(base => {
      grouped[base] = [];
    });

    nfts.forEach(nft => {
      const baseAttr = nft.attributes.find(a => a.trait_type === 'Base');
      if (baseAttr && grouped[baseAttr.value]) {
        grouped[baseAttr.value].push(nft);
      }
    });

    return grouped;
  }, [nfts]);

  // Get a sample NFT for each base (for the grid preview)
  const basePreviews = useMemo(() => {
    return BASE_ORDER.map(base => {
      const baseNfts = nftsByBase[base] || [];
      // Pick a random one for variety
      const randomIndex = Math.floor(Math.random() * baseNfts.length);
      return {
        base,
        nft: baseNfts[randomIndex] || null,
        count: baseNfts.length
      };
    });
  }, [nftsByBase]);

  // Handle base character selection
  const handleBaseSelect = (base: string) => {
    const baseNfts = nftsByBase[base] || [];
    if (baseNfts.length > 0) {
      const randomNft = baseNfts[Math.floor(Math.random() * baseNfts.length)];
      setCurrentNft(randomNft);
      setSelectedBase(base);
      setLastTappedZone(null);
    }
  };

  // Handle tap on character zone
  const handleZoneTap = (e: React.MouseEvent<HTMLDivElement>, zone: typeof TRAIT_ZONES[0]) => {
    if (!currentNft || !selectedBase) return;

    const baseNfts = nftsByBase[selectedBase] || [];
    if (baseNfts.length < 2) return;

    // Get current trait value for this zone
    const currentTrait = currentNft.attributes.find(a => a.trait_type === zone.name)?.value;

    // Find NFTs with a different trait in this category
    const differentTraitNfts = baseNfts.filter(nft => {
      const trait = nft.attributes.find(a => a.trait_type === zone.name)?.value;
      return trait && trait !== currentTrait;
    });

    if (differentTraitNfts.length > 0) {
      const randomNft = differentTraitNfts[Math.floor(Math.random() * differentTraitNfts.length)];
      setCurrentNft(randomNft);
      setLastTappedZone(zone.name);

      // Clear highlight after animation
      setTimeout(() => setLastTappedZone(null), 500);
    }
  };

  // Get random NFT from current base
  const handleShuffle = () => {
    if (!selectedBase) return;
    const baseNfts = nftsByBase[selectedBase] || [];
    if (baseNfts.length > 0) {
      const randomNft = baseNfts[Math.floor(Math.random() * baseNfts.length)];
      setCurrentNft(randomNft);
    }
  };

  // Get trait value from current NFT
  const getTraitValue = (traitType: string): string => {
    if (!currentNft) return '';
    const attr = currentNft.attributes.find(a => a.trait_type === traitType);
    return attr?.value || '';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Gallery</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading Wojaks...</p>
          </div>
        ) : (
          <div className="gallery-container">
            <p className="gallery-intro">Tap a character to explore</p>
            <div className="base-grid">
              {basePreviews.map(({ base, nft, count }) => (
                <div
                  key={base}
                  className="base-card"
                  onClick={() => handleBaseSelect(base)}
                >
                  {nft ? (
                    <IonImg
                      src={nft.image}
                      alt={base}
                      className="base-image"
                    />
                  ) : (
                    <div className="base-placeholder" />
                  )}
                  <div className="base-info">
                    <span className="base-name">{base}</span>
                    <span className="base-count">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Character Explorer Modal */}
        <IonModal isOpen={!!selectedBase} onDidDismiss={() => setSelectedBase(null)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{selectedBase}</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setSelectedBase(null)}>
                <IonIcon icon={close} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="explorer-content">
            {currentNft && (
              <div className="explorer-container">
                <p className="explorer-hint">Tap different areas to change traits</p>

                {/* Interactive Character */}
                <div className="character-wrapper">
                  <IonImg
                    src={currentNft.image}
                    alt={currentNft.name}
                    className="character-image"
                  />

                  {/* Tap Zones Overlay */}
                  <div className="tap-zones">
                    {TRAIT_ZONES.filter(z => !z.isBorder).map(zone => (
                      <div
                        key={zone.name}
                        className={`tap-zone ${lastTappedZone === zone.name ? 'tapped' : ''}`}
                        style={{
                          top: `${zone.top}%`,
                          height: `${zone.bottom - zone.top}%`
                        }}
                        onClick={(e) => handleZoneTap(e, zone)}
                      >
                        <span className="zone-label">{zone.label}</span>
                      </div>
                    ))}
                    {/* Background zone (tap edges) */}
                    <div
                      className={`tap-zone background-zone ${lastTappedZone === 'Background' ? 'tapped' : ''}`}
                      onClick={(e) => handleZoneTap(e, TRAIT_ZONES.find(z => z.name === 'Background')!)}
                    />
                  </div>
                </div>

                {/* Current Traits */}
                <div className="traits-display">
                  <div className="trait-chip">
                    <span className="trait-label">Head</span>
                    <span className="trait-value">{getTraitValue('Head')}</span>
                  </div>
                  <div className="trait-chip">
                    <span className="trait-label">Eyes</span>
                    <span className="trait-value">{getTraitValue('Face Wear')}</span>
                  </div>
                  <div className="trait-chip">
                    <span className="trait-label">Mouth</span>
                    <span className="trait-value">{getTraitValue('Mouth')}</span>
                  </div>
                  <div className="trait-chip">
                    <span className="trait-label">Clothes</span>
                    <span className="trait-value">{getTraitValue('Clothes')}</span>
                  </div>
                  <div className="trait-chip">
                    <span className="trait-label">Background</span>
                    <span className="trait-value">{getTraitValue('Background')}</span>
                  </div>
                </div>

                {/* NFT Info */}
                <div className="nft-details">
                  <span className="nft-name">{currentNft.name}</span>
                  <IonButton fill="outline" size="small" onClick={handleShuffle}>
                    <IonIcon icon={shuffle} slot="start" />
                    Random
                  </IonButton>
                </div>
              </div>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Gallery;
