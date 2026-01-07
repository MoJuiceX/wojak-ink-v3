import { useState, useEffect, useRef } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonSpinner,
  IonImg,
  IonChip,
  IonLabel,
  IonIcon,
  IonModal,
  IonSegment,
  IonSegmentButton
} from '@ionic/react';
import { sparkles, statsChart } from 'ionicons/icons';
import BigPulpCharacter from '../components/BigPulpCharacter';
import MarketHeatmap from '../components/MarketHeatmap';
import QuestionTree from '../components/QuestionTree';
import './BigPulp.css';

interface STierTrait {
  trait: string;
  category: string;
  count: number;
}

interface RarePairing {
  traits: string[];
  count: number;
}

interface NFTAnalysis {
  rank: number;
  percentile: number;
  tier: string;
  tier_label: string;
  base: string;
  base_rank: number;
  base_total: number;
  is_heritage_base: boolean;
  s_tier_traits: STierTrait[];
  s_tier_count: number;
  named_combos: string[];
  rare_pairings: RarePairing[];
  unique_count?: number;
  highlight?: string;
}

interface NFTTake {
  take: string;
  mood: 'bullish' | 'neutral' | 'bearish';
  didYouKnow?: string;
}

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface NFTMetadata {
  name: string;
  attributes: NFTAttribute[];
}

