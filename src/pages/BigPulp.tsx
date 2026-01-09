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
import { sparkles, statsChart, shuffle, search } from 'ionicons/icons';
import BigPulpCharacter from '../components/BigPulpCharacter';
import MarketHeatmap from '../components/MarketHeatmap';
import AskBigPulp from '../components/AskBigPulp';
import TraitValues from '../components/TraitValues';
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

// V2 NFT Takes structure
interface NFTTakeV2 {
  token_id: number;
  open_rarity_rank: number;
  take: string;
  tone: 'bullish' | 'neutral' | 'fuddish-but-loving';
  flags: {
    is_bottom_10: boolean;
    is_top_10: boolean;
    is_one_of_one: boolean;
    has_crown: boolean;
    special_edition: boolean;
  };
}

// Did You Know structure
interface DidYouKnow {
  token_id: number;
  didYouKnow: string;
}

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface NFTMetadata {
  name: string;
  attributes: NFTAttribute[];
}

// Combo badges interfaces
interface ComboRequirement {
  [category: string]: string;
}

interface Combo {
  id: string;
  name: string;
  emoji: string;
  category: string;
  logic: 'exact' | 'any_two' | 'trait_plus_base' | 'single';
  requirements?: ComboRequirement;
  requirementPool?: ComboRequirement[];
  requiredBases?: string[];
  lore: string;
}

interface CombosData {
  combos: Combo[];
}

