import { useState, useEffect } from 'react';
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
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from '@ionic/react';
import { close, openOutline, refreshOutline, copyOutline, helpCircleOutline } from 'ionicons/icons';
import {
  fetchWalletData,
  getWalletExplorerUrl,
  getCachedWalletData,
  isCacheStale,
  preloadTokenLogos,
  WalletData,
  NFTCollection
} from '../services/treasuryApi';
import { WALLET_DISPLAY, WALLET_ADDRESS } from '../services/treasuryConstants';
import CryptoBubbles from '../components/CryptoBubbles';
import './Treasury.css';

// Color palette for bubbles
const BUBBLE_COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336',
  '#00BCD4', '#E91E63', '#3F51B5', '#009688', '#FF5722',
  '#673AB7', '#8BC34A', '#FFC107', '#03A9F4', '#795548',
];

const Treasury: React.FC = () => {
  // Initialize with cached data immediately (no loading state if we have cache)
  const [walletData, setWalletData] = useState<WalletData | null>(() => getCachedWalletData());
  const [loading, setLoading] = useState(() => !getCachedWalletData());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection | null>(null);
  const [copied, setCopied] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [showInfoVideo, setShowInfoVideo] = useState(false);
  const [videoFadingOut, setVideoFadingOut] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [lastVideoIndex, setLastVideoIndex] = useState(-1);

  const treasuryVideos = [
    '/assets/Wojaks/goldenPapatang1.mp4',
    '/assets/Wojaks/goldenPapatang2.mp4',
    '/assets/Wojaks/goldenPapatang3.mp4',
    '/assets/Wojaks/goldenPapatang4.mp4',
  ];

  const openRandomVideo = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * treasuryVideos.length);
    } while (newIndex === lastVideoIndex && treasuryVideos.length > 1);
    setCurrentVideoIndex(newIndex);
    setLastVideoIndex(newIndex);
    setVideoFadingOut(false);
    setShowInfoVideo(true);
  };

  const closeVideo = () => {
    setVideoFadingOut(true);
    setTimeout(() => {
      setShowInfoVideo(false);
      setVideoFadingOut(false);
    }, 500);
  };

  const loadData = async (showLoading = true, forceRefresh = false) => {
    if (showLoading && !walletData) setLoading(true);
    if (!showLoading) setRefreshing(true);
    setError('');
    try {
      const data = await fetchWalletData(forceRefresh);
      setWalletData(data);
    } catch (err) {
      // Only show error if we don't have any data to display
      if (!walletData) {
        setError('Failed to load treasury data');
      }
      console.error(err);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    // Preload token logos immediately
    preloadTokenLogos();

    // If we have cached data, show it and refresh in background
    if (walletData && isCacheStale()) {
      loadData(false, true);
    } else if (!walletData) {
      // No cache, need to fetch
      loadData(true, true);
    }
  }, []);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadData(false);
    event.detail.complete();
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openExplorer = () => {
    window.open(getWalletExplorerUrl(), '_blank');
  };

  const formatUsd = (value: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 1) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(decimals);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Treasury</IonTitle>
          <IonButton slot="end" fill="clear" onClick={() => loadData()}>
            <IonIcon icon={refreshOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="treasury-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading treasury...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <IonButton onClick={() => loadData()}>Retry</IonButton>
          </div>
        ) : walletData ? (
          <div className="treasury-container">
            {/* Wallet Address */}
            <div className="wallet-card">
              <div className="wallet-header">
                <span className="wallet-label">Treasury Wallet</span>
                <div className="wallet-actions">
                  <button onClick={copyAddress} className="icon-btn">
                    <IonIcon icon={copyOutline} />
                  </button>
                  <button onClick={openExplorer} className="icon-btn">
                    <IonIcon icon={openOutline} />
                  </button>
                </div>
              </div>
              <div className="wallet-address" onClick={copyAddress}>
                {copied ? 'Copied!' : WALLET_DISPLAY}
              </div>
            </div>

            {/* Total Portfolio Value - Prominent Display */}
            <div className="total-portfolio-card">
              <div
                className="treasury-info-btn"
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
                onClick={openRandomVideo}
              >
                <IonIcon icon={helpCircleOutline} />
                {showInfoTooltip && (
                  <div className="treasury-info-tooltip">
                    What does the treasury wallet do? Tap to learn more.
                  </div>
                )}
              </div>
              <div className="total-portfolio-label">Total Treasury Value</div>
              <div className="total-portfolio-value">
                {formatUsd(
                  walletData.xch_balance * walletData.xch_price_usd +
                  walletData.total_token_value_usd,
                  0
                )}
              </div>
              <div className="total-portfolio-xch">
                ≈ {formatNumber(
                  (walletData.xch_balance * walletData.xch_price_usd + walletData.total_token_value_usd) / walletData.xch_price_usd,
                  0
                )} XCH
              </div>
              <div className="portfolio-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-label">XCH</span>
                  <span className="breakdown-value">{formatUsd(walletData.xch_balance * walletData.xch_price_usd, 0)}</span>
                </div>
                <div className="breakdown-divider">+</div>
                <div className="breakdown-item">
                  <span className="breakdown-label">CAT Tokens</span>
                  <span className="breakdown-value">{formatUsd(walletData.total_token_value_usd, 0)}</span>
                </div>
              </div>
              <div className="xch-price-tag">
                1 XCH = {formatUsd(walletData.xch_price_usd)}
              </div>
            </div>

            {/* Crypto Bubbles Visualization */}
            <div className="section">
              <CryptoBubbles
                data={[
                  // XCH as first bubble
                  {
                    id: 'xch',
                    symbol: 'XCH',
                    value: walletData.xch_balance * walletData.xch_price_usd,
                    color: '#4CAF50',
                    logo: '/assets/icons/icon_XCH.png',
                  },
                  // CAT tokens >= $1
                  ...walletData.tokens
                    .filter(t => t.value_usd >= 1)
                    .map((token, index) => ({
                      id: token.asset_id,
                      symbol: token.symbol,
                      value: token.value_usd,
                      color: token.color || BUBBLE_COLORS[(index + 1) % BUBBLE_COLORS.length],
                      logo: token.logo_url,
                    })),
                ]}
                width={360}
                height={340}
              />
              {/* Small tokens under $1 - shown statically */}
              {walletData.tokens.filter(t => t.value_usd > 0 && t.value_usd < 1).length > 0 && (
                <div className="small-tokens-section">
                                    <div className="small-tokens-list">
                    {walletData.tokens
                      .filter(t => t.value_usd > 0 && t.value_usd < 1)
                      .map(token => (
                        <div key={token.asset_id} className="small-token-item">
                          {token.logo_url && (
                            <img src={token.logo_url} alt={token.symbol} className="small-token-logo" />
                          )}
                          <span className="small-token-symbol">{token.symbol}</span>
                          <span className="small-token-value">{formatUsd(token.value_usd)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* NFT Collections */}
            {walletData.nft_collections.length > 0 && (
              <div className="section">
                <h3 className="section-title">
                  NFT Collections ({walletData.nft_collections.reduce((sum, c) => sum + c.count, 0)} NFTs)
                </h3>
                <div className="collections-grid">
                  {walletData.nft_collections.map((collection) => (
                    <div
                      key={collection.collection_id}
                      className="collection-card"
                      onClick={() => setSelectedCollection(collection)}
                    >
                      <div className="collection-preview">
                        <IonImg
                          src={collection.preview_image}
                          alt={collection.collection_name}
                          className="collection-image"
                        />
                        <div className="collection-count">{collection.count}</div>
                      </div>
                      <div className="collection-name">{collection.collection_name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="last-updated">
              Last updated: {walletData.last_updated.toLocaleTimeString()}
            </div>
          </div>
        ) : null}

        {/* NFT Collection Modal */}
        <IonModal isOpen={!!selectedCollection} onDidDismiss={() => setSelectedCollection(null)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{selectedCollection?.collection_name}</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setSelectedCollection(null)}>
                <IonIcon icon={close} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="nft-modal-content">
            {selectedCollection && (
              <div className="nft-grid">
                {selectedCollection.nfts.map((nft) => (
                  <div key={nft.nft_id} className="nft-card">
                    <IonImg src={nft.image_url} alt={nft.name} className="nft-image" />
                    <div className="nft-name">{nft.name}</div>
                  </div>
                ))}
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* Treasury Info Video Overlay */}
        {showInfoVideo && (
          <div className={`video-overlay ${videoFadingOut ? 'fading-out' : ''}`} onClick={closeVideo}>
            <div className={`video-box ${videoFadingOut ? 'fading-out' : ''}`} onClick={(e) => e.stopPropagation()}>
              <video
                key={currentVideoIndex}
                autoPlay
                playsInline
                className="info-video"
                onTimeUpdate={(e) => {
                  const video = e.currentTarget;
                  if (video.duration && video.currentTime >= video.duration - 1 && !videoFadingOut) {
                    closeVideo();
                  }
                }}
              >
                <source src={treasuryVideos[currentVideoIndex]} type="video/mp4" />
              </video>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Treasury;