const BigPulp: React.FC = () => {
  const [nftId, setNftId] = useState('');
  const [searchedNftId, setSearchedNftId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<NFTAnalysis | null>(null);
  const [sentence, setSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisData, setAnalysisData] = useState<Record<string, NFTAnalysis> | null>(null);
  const [takesData, setTakesData] = useState<Record<string, NFTTake> | null>(null);
  const [metadataList, setMetadataList] = useState<NFTMetadata[] | null>(null);
  const [currentTake, setCurrentTake] = useState<NFTTake | null>(null);
  const [currentHeadTrait, setCurrentHeadTrait] = useState<string | undefined>(undefined);
  const [isTyping, setIsTyping] = useState(false);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [intelligenceTab, setIntelligenceTab] = useState<'heatmap' | 'questions' | 'traits'>('heatmap');
  const inputRef = useRef<HTMLInputElement>(null);

  // Hide keyboard accessory bar on iOS
  const hideAccessoryBar = async () => {
    try {
      await Keyboard.setAccessoryBarVisible({ isVisible: false });
    } catch (e) {
      // Not running in Capacitor or keyboard plugin not available
    }
  };

  const showAccessoryBar = async () => {
    try {
      await Keyboard.setAccessoryBarVisible({ isVisible: true });
    } catch (e) {
      // Not running in Capacitor or keyboard plugin not available
    }
  };

  // Welcome message when no NFT selected
  const welcomeMessage = "Yo! I'm BigPulp. Drop an NFT ID and I'll give you the real talk on what you're looking at. 🍊";

  // Load data files on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [analysisRes, takesRes, metadataRes] = await Promise.all([
          fetch('/assets/BigPulp/all_nft_analysis.json'),
          fetch('/assets/BigPulp/nft_takes.json'),
          fetch('/assets/nft-data/metadata.json')
        ]);
        const analysisJson = await analysisRes.json();
        const takesJson = await takesRes.json();
        const metadataJson = await metadataRes.json();
        setAnalysisData(analysisJson);
        setTakesData(takesJson);
        setMetadataList(metadataJson);
      } catch (err) {
        console.error('Failed to load BigPulp data:', err);
      }
    };
    loadData();
  }, []);

  const getNftImageUrl = (id: number) => {
    const paddedId = String(id).padStart(4, '0');
    return `https://bafybeigjkkonjzwwpopo4wn4gwrrvb7z3nwr2edj2554vx3avc5ietfjwq.ipfs.w3s.link/${paddedId}.png`;
  };

  const handleSearch = (directValue?: string) => {
    setError('');

    // Use direct value if provided, otherwise use state
    const searchValue = directValue || nftId;

    // parseInt handles leading zeros (0001 -> 1)
    const id = parseInt(searchValue, 10);
    if (isNaN(id) || id < 1 || id > 4200) {
      setError('Enter a valid NFT ID (0001-4200)');
      return;
    }

    setLoading(true);
    setIsTyping(true);

    // Small delay for UX
    setTimeout(() => {
      const nftAnalysis = analysisData?.[String(id)];
      const nftTake = takesData?.[String(id)];

      if (!nftAnalysis) {
        setError(`No data for NFT #${id}`);
        setLoading(false);
        setIsTyping(false);
        return;
      }

      setSearchedNftId(id);
      setAnalysis(nftAnalysis);
      setCurrentTake(nftTake || null);

      // Get head trait from metadata (metadata array is 0-indexed, NFT IDs start at 1)
      const nftMetadata = metadataList?.[id - 1];
      const headAttr = nftMetadata?.attributes?.find(attr => attr.trait_type === 'Head');
      setCurrentHeadTrait(headAttr?.value);

      // Use the BigPulp take, or fallback to analysis highlight
      if (nftTake?.take) {
        setSentence(nftTake.take);
      } else if (nftAnalysis.highlight) {
        setSentence(nftAnalysis.highlight);
      } else {
        setSentence(`This is Wojak #${id}. Ranked #${nftAnalysis.rank} out of 4200.`);
      }

      setLoading(false);
    }, 300);
  };

  const handleTypingComplete = () => {
    setIsTyping(false);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'legendary': return 'warning';
      case 'rare': return 'secondary';
      case 'uncommon': return 'success';
      default: return 'medium';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>BigPulp's Take</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="bigpulp-content">
        <div className="bigpulp-container">
          {/* Hang with BigPulp Button - First thing user sees */}
          <div className="intelligence-button-container">
            <p className="intelligence-hint">Market intel, trait values, heatmaps & more</p>
            <IonButton
              expand="block"
              className="intelligence-button"
              onClick={() => setShowIntelligence(true)}
            >
              <IonIcon icon={statsChart} slot="start" />
              Hang with BigPulp
              <IonIcon icon={sparkles} slot="end" />
            </IonButton>
          </div>

          {/* Search Input */}
          <div className="search-section-tight">
            <form
              className="search-input-group"
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                placeholder="0001 - 4200"
                value={nftId}
                maxLength={4}
                name="nftid"
                id="nftid-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-form-type="other"
                data-lpignore="true"
                data-1p-ignore="true"
                aria-autocomplete="none"
                onFocus={hideAccessoryBar}
                onBlur={showAccessoryBar}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                  setNftId(value);
                  // Auto-search when 4 digits entered
                  if (value.length === 4) {
                    const id = parseInt(value, 10);
                    if (!isNaN(id) && id >= 1 && id <= 4200) {
                      handleSearch(value);
                    }
                  }
                }}
                className="nft-input-native"
              />
              <IonButton className="ask-button" type="submit" disabled={loading || !analysisData}>
                {loading ? <IonSpinner name="crescent" /> : 'Ask'}
              </IonButton>
            </form>
            {error && <p className="error-text">{error}</p>}
          </div>

          {/* NFT Preview Card (shown after search) - directly under search */}
          {analysis && searchedNftId && (
            <div className="nft-preview-card">
              <IonImg
                src={getNftImageUrl(searchedNftId)}
                alt={`${analysis.base} #${searchedNftId}`}
                className="preview-image-square"
              />
              <div className="nft-info">
                <span className="nft-name">{analysis.base} #{searchedNftId}</span>
                <div className="nft-stats-row">
                  <span className="nft-rank">👑 {analysis.rank}</span>
                  <span className="nft-rarity">Top {Math.ceil(analysis.percentile)}%</span>
                </div>
                <div className="nft-rarity-bar">
                  <div
                    className="nft-rarity-fill"
                    style={{ width: `${100 - analysis.percentile}%` }}
                  />
                </div>
                <span className="nft-base-rank">#{analysis.base_rank} of {analysis.base_total} {analysis.base}s</span>
              </div>
            </div>
          )}

          {/* BigPulp Character with Speech Bubble */}
          <BigPulpCharacter
            message={sentence || welcomeMessage}
            isTyping={isTyping && !!sentence}
            headTrait={currentHeadTrait}
            onTypingComplete={handleTypingComplete}
          />

          {/* Additional NFT Stats (shown after search, below BigPulp) */}
          {analysis && searchedNftId && (
            <div className="results-section">
              {/* High Provenance Traits */}
              {analysis.s_tier_traits.length > 0 && (
                <div className="traits-compact">
                  <span className="traits-label">High Provenance:</span>
                  <div className="traits-list">
                    {analysis.s_tier_traits.map((trait, idx) => (
                      <span key={idx} className="trait-tag gold">
                        {trait.trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rare Combos */}
              {analysis.rare_pairings.length > 0 && (
                <div className="traits-compact">
                  <span className="traits-label">Rare Combos:</span>
                  <div className="traits-list">
                    {analysis.rare_pairings.slice(0, 2).map((pairing, idx) => (
                      <span key={idx} className="trait-tag">
                        {pairing.traits.join(' + ')} ({pairing.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Did You Know? callout */}
              {currentTake?.didYouKnow && (
                <div className="did-you-know">
                  <span className="dyk-label">💡 Did You Know?</span>
                  <p className="dyk-text">{currentTake.didYouKnow}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BigPulp Intelligence Modal */}
        <IonModal isOpen={showIntelligence} onDidDismiss={() => setShowIntelligence(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>BigPulp Intelligence</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowIntelligence(false)}>
                Close
              </IonButton>
            </IonToolbar>
            <IonToolbar>
              <IonSegment
                value={intelligenceTab}
                onIonChange={(e) => setIntelligenceTab(e.detail.value as any)}
              >
                <IonSegmentButton value="heatmap">
                  <IonLabel>Market</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="questions">
                  <IonLabel>Ask</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="traits">
                  <IonLabel>Traits</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonToolbar>
          </IonHeader>
          <IonContent className="intelligence-content">
            {intelligenceTab === 'heatmap' && (
              <MarketHeatmap
                onNftClick={(nftId) => {
                  setShowIntelligence(false);
                  setNftId(nftId);
                  setTimeout(() => handleSearch(), 100);
                }}
              />
            )}

            {intelligenceTab === 'questions' && (
              <QuestionTree
                onNftClick={(nftId) => {
                  setShowIntelligence(false);
                  setNftId(nftId);
                  setTimeout(() => handleSearch(), 100);
                }}
              />
            )}

            {intelligenceTab === 'traits' && (
              <div className="intelligence-container">
                <div className="coming-soon">
                  <span className="cs-icon">💰</span>
                  <h2>Trait Values</h2>
                  <p>Trait value analytics based on historical sales data coming soon.</p>
                  <div className="feature-preview">
                    <div className="feature-item">
                      <span>👑</span>
                      <span>Crown: ~3.2 XCH avg</span>
                    </div>
                    <div className="feature-item">
                      <span>🎭</span>
                      <span>Straitjacket: ~2.8 XCH</span>
                    </div>
                    <div className="feature-item">
                      <span>🧙</span>
                      <span>Wizard Hat: ~2.5 XCH</span>
                    </div>
                    <div className="feature-item">
                      <span>🤡</span>
                      <span>Clown: ~1.8 XCH</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default BigPulp;
