import { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
  IonImg,
  IonChip,
  IonLabel
} from '@ionic/react';
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
}

interface NFTSentences {
  variants: string[];
}

const BigPulp: React.FC = () => {
  const [nftId, setNftId] = useState('');
  const [analysis, setAnalysis] = useState<NFTAnalysis | null>(null);
  const [sentence, setSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisData, setAnalysisData] = useState<Record<string, NFTAnalysis> | null>(null);
  const [sentencesData, setSentencesData] = useState<Record<string, NFTSentences> | null>(null);

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
    setAnalysis(null);
    setSentence('');

    const id = parseInt(nftId);
    if (isNaN(id) || id < 1 || id > 4200) {
      setError('Please enter a valid NFT ID (1-4200)');
      return;
    }

    setLoading(true);

    // Simulate slight delay for UX
    setTimeout(() => {
      const nftAnalysis = analysisData?.[String(id)];
      const nftSentences = sentencesData?.[String(id)];

      if (!nftAnalysis) {
        setError(`No analysis found for NFT #${id}`);
        setLoading(false);
        return;
      }

      setAnalysis(nftAnalysis);

      // Pick a random sentence variant
      if (nftSentences?.variants?.length) {
        const randomIndex = Math.floor(Math.random() * nftSentences.variants.length);
        setSentence(nftSentences.variants[randomIndex]);
      }

      setLoading(false);
    }, 300);
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
          {/* Search Section */}
          <div className="search-section">
            <h2>Ask BigPulp</h2>
            <p className="subtitle">Enter an NFT ID to get BigPulp's analysis</p>
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
                {loading ? <IonSpinner name="crescent" /> : 'Analyze'}
              </IonButton>
            </div>
            {error && <p className="error-text">{error}</p>}
          </div>

          {/* Results Section */}
          {analysis && (
            <div className="results-section">
              {/* NFT Image */}
              <div className="nft-preview">
                <IonImg
                  src={getNftImageUrl(parseInt(nftId))}
                  alt={`Wojak #${nftId}`}
                  className="preview-image"
                />
              </div>

              {/* BigPulp Says */}
              <IonCard className="pulp-card">
                <IonCardHeader>
                  <IonCardTitle className="pulp-title">BigPulp Says</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className="pulp-sentence">{sentence || analysis.highlight}</p>
                </IonCardContent>
              </IonCard>

              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Rank</span>
                  <span className="stat-value">#{analysis.rank}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Tier</span>
                  <IonChip color={getTierColor(analysis.tier)}>
                    <IonLabel>{analysis.tier_label}</IonLabel>
                  </IonChip>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Base</span>
                  <span className="stat-value">
                    {analysis.base}
                    {analysis.is_heritage_base && ' *'}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">In {analysis.base}</span>
                  <span className="stat-value">#{analysis.base_rank} of {analysis.base_total}</span>
                </div>

                {/* Percentile Bar */}
                <div className="percentile-wrapper">
                  <div className="percentile-info">
                    <span className="stat-label">Rarity Percentile</span>
                    <span className="stat-value">Top {(100 - analysis.percentile).toFixed(1)}%</span>
                  </div>
                  <div className="percentile-bar">
                    <div
                      className="percentile-fill"
                      style={{ width: `${100 - analysis.percentile}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* S-Tier Traits */}
              {analysis.s_tier_traits.length > 0 && (
                <div className="traits-section">
                  <h4>High Provenance Traits</h4>
                  <div className="stier-traits">
                    {analysis.s_tier_traits.map((trait, idx) => (
                      <div key={idx} className="stier-trait">
                        {trait.trait}
                        <span className="trait-count">({trait.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rare Pairings */}
              {analysis.rare_pairings.length > 0 && (
                <div className="traits-section">
                  <h4>Rare Combos</h4>
                  <div className="rare-pairings">
                    {analysis.rare_pairings.slice(0, 3).map((pairing, idx) => (
                      <div key={idx} className="pairing-item">
                        <span className="pairing-traits">{pairing.traits.join(' + ')}</span>
                        <span className="pairing-count">{pairing.count} exist</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Named Combos */}
              {analysis.named_combos.length > 0 && (
                <div className="traits-section">
                  <h4>Special Combos</h4>
                  <div className="stier-traits">
                    {analysis.named_combos.map((combo, idx) => (
                      <div key={idx} className="stier-trait">
                        {combo}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!analysis && !loading && (
            <div className="empty-state">
              <span className="empty-icon">🍊</span>
              <p>Enter an NFT ID to see what BigPulp thinks about it</p>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BigPulp;
