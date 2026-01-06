import { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
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

interface NFTSentences {
  variants: string[];
}

const BigPulp: React.FC = () => {
  const [nftId, setNftId] = useState('');
  const [searchedNftId, setSearchedNftId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<NFTAnalysis | null>(null);
  const [sentence, setSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisData, setAnalysisData] = useState<Record<string, NFTAnalysis> | null>(null);
  const [sentencesData, setSentencesData] = useState<Record<string, NFTSentences> | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [intelligenceTab, setIntelligenceTab] = useState<'heatmap' | 'questions' | 'traits'>('heatmap');

  // Welcome message when no NFT selected
  const welcomeMessage = "Yo! I'm BigPulp. Drop an NFT ID and I'll give you the real talk on what you're looking at. 🍊";

  // Load data files on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [analysisRes, sentencesRes] = await Promise.all([
          fetch('/assets/BigPulp/all_nft_analysis.json'),
          fetch('/assets/BigPulp/all_nft_sentences.json')
        ]);
        const analysisJson = await analysisRes.json();
        const sentencesJson = await sentencesRes.json();
        setAnalysisData(analysisJson);
        setSentencesData(sentencesJson);
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

  const handleSearch = () => {
    setError('');

    const id = parseInt(nftId);
    if (isNaN(id) || id < 1 || id > 4200) {
      setError('Enter a valid NFT ID (1-4200)');
      return;
    }

    setLoading(true);
    setIsTyping(true);

    // Small delay for UX
    setTimeout(() => {
      const nftAnalysis = analysisData?.[String(id)];
      const nftSentences = sentencesData?.[String(id)];

      if (!nftAnalysis) {
        setError(`No data for NFT #${id}`);
        setLoading(false);
        setIsTyping(false);
        return;
      }

      setSearchedNftId(id);
      setAnalysis(nftAnalysis);

      // Pick a random sentence variant or use highlight
      if (nftSentences?.variants?.length) {
        const randomIndex = Math.floor(Math.random() * nftSentences.variants.length);
        setSentence(nftSentences.variants[randomIndex]);
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
          {/* Search Input */}
          <div className="search-section">
            <div className="search-input-group">
              <IonInput
                type="number"
                placeholder="Enter NFT ID (1-4200)"
                value={nftId}
                onIonInput={(e) => setNftId(e.detail.value || '')}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="nft-input"
              />
              <IonButton onClick={handleSearch} disabled={loading || !analysisData}>
                {loading ? <IonSpinner name="crescent" /> : 'Ask'}
              </IonButton>
            </div>
            {error && <p className="error-text">{error}</p>}
          </div>

          {/* BigPulp Character with Speech Bubble */}
          <BigPulpCharacter
            message={sentence || welcomeMessage}
            isTyping={isTyping && !!sentence}
            onTypingComplete={handleTypingComplete}
          />

          {/* NFT Preview & Stats (shown after search) */}
          {analysis && searchedNftId && (
            <div className="results-section">
              {/* NFT Image */}
              <div className="nft-preview-row">
                <IonImg
                  src={getNftImageUrl(searchedNftId)}
                  alt={`Wojak #${searchedNftId}`}
                  className="preview-image-small"
                />
                <div className="nft-quick-stats">
                  <div className="quick-stat">
                    <span className="qs-label">NFT</span>
                    <span className="qs-value">#{searchedNftId}</span>
                  </div>
                  <div className="quick-stat">
                    <span className="qs-label">Rank</span>
                    <span className="qs-value">#{analysis.rank}</span>
                  </div>
                  <div className="quick-stat">
                    <span className="qs-label">Tier</span>
                    <IonChip color={getTierColor(analysis.tier)} className="tier-chip">
                      <IonLabel>{analysis.tier_label}</IonLabel>
                    </IonChip>
                  </div>
                </div>
              </div>

              {/* Percentile Bar */}
              <div className="percentile-bar-container">
                <div className="percentile-labels">
                  <span>Rarity</span>
                  <span className="percentile-value">Top {Math.ceil(analysis.percentile)}%</span>
                </div>
                <div className="percentile-bar">
                  <div
                    className="percentile-fill"
                    style={{ width: `${100 - analysis.percentile}%` }}
                  />
                </div>
              </div>

              {/* Base Info */}
              <div className="base-info-row">
                <span className="base-name">{analysis.base}</span>
                <span className="base-rank">
                  #{analysis.base_rank} of {analysis.base_total} {analysis.base}s
                  {analysis.is_heritage_base && ' (Heritage)'}
                </span>
              </div>

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
            </div>
          )}

          {/* Hang with BigPulp Button */}
          <div className="intelligence-button-container">
            <IonButton
              expand="block"
              className="intelligence-button"
              onClick={() => setShowIntelligence(true)}
            >
              <IonIcon icon={statsChart} slot="start" />
              Hang with BigPulp
              <IonIcon icon={sparkles} slot="end" />
            </IonButton>
            <p className="intelligence-hint">Market intel, trait values, heatmaps & more</p>
          </div>
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
