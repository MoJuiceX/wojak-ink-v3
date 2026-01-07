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
  IonButtons,
  IonIcon,
  IonLabel,
  IonChip,
  IonSegment,
  IonSegmentButton,
  IonToast
} from '@ionic/react';
import { close, shuffle, openOutline, informationCircle, time, pricetag, logoUsd, swapHorizontal, chevronBack, chevronForward } from 'ionicons/icons';
import {
  isReady,
  getNextRandom,
  isPreloaded,
  getNextInSequence,
  getPrevInSequence
} from '../services/galleryPreloader';
import { getCachedListings, NFTListing, getMintGardenNftUrl, fetchNftHistory, NftEvent } from '../services/marketApi';
import { getCachedXchPrice } from '../services/treasuryApi';
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

// The 14 base characters with fixed preview NFT IDs for caching
// Local previews: /assets/gallery-previews/{base-name}.png (kebab-case)
const BASE_CONFIG: { name: string; previewId: number }[] = [
  { name: 'Wojak', previewId: 1 },
  { name: 'Soyjak', previewId: 301 },
  { name: 'Waifu', previewId: 601 },
  { name: 'Baddie', previewId: 901 },
  { name: 'Papa Tang', previewId: 1201 },
  { name: 'Monkey Zoo', previewId: 1501 },
  { name: 'Bepe Wojak', previewId: 1801 },
  { name: 'Bepe Soyjak', previewId: 2101 },
  { name: 'Bepe Waifu', previewId: 2401 },
  { name: 'Bepe Baddie', previewId: 2701 },
  { name: 'Alien Wojak', previewId: 3001 },
  { name: 'Alien Soyjak', previewId: 3301 },
  { name: 'Alien Waifu', previewId: 3601 },
  { name: 'Alien Baddie', previewId: 3901 },
];

const BASE_ORDER = BASE_CONFIG.map(b => b.name);

// IPFS CID for the NFT collection
const IPFS_CID = 'bafybeigjkkonjzwwpopo4wn4gwrrvb7z3nwr2edj2554vx3avc5ietfjwq';

// Use w3s.link gateway
const getIpfsUrl = (id: number) => {
  const paddedId = String(id).padStart(4, '0');
  return `https://${IPFS_CID}.ipfs.w3s.link/${paddedId}.png`;
};

// Get local preview path (kebab-case)
const getLocalPreviewPath = (baseName: string) => {
  const kebab = baseName.toLowerCase().replace(/\s+/g, '-');
  return `/assets/gallery-previews/${kebab}.png`;
};