const BigPulp: React.FC = () => {
  const [nftId, setNftId] = useState('');
  const [searchedNftId, setSearchedNftId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<NFTAnalysis | null>(null);
  const [sentence, setSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisData, setAnalysisData] = useState<Record<string, NFTAnalysis> | null>(null);
  const [takesData, setTakesData] = useState<Record<string, NFTTakeV2> | null>(null);
  const [didYouKnowData, setDidYouKnowData] = useState<Record<string, DidYouKnow> | null>(null);
  const [metadataList, setMetadataList] = useState<NFTMetadata[] | null>(null);
  const [currentTake, setCurrentTake] = useState<NFTTakeV2 | null>(null);
  const [currentDidYouKnow, setCurrentDidYouKnow] = useState<string | null>(null);
  const [currentHeadTrait, setCurrentHeadTrait] = useState<string | undefined>(undefined);
  const [isTyping, setIsTyping] = useState(false);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [intelligenceTab, setIntelligenceTab] = useState<'heatmap' | 'questions' | 'traits'>('heatmap');
  const [combosData, setCombosData] = useState<CombosData | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<Combo[]>([]);
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
        const [analysisRes, takesRes, didYouKnowRes, metadataRes, combosRes] = await Promise.all([
          fetch('/assets/BigPulp/all_nft_analysis.json'),
          fetch('/assets/BigPulp/nft_takes_v2.json'),
          fetch('/assets/BigPulp/bigP_Didyouknow/did_you_know.json'),
          fetch('/assets/nft-data/metadata.json'),
          fetch('/assets/BigPulp/combos_badges.json')
        ]);
        const analysisJson = await analysisRes.json();
        const takesJson = await takesRes.json();
        const didYouKnowJson = await didYouKnowRes.json();
        const metadataJson = await metadataRes.json();
        const combosJson = await combosRes.json();
        setAnalysisData(analysisJson);
        setTakesData(takesJson);
        setDidYouKnowData(didYouKnowJson);
        setMetadataList(metadataJson);
        setCombosData(combosJson);
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

  // Check if NFT qualifies for a badge
  const checkBadge = (combo: Combo, nftTraits: Record<string, string>): boolean => {
    switch (combo.logic) {
      case 'exact':
        return Object.entries(combo.requirements || {}).every(
          ([category, trait]) => nftTraits[category] === trait
        );
      case 'any_two':
        const matchCount = (combo.requirementPool || []).filter(req => {
          const [category, trait] = Object.entries(req)[0];
          return nftTraits[category] === trait;
        }).length;
        return matchCount >= 2;
      case 'trait_plus_base':
        const hasTraits = Object.entries(combo.requirements || {}).every(
          ([category, trait]) => nftTraits[category] === trait
        );
        const hasBase = (combo.requiredBases || []).includes(nftTraits.Base);
        return hasTraits && hasBase;
      case 'single':
        return Object.entries(combo.requirements || {}).every(
          ([category, trait]) => nftTraits[category] === trait
        );
      default:
        return false;
    }
  };

  // Get all earned badges for an NFT
  const getEarnedBadges = (nftId: number): Combo[] => {
    if (!combosData || !metadataList) return [];

    const nft = metadataList.find(m => m.name.includes(`#${String(nftId).padStart(4, '0')}`));
    if (!nft) return [];

    // Convert attributes array to object for easier lookup
    const nftTraits: Record<string, string> = {};
    for (const attr of nft.attributes) {
      nftTraits[attr.trait_type] = attr.value;
    }

    return combosData.combos.filter(combo => checkBadge(combo, nftTraits));
  };

  // Random NFT selection
  const handleRandom = () => {
    const randomId = Math.floor(Math.random() * 4200) + 1;
    const paddedId = String(randomId).padStart(4, '0');
    setNftId(paddedId);
    handleSearch(paddedId);
  };

  const handleSearch = (directValue?: string) => {
    setError('');

    // Use direct value if provided, otherwise use state
    const searchValue = directValue || nftId;

    // parseInt handles leading zeros (0001 -> 1)
    const id = parseInt(searchValue, 10);
    if (isNaN(id) || id < 1 || id > 4200) {
      setError('Enter a valid NFT ID (1-4200)');
      return;
    }

    setLoading(true);
    setIsTyping(true);

    // Small delay for UX
    setTimeout(() => {
      const nftAnalysis = analysisData?.[String(id)];
      const nftTake = takesData?.[String(id)];
      const nftDidYouKnow = didYouKnowData?.[String(id)];

      if (!nftAnalysis) {
        setError(`No data for NFT #${id}`);
        setLoading(false);
        setIsTyping(false);
        return;
      }

      setSearchedNftId(id);
      setAnalysis(nftAnalysis);
      setCurrentTake(nftTake || null);
      setCurrentDidYouKnow(nftDidYouKnow?.didYouKnow || null);

      // Get head trait from metadata (metadata array is 0-indexed, NFT IDs start at 1)
      const nftMetadata = metadataList?.[id - 1];
      const headAttr = nftMetadata?.attributes?.find(attr => attr.trait_type === 'Head');
      setCurrentHeadTrait(headAttr?.value);

      // Compute earned combo badges
      const badges = getEarnedBadges(id);
      setEarnedBadges(badges);

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
      <IonContent fullscreen className="bigpulp-content">
        <div className="bigpulp-container">
          {/* Hang with BigPulp Button - First thing user sees */}
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
          </div>

          {/* Search Input Row */}
          <div className="search-row">
            <div className="search-input-wrapper">
              <IonIcon icon={search} className="search-icon" />
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                placeholder="NFT #1234"
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
                  setError(''); // Clear previous error
                  // Auto-search when 4 digits entered
                  if (value.length === 4) {
                    const id = parseInt(value, 10);
                    if (!isNaN(id) && id >= 1 && id <= 4200) {
                      // Dismiss keyboard
                      inputRef.current?.blur();
                      handleSearch(value);
                    } else {
                      // Show error for invalid range
                      inputRef.current?.blur();
                      setError('Choose a number between 1 and 4200');
                    }
                  }
                }}
                className="nft-input-compact"
              />
            </div>
            <button
              className="random-button"
              onClick={handleRandom}
              disabled={loading || !analysisData}
            >
              <IonIcon icon={shuffle} />
              <span>Surprise Me</span>
            </button>
          </div>
          {error && <p className="error-text">{error}</p>}

          {/* NFT Preview Card (shown after search) - directly under search */}
          {analysis && searchedNftId && (
            <div className="nft-preview-card">
              <div className="nft-image-container">
                <IonImg
                  src={getNftImageUrl(searchedNftId)}
                  alt={`${analysis.base} #${searchedNftId}`}
                  className="preview-image-square"
                />
                {/* Earned Combo Badges */}
                {earnedBadges.length > 0 && (
                  <div className="earned-badges-overlay">
                    {earnedBadges.map(badge => (
                      <div key={badge.id} className="earned-badge" title={badge.name}>
                        <span className="earned-badge-emoji">{badge.emoji}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              {/* Flag Badges */}
              {currentTake?.flags && (
                <div className="flag-badges">
                  {currentTake.flags.has_crown && (
                    <span className="flag-badge crown">👑 Crown Holder</span>
                  )}
                  {currentTake.flags.special_edition && (
                    <span className="flag-badge special">⭐ Special Edition</span>
                  )}
                  {currentTake.flags.is_top_10 && (
                    <span className="flag-badge elite">🏆 Top 10%</span>
                  )}
                  {currentTake.flags.is_one_of_one && (
                    <span className="flag-badge rare">💎 Rare Combo</span>
                  )}
                  {currentTake.flags.is_bottom_10 && (
                    <span className="flag-badge floor">🛡️ Floor Defender</span>
                  )}
                </div>
              )}

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

              {/* Did You Know? callout - from separate file */}
              {currentDidYouKnow && (
                <div className="did-you-know">
                  <span className="dyk-label">💡 Did You Know?</span>
                  <p className="dyk-text">{currentDidYouKnow}</p>
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
                  <IonLabel>Attributes</IonLabel>
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
                  setTimeout(() => handleSearch(nftId), 100);
                }}
              />
            )}

            {intelligenceTab === 'questions' && (
              <AskBigPulp
                onNftClick={(nftId) => {
                  setShowIntelligence(false);
                  setNftId(nftId);
                  setTimeout(() => handleSearch(nftId), 100);
                }}
              />
            )}

            {intelligenceTab === 'traits' && (
              <TraitValues
                onTraitClick={(traitName) => {
                  console.log('Trait clicked:', traitName);
                }}
              />
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default BigPulp;