// Extract NFT ID from name (e.g., "Wojak #0001" -> 1)
const getNftId = (name: string): number => {
  const match = name.match(/#(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// Sale history item interface (matches MintGarden event types)
interface SaleHistoryItem {
  type: 'mint' | 'transfer' | 'trade' | 'burn';
  date: Date;
  price?: number;
  priceUsd?: number;
}

const Gallery: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [currentNft, setCurrentNft] = useState<NFTMetadata | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  // TODO: Will be populated from API later
  const [rarityRank, setRarityRank] = useState<number | null>(null);
  // Filter to show only listed NFTs
  const [showListedOnly, setShowListedOnly] = useState(false);
  // Current NFT listing info (from real market data)
  const [currentListing, setCurrentListing] = useState<NFTListing | null>(null);
  // XCH price for USD conversion
  const [xchPriceUsd] = useState<number>(getCachedXchPrice());
  // Listings map for quick lookup
  const [listingsMap, setListingsMap] = useState<Map<string, NFTListing>>(new Map());
  // Info card tab state: 'main' | 'metadata' | 'history'
  const [infoTab, setInfoTab] = useState<'main' | 'metadata' | 'history'>('main');
  // History data from MintGarden API
  const [saleHistory, setSaleHistory] = useState<SaleHistoryItem[]>([]);
  // Track if history has been loaded for current NFT (for lazy loading)
  const [historyLoadedForNft, setHistoryLoadedForNft] = useState<number | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  // Swipe mode: 'id' or 'rarity' for All mode, 'price_asc' or 'price_desc' for Listed mode
  const [swipeMode, setSwipeMode] = useState<'id' | 'rarity' | 'price_asc' | 'price_desc'>('id');
  // Rarity data for rarity-based navigation
  const [rarityData, setRarityData] = useState<{ id: number; rank: number }[]>([]);
  // Sorted listings by price for Listed mode navigation
  const [sortedListings, setSortedListings] = useState<NFTListing[]>([]);

  // Swipe tracking - horizontal
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  // Swipe tracking - vertical
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Swipe hint animation
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  // Toast for market status
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load rarity data on mount
  useEffect(() => {
    const loadRarityData = async () => {
      try {
        const response = await fetch('/assets/BigPulp/all_nft_analysis.json');
        const data = await response.json();
        const rarityList: { id: number; rank: number }[] = [];
        for (const [id, analysis] of Object.entries(data)) {
          rarityList.push({ id: parseInt(id), rank: (analysis as any).rank });
        }
        // Sort by rank (rarest first)
        rarityList.sort((a, b) => a.rank - b.rank);
        setRarityData(rarityList);
      } catch (err) {
        console.error('Failed to load rarity data:', err);
      }
    };
    loadRarityData();
  }, []);

  // Load listings data on mount
  useEffect(() => {
    const listings = getCachedListings();
    if (listings) {
      const map = new Map<string, NFTListing>();
      listings.forEach(l => map.set(l.nftId, l));
      setListingsMap(map);
      // Also create sorted list by price (cheapest first)
      const sorted = [...listings].sort((a, b) => a.priceXch - b.priceXch);
      setSortedListings(sorted);
    }
  }, []);

  // Wait for preloader service to be ready
  useEffect(() => {
    const checkReady = () => {
      if (isReady()) {
        setLoading(false);
      } else {
        setTimeout(checkReady, 100);
      }
    };
    checkReady();
  }, []);

  // Track which local previews are available
  const [localPreviewsAvailable, setLocalPreviewsAvailable] = useState<Record<string, boolean>>({});

  // Check for local preview images on mount
  useEffect(() => {
    BASE_CONFIG.forEach(({ name }) => {
      const img = new Image();
      const path = getLocalPreviewPath(name);
      img.onload = () => setLocalPreviewsAvailable(prev => ({ ...prev, [name]: true }));
      img.onerror = () => setLocalPreviewsAvailable(prev => ({ ...prev, [name]: false }));
      img.src = path;
    });
  }, []);

  // Get preview image URL for each base (local if available, fixed IPFS otherwise)
  const basePreviews = useMemo(() => {
    return BASE_CONFIG.map(({ name, previewId }) => {
      const useLocal = localPreviewsAvailable[name];
      const previewUrl = useLocal
        ? getLocalPreviewPath(name)
        : getIpfsUrl(previewId);
      return {
        base: name,
        previewUrl,
      };
    });
  }, [localPreviewsAvailable]);

  // Check if NFT is listed using real market data
  const checkIfListed = (nftId: number): NFTListing | null => {
    return listingsMap.get(String(nftId)) || null;
  };

  // Fetch real history from MintGarden API (lazy-loaded when History tab is clicked)
  const loadNftHistory = async (nftId: number, launcherId?: string) => {
    // Skip if already loaded for this NFT
    if (historyLoadedForNft === nftId) return;

    setHistoryLoading(true);
    try {
      // Try to get launcher ID from listing if not provided
      const listing = listingsMap.get(String(nftId));
      const knownLauncherId = launcherId || listing?.launcherBech32;

      const events = await fetchNftHistory(nftId, knownLauncherId);
      const eventTypeMap: Record<number, 'mint' | 'transfer' | 'trade' | 'burn'> = {
        0: 'mint',
        1: 'transfer',
        2: 'trade',
        3: 'burn'
      };

      const history: SaleHistoryItem[] = events.map((event: NftEvent) => ({
        type: eventTypeMap[event.type] || 'transfer',
        date: new Date(event.timestamp),
        price: event.xch_price || undefined,
        priceUsd: event.xch_price ? event.xch_price * xchPriceUsd : undefined
      }));

      // Sort by date (oldest first)
      history.sort((a, b) => a.date.getTime() - b.date.getTime());
      setSaleHistory(history);
      setHistoryLoadedForNft(nftId);
    } catch (error) {
      console.error('Failed to load NFT history:', error);
      setSaleHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Lazy load history when History tab is clicked
  useEffect(() => {
    if (infoTab === 'history' && currentNft) {
      const nftId = getNftId(currentNft.name);
      if (historyLoadedForNft !== nftId) {
        loadNftHistory(nftId);
      }
    }
  }, [infoTab, currentNft?.name]);

  // Handle base character selection - use preloaded queue
  const handleBaseSelect = (base: string) => {
    setShowListedOnly(false); // Reset filter when selecting new base
    setInfoTab('main'); // Reset to main tab
    const nft = getNextRandom(base);
    if (nft) {
      const alreadyLoaded = isPreloaded(nft.image);
      setImageLoading(!alreadyLoaded);
      setCurrentNft(nft);
      setSelectedBase(base);
      const nftId = getNftId(nft.name);
      // Get real rarity rank
      const rarityInfo = rarityData.find(r => r.id === nftId);
      setRarityRank(rarityInfo?.rank || null);
      // Check listing status from real market data
      setCurrentListing(checkIfListed(nftId));
      // Clear history (will be lazy-loaded when History tab is clicked)
      setSaleHistory([]);
      setHistoryLoadedForNft(null);

      // Show swipe hint animation
      setShowSwipeHint(true);
      setTimeout(() => setShowSwipeHint(false), 2500);
    }
  };

  
  // Loading state for MintGarden button
  const [mintGardenLoading, setMintGardenLoading] = useState(false);

  // Open MintGarden page for this NFT (fetches direct link)
  const openMintGarden = async () => {
    if (!currentNft || mintGardenLoading) return;
    const nftId = getNftId(currentNft.name);

    setMintGardenLoading(true);
    try {
      const url = await getMintGardenNftUrl(nftId);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to get MintGarden URL:', error);
      // Fallback to collection search
      window.open(`https://mintgarden.io/collections/wojak-farmers-plot-col1xstgvpgp0cl4uepv7t02dvrnrrqm6y4cqvp3urc5y5kd5q9fpafqjfh4a9?search=${nftId}`, '_blank');
    } finally {
      setMintGardenLoading(false);
    }
  };

  // Navigate to next NFT in sequence (swipe left)
  const goToNext = () => {
    if (!selectedBase || !currentNft) return;
    setInfoTab('main');

    let nft = getNextInSequence(selectedBase, currentNft.edition);
    const startEdition = currentNft.edition;
    let attempts = 0;
    const maxAttempts = 300; // Prevent infinite loop

    // If in Listed mode, skip non-listed NFTs
    while (showListedOnly && nft && attempts < maxAttempts) {
      const nftId = getNftId(nft.name);
      if (checkIfListed(nftId) || nft.edition === startEdition) break;
      nft = getNextInSequence(selectedBase, nft.edition);
      attempts++;
    }

    if (nft) {
      const alreadyLoaded = isPreloaded(nft.image);
      setImageLoading(!alreadyLoaded);
      setCurrentNft(nft);
      const nftId = getNftId(nft.name);
      const rarityInfo = rarityData.find(r => r.id === nftId);
      setRarityRank(rarityInfo?.rank || null);
      setCurrentListing(checkIfListed(nftId));
      // Clear history (will be lazy-loaded when History tab is clicked)
      setSaleHistory([]);
      setHistoryLoadedForNft(null);
    }
  };

  // Navigate to previous NFT in sequence (swipe right)
  const goToPrev = () => {
    if (!selectedBase || !currentNft) return;
    setInfoTab('main');

    let nft = getPrevInSequence(selectedBase, currentNft.edition);
    const startEdition = currentNft.edition;
    let attempts = 0;
    const maxAttempts = 300;

    // If in Listed mode, skip non-listed NFTs
    while (showListedOnly && nft && attempts < maxAttempts) {
      const nftId = getNftId(nft.name);
      if (checkIfListed(nftId) || nft.edition === startEdition) break;
      nft = getPrevInSequence(selectedBase, nft.edition);
      attempts++;
    }

    if (nft) {
      const alreadyLoaded = isPreloaded(nft.image);
      setImageLoading(!alreadyLoaded);
      setCurrentNft(nft);
      const nftId = getNftId(nft.name);
      const rarityInfo = rarityData.find(r => r.id === nftId);
      setRarityRank(rarityInfo?.rank || null);
      setCurrentListing(checkIfListed(nftId));
      // Clear history (will be lazy-loaded when History tab is clicked)
      setSaleHistory([]);
      setHistoryLoadedForNft(null);
    }
  };

  // Navigate to rarer NFT (swipe in rarity mode)
  const goToRarer = () => {
    if (!currentNft || rarityData.length === 0) return;
    setInfoTab('main');
    const currentId = getNftId(currentNft.name);
    let currentIndex = rarityData.findIndex(r => r.id === currentId);
    if (currentIndex === -1) currentIndex = 0;

    const startIndex = currentIndex;
    let attempts = 0;
    const maxAttempts = rarityData.length;

    // Find next rarer NFT (if Listed mode, must be listed)
    do {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : rarityData.length - 1;
      const candidate = rarityData[currentIndex];
      if (!showListedOnly || checkIfListed(candidate.id)) {
        loadNftById(candidate.id, candidate.rank);
        return;
      }
      attempts++;
    } while (currentIndex !== startIndex && attempts < maxAttempts);
  };

  // Navigate to more common NFT (swipe in rarity mode)
  const goToMoreCommon = () => {
    if (!currentNft || rarityData.length === 0) return;
    setInfoTab('main');
    const currentId = getNftId(currentNft.name);
    let currentIndex = rarityData.findIndex(r => r.id === currentId);
    if (currentIndex === -1) currentIndex = rarityData.length - 1;

    const startIndex = currentIndex;
    let attempts = 0;
    const maxAttempts = rarityData.length;

    // Find next more common NFT (if Listed mode, must be listed)
    do {
      currentIndex = currentIndex < rarityData.length - 1 ? currentIndex + 1 : 0;
      const candidate = rarityData[currentIndex];
      if (!showListedOnly || checkIfListed(candidate.id)) {
        loadNftById(candidate.id, candidate.rank);
        return;
      }
      attempts++;
    } while (currentIndex !== startIndex && attempts < maxAttempts);
  };

  // Helper to load NFT by ID
  const loadNftById = async (nftId: number, rank: number) => {
    try {
      const response = await fetch('/assets/nft-data/metadata.json');
      const allNfts = await response.json();
      const nft = allNfts.find((n: NFTMetadata) => n.edition === nftId);
      if (nft) {
        const alreadyLoaded = isPreloaded(nft.image);
        setImageLoading(!alreadyLoaded);
        setCurrentNft(nft);
        setRarityRank(rank);
        setCurrentListing(checkIfListed(nftId));
        // Clear history (will be lazy-loaded when History tab is clicked)
        setSaleHistory([]);
        setHistoryLoadedForNft(null);
      }
    } catch (err) {
      console.error('Failed to load NFT:', err);
    }
  };

  // Helper to load listed NFT by ID (for price-based navigation)
  const loadListedNftById = async (nftId: number) => {
    try {
      const response = await fetch('/assets/nft-data/metadata.json');
      const allNfts = await response.json();
      const nft = allNfts.find((n: NFTMetadata) => n.edition === nftId);
      if (nft) {
        const alreadyLoaded = isPreloaded(nft.image);
        setImageLoading(!alreadyLoaded);
        setCurrentNft(nft);
        setInfoTab('main');
        // Get rarity rank
        const rarityInfo = rarityData.find(r => r.id === nftId);
        setRarityRank(rarityInfo?.rank || null);
        // Get listing info
        const listing = listingsMap.get(String(nftId)) || null;
        setCurrentListing(listing);
        // Clear history (will be lazy-loaded when History tab is clicked)
        setSaleHistory([]);
        setHistoryLoadedForNft(null);
      }
    } catch (err) {
      console.error('Failed to load listed NFT:', err);
    }
  };

  // Navigate to cheaper NFT in sorted listings
  const goToCheaper = () => {
    if (!currentNft || sortedListings.length === 0) return;
    const currentId = getNftId(currentNft.name);
    const currentIndex = sortedListings.findIndex(l => l.nftId === String(currentId));

    if (currentIndex === -1) {
      // Current NFT not in listings, go to cheapest
      loadListedNftById(parseInt(sortedListings[0].nftId));
      return;
    }

    // Go to cheaper (lower index = cheaper)
    const newIndex = currentIndex > 0 ? currentIndex - 1 : sortedListings.length - 1;
    loadListedNftById(parseInt(sortedListings[newIndex].nftId));
  };

  // Navigate to more expensive NFT in sorted listings
  const goToExpensive = () => {
    if (!currentNft || sortedListings.length === 0) return;
    const currentId = getNftId(currentNft.name);
    const currentIndex = sortedListings.findIndex(l => l.nftId === String(currentId));

    if (currentIndex === -1) {
      // Current NFT not in listings, go to most expensive
      loadListedNftById(parseInt(sortedListings[sortedListings.length - 1].nftId));
      return;
    }

    // Go to more expensive (higher index = more expensive)
    const newIndex = currentIndex < sortedListings.length - 1 ? currentIndex + 1 : 0;
    loadListedNftById(parseInt(sortedListings[newIndex].nftId));
  };

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchEndY(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStartX) return;

    const distanceX = touchStartX - (touchEndX || touchStartX);

    // All modes use horizontal swipes
    if (Math.abs(distanceX) > minSwipeDistance) {
      if (swipeMode === 'id') {
        // ID mode: swipe through NFT IDs
        if (distanceX > 0) {
          goToNext(); // Swipe left = next ID
        } else {
          goToPrev(); // Swipe right = previous ID
        }
      } else if (swipeMode === 'rarity') {
        // Rarity mode: swipe through rarity ranks (same direction as ID)
        if (distanceX > 0) {
          goToMoreCommon(); // Swipe left = more common (next in rank)
        } else {
          goToRarer(); // Swipe right = rarer (previous in rank)
        }
      } else if (swipeMode === 'price_asc') {
        // Price ascending mode: swipe through listings cheapest first
        if (distanceX > 0) {
          goToExpensive(); // Swipe left = more expensive
        } else {
          goToCheaper(); // Swipe right = cheaper
        }
      } else if (swipeMode === 'price_desc') {
        // Price descending mode: swipe through listings expensive first
        if (distanceX > 0) {
          goToCheaper(); // Swipe left = cheaper
        } else {
          goToExpensive(); // Swipe right = more expensive
        }
      }
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading Wojaks...</p>
          </div>
        ) : (
          <div className="gallery-container">
            <div className="base-grid">
              {basePreviews.map(({ base, previewUrl }) => (
                <div
                  key={base}
                  className="base-card"
                  onClick={() => handleBaseSelect(base)}
                >
                  <IonImg
                    src={previewUrl}
                    alt={base}
                    className="base-image"
                  />
                  <div className="base-info">
                    <span className="base-name">{base}</span>
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
              <IonButtons slot="start">
                <IonButton onClick={() => {
                  if (!selectedBase) return;
                  setInfoTab('main');

                  let attempts = 0;
                  const maxAttempts = showListedOnly ? 50 : 1;

                  while (attempts < maxAttempts) {
                    const nft = getNextRandom(selectedBase);
                    if (nft) {
                      const nftId = getNftId(nft.name);
                      const listing = checkIfListed(nftId);

                      if (!showListedOnly || listing) {
                        const alreadyLoaded = isPreloaded(nft.image);
                        setImageLoading(!alreadyLoaded);
                        setCurrentNft(nft);
                        const rarityInfo = rarityData.find(r => r.id === nftId);
                        setRarityRank(rarityInfo?.rank || null);
                        setCurrentListing(listing);
                        // Clear history (will be lazy-loaded when History tab is clicked)
                        setSaleHistory([]);
                        setHistoryLoadedForNft(null);
                        return;
                      }
                    }
                    attempts++;
                  }
                }}>
                  <IonIcon icon={shuffle} />
                </IonButton>
              </IonButtons>
              <IonTitle>{selectedBase}</IonTitle>
              <IonButtons slot="end">
                {/* Sort Toggle */}
                <IonButton
                  className="sort-toggle-btn"
                  onClick={() => {
                    if (showListedOnly) {
                      const listedModes: ('id' | 'rarity' | 'price_asc' | 'price_desc')[] = ['id', 'rarity', 'price_asc', 'price_desc'];
                      const currentIndex = listedModes.indexOf(swipeMode);
                      const nextIndex = (currentIndex + 1) % listedModes.length;
                      setSwipeMode(listedModes[nextIndex]);
                    } else {
                      setSwipeMode(swipeMode === 'id' ? 'rarity' : 'id');
                    }
                  }}
                >
                  <IonIcon icon={swapHorizontal} />
                  <span className="sort-btn-label">
                    {swipeMode === 'id' ? 'ID' : swipeMode === 'rarity' ? '👑' : swipeMode === 'price_asc' ? '💰↓' : '💰↑'}
                  </span>
                </IonButton>
                <IonButton onClick={() => setSelectedBase(null)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="explorer-content">
            {currentNft && (
              <div className="explorer-container">
                {/* NFT Image - swipeable and tappable */}
                <div
                  className="character-wrapper"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {imageLoading && (
                    <div className="character-loading">
                      <IonSpinner name="crescent" />
                    </div>
                  )}
                  <IonImg
                    src={currentNft.image}
                    alt={currentNft.name}
                    className={`character-image ${imageLoading ? 'loading' : ''}`}
                    onIonImgDidLoad={() => setImageLoading(false)}
                  />

                  {/* Tap zones for left/right navigation */}
                  <div
                    className="tap-zone tap-zone-left"
                    onClick={() => {
                      if (swipeMode === 'id') {
                        goToPrev();
                      } else if (swipeMode === 'rarity') {
                        goToRarer();
                      } else if (swipeMode === 'price_asc') {
                        goToCheaper();
                      } else {
                        goToExpensive();
                      }
                    }}
                  >
                    <IonIcon icon={chevronBack} className="tap-zone-icon" />
                  </div>
                  <div
                    className="tap-zone tap-zone-right"
                    onClick={() => {
                      if (swipeMode === 'id') {
                        goToNext();
                      } else if (swipeMode === 'rarity') {
                        goToMoreCommon();
                      } else if (swipeMode === 'price_asc') {
                        goToExpensive();
                      } else {
                        goToCheaper();
                      }
                    }}
                  >
                    <IonIcon icon={chevronForward} className="tap-zone-icon" />
                  </div>

                  {/* Swipe hint arrows */}
                  {showSwipeHint && (
                    <div className="swipe-hint">
                      <div className="swipe-hint-arrow left">
                        <IonIcon icon={chevronBack} />
                      </div>
                      <div className="swipe-hint-arrow right">
                        <IonIcon icon={chevronForward} />
                      </div>
                    </div>
                  )}
                </div>

                {/* All/Listed Filter Pills */}
                <div className="filter-pills">
                  <button
                    className={`filter-pill ${!showListedOnly ? 'active' : ''}`}
                    onClick={() => {
                      setShowListedOnly(false);
                      if (swipeMode === 'price_asc' || swipeMode === 'price_desc') {
                        setSwipeMode('id');
                      }
                    }}
                  >
                    All
                  </button>
                  <button
                    className={`filter-pill ${showListedOnly ? 'active' : ''}`}
                    onClick={() => {
                      setShowListedOnly(true);
                      if (currentNft) {
                        const currentId = getNftId(currentNft.name);
                        const isCurrentListed = checkIfListed(currentId);
                        if (!isCurrentListed && sortedListings.length > 0) {
                          const cheapest = sortedListings[0];
                          loadListedNftById(parseInt(cheapest.nftId));
                        }
                      }
                    }}
                  >
                    <IonIcon icon={pricetag} />
                    Listed
                  </button>
                </div>

                {/* NFT Info Card with sliding tabs */}
                <div className="nft-info-card">
                  <div className="info-card-slider">
                    {/* Main Info Tab */}
                    <div className={`info-tab-content ${infoTab === 'main' ? 'active' : 'slide-left'}`}>
                      <div className="nft-name-row">
                        <div className="nft-name-large">{currentNft.name}</div>
                        <div className="nft-action-buttons">
                          <IonButton fill="clear" size="small" onClick={openMintGarden} disabled={mintGardenLoading}>
                            {mintGardenLoading ? <IonSpinner name="crescent" /> : <IonIcon icon={openOutline} />}
                          </IonButton>
                          <IonButton fill="clear" size="small" onClick={() => setInfoTab('metadata')}>
                            <IonIcon icon={informationCircle} />
                          </IonButton>
                          <IonButton fill="clear" size="small" onClick={() => setInfoTab('history')}>
                            <IonIcon icon={time} />
                          </IonButton>
                        </div>
                      </div>

                      <div className="nft-stats-row">
                        <div className="nft-stat">
                          <span className="stat-value">👑{rarityRank || '—'} <span className="stat-total">/ 4200</span></span>
                        </div>

                        {/* Market Status - Show price if listed, crossed dollar if not */}
                        {currentListing ? (
                          <div className="market-price">
                            <span className="price-xch">{currentListing.priceXch.toFixed(2)} XCH</span>
                            <span className="price-usd">${(currentListing.priceXch * xchPriceUsd).toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="market-icon not-listed" onClick={() => setToastMessage('Not Listed')}>
                            <IonIcon icon={logoUsd} />
                            <span className="crossed" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Tab */}
                    <div className={`info-tab-content ${infoTab === 'metadata' ? 'active' : 'slide-right'}`}>
                      <div className="tab-header">
                        <IonButton fill="clear" size="small" onClick={() => setInfoTab('main')}>
                          <IonIcon icon={close} />
                        </IonButton>
                        <span className="tab-title">Traits</span>
                        <span className="trait-count">{currentNft.attributes.length}</span>
                      </div>
                      <div className="traits-list">
                        {currentNft.attributes.map((attr, idx) => (
                          <div key={idx} className="trait-item">
                            <span className="trait-type">{attr.trait_type}</span>
                            <span className="trait-value">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* History Tab */}
                    <div className={`info-tab-content ${infoTab === 'history' ? 'active' : 'slide-right'}`}>
                      <div className="tab-header">
                        <IonButton fill="clear" size="small" onClick={() => setInfoTab('main')}>
                          <IonIcon icon={close} />
                        </IonButton>
                        <span className="tab-title">History</span>
                      </div>
                      <div className="history-list">
                        {historyLoading ? (
                          <div className="no-sales"><IonSpinner name="crescent" /> Loading history...</div>
                        ) : saleHistory.length === 0 ? (
                          <div className="no-sales">No history found</div>
                        ) : (
                          <>
                            {saleHistory
                              .filter(item => item.type === 'mint' || item.type === 'trade')
                              .map((item, idx) => (
                                <div key={idx} className="history-item">
                                  <IonChip
                                    color={item.type === 'mint' ? 'success' : 'primary'}
                                    className="history-chip"
                                  >
                                    {item.type === 'mint' ? 'Minted' : 'Sale'}
                                  </IonChip>
                                  <div className="history-details">
                                    <span className="history-date">
                                      {item.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                    {item.price && item.price > 0 && (
                                      <span className="history-price">{item.price.toFixed(2)} XCH</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Toast for market status */}
          <IonToast
            isOpen={!!toastMessage}
            message={toastMessage || ''}
            duration={1500}
            position="bottom"
            onDidDismiss={() => setToastMessage(null)}
          />
          </IonContent>
        </IonModal>

      </IonContent>
    </IonPage>
  );
};

export default Gallery;
