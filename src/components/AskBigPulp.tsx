import { useState, useEffect } from 'react';
import { IonImg, IonIcon, IonSpinner } from '@ionic/react';
import {
  chevronForward,
  chevronBack,
  sparkles,
  trophy,
  diamond,
  ribbon,
  statsChart,
  school,
  flame,
  pricetag
} from 'ionicons/icons';
import { fetchTradeValues, fetchCollectionStats, TraitStats, CollectionStats, formatXCH, formatRelativeTime } from '../services/tradeValuesService';
import { getXchPrice, getCachedXchPrice } from '../services/treasuryApi';
import './AskBigPulp.css';

interface NamedCombo {
  requires: string[];
  count: number;
  best_nft: string;
  best_rank: number;
  all_nfts: string[];
  lore: string;
  cultural_significance: string;
  rarity_note: string;
}

interface ComboDatabase {
  named_combos: Record<string, NamedCombo>;
  rare_pairings: Array<{
    traits: string[];
    count: number;
    best_nft: string;
    best_rank: number;
    nft_ids: string[];
  }>;
}

interface TraitInsight {
  count: number;
  percentile: number;
  category: string;
  provenance_tier: string;
  cultural_note: string;
  community_meme?: string;
  pairs_well_with: string[];
  best_holder: {
    nft_id: string;
    rank: number;
  };
  fun_fact: string;
}

interface TopSale {
  edition: number;
  price_xch: number;
  timestamp: string;
  nftName: string;
}

interface AskBigPulpProps {
  onNftClick: (nftId: string) => void;
}

const getNftImageUrl = (id: string | number) => {
  const paddedId = String(id).padStart(4, '0');
  return `https://bafybeigjkkonjzwwpopo4wn4gwrrvb7z3nwr2edj2554vx3avc5ietfjwq.ipfs.w3s.link/${paddedId}.png`;
};

// Format USD value
const formatUsd = (xch: number, xchPrice: number): string => {
  const usd = xch * xchPrice;
  if (usd >= 1000) {
    return `$${(usd / 1000).toFixed(1)}k`;
  }
  return `$${usd.toFixed(0)}`;
};

const AskBigPulp: React.FC<AskBigPulpProps> = ({ onNftClick }) => {
  const [comboData, setComboData] = useState<ComboDatabase | null>(null);
  const [traitInsights, setTraitInsights] = useState<Record<string, TraitInsight> | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('stats');
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);

  // Trade data from API
  const [topTraits, setTopTraits] = useState<TraitStats[]>([]);
  const [topSales, setTopSales] = useState<TopSale[]>([]);
  const [tradeDataLoading, setTradeDataLoading] = useState(true);

  // Collection stats from MintGarden API
  const [collectionStats, setCollectionStats] = useState<CollectionStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // XCH price for USD conversion
  const [xchPriceUsd, setXchPriceUsd] = useState<number>(getCachedXchPrice());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [comboRes, traitsRes] = await Promise.all([
          fetch('/assets/BigPulp/combo_database.json'),
          fetch('/assets/BigPulp/trait_insights.json')
        ]);
        const combos = await comboRes.json();
        const traits = await traitsRes.json();
        setComboData(combos);
        setTraitInsights(traits);
      } catch (err) {
        console.error('Failed to load BigPulp data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load trade values data
  useEffect(() => {
    const loadTradeData = async () => {
      try {
        const data = await fetchTradeValues();

        // Top 10 traits by average XCH
        setTopTraits(data.trait_stats.slice(0, 10));

        // Top 10 sales from all_sales (sorted by price)
        if (data.all_sales && data.all_sales.length > 0) {
          const sortedSales = [...data.all_sales]
            .sort((a, b) => b.price_xch - a.price_xch)
            .slice(0, 10);
          setTopSales(sortedSales as TopSale[]);
        }
      } catch (err) {
        console.error('Failed to load trade data:', err);
      } finally {
        setTradeDataLoading(false);
      }
    };
    loadTradeData();
  }, []);

  // Load collection stats from MintGarden and XCH price
  useEffect(() => {
    const loadCollectionStats = async () => {
      try {
        const [stats, price] = await Promise.all([
          fetchCollectionStats(),
          getXchPrice()
        ]);
        setCollectionStats(stats);
        setXchPriceUsd(price);
      } catch (err) {
        console.error('Failed to load collection stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    loadCollectionStats();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
    setSelectedCombo(null);
  };

  if (loading) {
    return (
      <div className="ask-loading">
        <IonSpinner />
        <p>Loading BigPulp Intelligence...</p>
      </div>
    );
  }

  // Get legendary combos (sorted by rarity)
  const legendaryComboEntries = comboData?.named_combos
    ? Object.entries(comboData.named_combos)
        .filter(([_, combo]) => combo.cultural_significance === 'Legendary' || combo.cultural_significance === 'Iconic')
        .sort((a, b) => a[1].count - b[1].count)
    : [];

  // High provenance traits in community-ranked order with unique base previews
  const highProvenanceData: Array<{ trait: string; nftId: string; base: string }> = [
    { trait: 'Crown', nftId: '2867', base: 'Waifu' },              // rank 88
    { trait: 'Military Beret', nftId: '3782', base: 'Alien Soyjak' }, // rank 134
    { trait: 'MOG Glasses', nftId: '3879', base: 'Alien Baddie' },    // rank 23
    { trait: 'Neckbeard', nftId: '3658', base: 'Alien Wojak' },       // rank 184
    { trait: 'Fedora', nftId: '4046', base: 'Bepe Soyjak' },          // rank 68
    { trait: 'Wizard Hat', nftId: '4158', base: 'Bepe Waifu' },       // rank 83
    { trait: 'Clown', nftId: '3435', base: 'Papa Tang' },             // rank 123
    { trait: 'Devil Horns', nftId: '586', base: 'Wojak' },            // rank 509
    { trait: 'Straitjacket', nftId: '2157', base: 'Soyjak' },         // rank 11
    { trait: 'Ronin Helmet', nftId: '3180', base: 'Baddie' },         // rank 308
    { trait: 'Wizard Glasses', nftId: '3589', base: 'Monkey Zoo' },   // rank 119
    { trait: 'Goose Suit', nftId: '3944', base: 'Bepe Wojak' },       // rank 684
  ];

  const sTierTraits = traitInsights
    ? highProvenanceData
        .filter(item => traitInsights[item.trait])
        .map(item => ({
          name: item.trait,
          trait: traitInsights[item.trait],
          previewNftId: item.nftId
        }))
    : [];

  // Get rarest 1-of-1 pairings
  const rarestPairings = comboData?.rare_pairings
    ? comboData.rare_pairings
        .filter(p => p.count === 1)
        .slice(0, 20)
    : [];


  return (
    <div className="ask-bigpulp">
      {/* 1. Collection Stats Section */}
      <div className="ask-section">
        <button
          className={`section-header ${expandedSection === 'stats' ? 'expanded' : ''}`}
          onClick={() => toggleSection('stats')}
        >
          <div className="section-header-left">
            <IonIcon icon={statsChart} className="section-icon green" />
            <span className="section-title">Collection Stats</span>
          </div>
          <IonIcon icon={expandedSection === 'stats' ? chevronBack : chevronForward} className="section-chevron" />
        </button>

        {expandedSection === 'stats' && (
          <div className="section-content">
            {statsLoading ? (
              <div className="section-loading">
                <IonSpinner name="dots" />
              </div>
            ) : (
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-number">{collectionStats?.supply.toLocaleString() || '4,200'}</span>
                  <span className="stat-label">Total Supply</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{collectionStats?.trade_count.toLocaleString() || '—'}</span>
                  <span className="stat-label">Total Trades</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number green-text">{formatXCH(collectionStats?.floor_xch, 1)} XCH</span>
                  <div className="stat-label-row">
                    <span className="stat-usd">{formatUsd(collectionStats?.floor_xch || 0, xchPriceUsd)}</span>
                    <span className="stat-label">Floor Price</span>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{formatXCH(collectionStats?.volume_xch, 0)} XCH</span>
                  <div className="stat-label-row">
                    <span className="stat-usd">{formatUsd(collectionStats?.volume_xch || 0, xchPriceUsd)}</span>
                    <span className="stat-label">Total Volume</span>
                  </div>
                </div>
                <div className="stat-card wide">
                  <span className="stat-number">{formatXCH(collectionStats?.market_cap_xch, 0)} XCH</span>
                  <div className="stat-label-row">
                    <span className="stat-usd">{formatUsd(collectionStats?.market_cap_xch || 0, xchPriceUsd)}</span>
                    <span className="stat-label">Market Cap (Floor × Supply)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Learn Provenance Section */}
      <div className="ask-section">
        <button
          className={`section-header ${expandedSection === 'provenance' ? 'expanded' : ''}`}
          onClick={() => toggleSection('provenance')}
        >
          <div className="section-header-left">
            <IonIcon icon={school} className="section-icon blue" />
            <span className="section-title">Learn Provenance</span>
          </div>
          <IonIcon icon={expandedSection === 'provenance' ? chevronBack : chevronForward} className="section-chevron" />
        </button>

        {expandedSection === 'provenance' && (
          <div className="section-content">
            <div className="provenance-cards">
              <div className="provenance-card">
                <h4>High Provenance</h4>
                <p>These aren't necessarily the rarest attributes, but they're the most valuable. The community has spoken — Crown, Military Beret, Wizard Hat, Fedora, and Neckbeard command premium prices because of their cultural significance and meme status.</p>
              </div>
              <div className="provenance-card">
                <h4>Rarest Attributes</h4>
                <p>The scarcest attributes in the collection. Piccolo Turban, Piccolo Uniform, Fake It Mask, El Presidente, and Goose Suit are among the rarest pieces you can find. These dominate the top rankings.</p>
              </div>
              <div className="provenance-card">
                <h4>Bases</h4>
                <p>Monkey Zoo represents the OG ape heritage from the early grove — primal energy meets Wojak culture. Papa Tang is the founder energy, the king of the grove himself, inspired by Tales of the Grove and WMC creator lore.</p>
              </div>
              <div className="provenance-card">
                <h4>Named Combos</h4>
                <p>The artist crafted these matching sets with intention. Ronin Helmet pairs with Ronin clothes and Ronin Dojo background. Wizard Hat matches Wizard Drip and Wizard Glasses. These aren't random — they're designed to work together as complete transformations.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Top 10 Most Valuable Traits Section */}
      <div className="ask-section">
        <button
          className={`section-header ${expandedSection === 'topTraits' ? 'expanded' : ''}`}
          onClick={() => toggleSection('topTraits')}
        >
          <div className="section-header-left">
            <IonIcon icon={flame} className="section-icon color-orange" />
            <span className="section-title">Top 10 Valuable Attributes</span>
          </div>
          <IonIcon icon={expandedSection === 'topTraits' ? chevronBack : chevronForward} className="section-chevron" />
        </button>

        {expandedSection === 'topTraits' && (
          <div className="section-content">
            {tradeDataLoading ? (
              <div className="section-loading">
                <IonSpinner name="dots" />
              </div>
            ) : topTraits.length > 0 ? (
              <>
                <p className="section-intro">Attributes with highest average sale prices</p>
                <div className="top-list">
                  {topTraits.map((trait, idx) => (
                    <div key={`${trait.trait_category}-${trait.trait_name}`} className="top-list-item">
                      <span className="top-rank">#{idx + 1}</span>
                      <div className="top-info">
                        <span className="top-name">{trait.trait_name}</span>
                        <span className="top-category">{trait.trait_category}</span>
                      </div>
                      <div className="top-stats">
                        <span className="top-price">{formatXCH(trait.average_xch)} XCH</span>
                        <span className="top-usd">{formatUsd(trait.average_xch, xchPriceUsd)}</span>
                        <span className="top-sales">{trait.total_sales} sales</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="section-empty">No trade data available</p>
            )}
          </div>
        )}
      </div>

      {/* 4. Top 10 Most Valuable Sales Section */}
      <div className="ask-section">
        <button
          className={`section-header ${expandedSection === 'topSales' ? 'expanded' : ''}`}
          onClick={() => toggleSection('topSales')}
        >
          <div className="section-header-left">
            <IonIcon icon={pricetag} className="section-icon gold" />
            <span className="section-title">Top 10 Highest Sales</span>
          </div>
          <IonIcon icon={expandedSection === 'topSales' ? chevronBack : chevronForward} className="section-chevron" />
        </button>

        {expandedSection === 'topSales' && (
          <div className="section-content">
            {tradeDataLoading ? (
              <div className="section-loading">
                <IonSpinner name="dots" />
              </div>
            ) : topSales.length > 0 ? (
              <>
                <p className="section-intro">Highest individual NFT sales recorded</p>
                <div className="top-sales-gallery">
                  {topSales.map((sale, idx) => (
                    <div
                      key={`${sale.edition}-${sale.timestamp}`}
                      className="top-sale-card"
                      onClick={() => onNftClick(String(sale.edition))}
                    >
                      <div className="sale-rank-badge">#{idx + 1}</div>
                      <IonImg
                        src={getNftImageUrl(sale.edition)}
                        alt={sale.nftName || `#${sale.edition}`}
                        className="sale-image"
                      />
                      <div className="sale-info">
                        <span className="sale-name">{sale.nftName || `#${sale.edition}`}</span>
                        <span className="sale-price">{formatXCH(sale.price_xch)} XCH <span className="sale-usd">{formatUsd(sale.price_xch, xchPriceUsd)}</span></span>
                        <span className="sale-date">{formatRelativeTime(sale.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="section-empty">No sales data available</p>
            )}
          </div>
        )}
      </div>

      {/* 5. Legendary Combos Section */}
      <div className="ask-section">
        <button
          className={`section-header ${expandedSection === 'combos' ? 'expanded' : ''}`}
          onClick={() => toggleSection('combos')}
        >
          <div className="section-header-left">
            <IonIcon icon={trophy} className="section-icon gold" />
            <span className="section-title">Legendary Combos</span>
          </div>
          <IonIcon icon={expandedSection === 'combos' ? chevronBack : chevronForward} className="section-chevron" />
        </button>

        {expandedSection === 'combos' && (
          <div className="section-content">
            {!selectedCombo ? (
              <div className="combo-grid">
                {legendaryComboEntries.map(([name, combo]) => (
                  <div
                    key={name}
                    className="combo-card"
                    onClick={() => setSelectedCombo(name)}
                  >
                    <div className="combo-preview">
                      <IonImg
                        src={getNftImageUrl(combo.best_nft)}
                        alt={name}
                        className="combo-image"
                      />
                      <span className="combo-badge">{combo.count}</span>
                    </div>
                    <span className="combo-name">{name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="combo-detail">
                <button className="back-btn" onClick={() => setSelectedCombo(null)}>
                  <IonIcon icon={chevronBack} /> Back
                </button>
                <h3 className="detail-title">{selectedCombo}</h3>
                <p className="detail-lore">{comboData?.named_combos[selectedCombo]?.lore}</p>
                <p className="detail-note">{comboData?.named_combos[selectedCombo]?.rarity_note}</p>
                <div className="nft-gallery">
                  {comboData?.named_combos[selectedCombo]?.all_nfts.slice(0, 10).map((nftId) => (
                    <div
                      key={nftId}
                      className="gallery-item"
                      onClick={() => onNftClick(nftId)}
                    >
                      <IonImg
                        src={getNftImageUrl(nftId)}
                        alt={`#${nftId}`}
                        className="gallery-image"
                      />
                      <span className="gallery-id">#{nftId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Rarest Finds Section */}
      <div className="ask-section">
        <button
          className={`section-header ${expandedSection === 'rarest' ? 'expanded' : ''}`}
          onClick={() => toggleSection('rarest')}
        >
          <div className="section-header-left">
            <IonIcon icon={diamond} className="section-icon purple" />
            <span className="section-title">Rarest Finds</span>
          </div>
          <IonIcon icon={expandedSection === 'rarest' ? chevronBack : chevronForward} className="section-chevron" />
        </button>

        {expandedSection === 'rarest' && (
          <div className="section-content">
            <p className="section-intro">1-of-1 attribute combinations</p>
            <div className="rarest-gallery">
              {rarestPairings.map((pairing, idx) => (
                <div
                  key={idx}
                  className="rarest-item"
                  onClick={() => onNftClick(pairing.best_nft)}
                >
                  <IonImg
                    src={getNftImageUrl(pairing.best_nft)}
                    alt={`#${pairing.best_nft}`}
                    className="rarest-image"
                  />
                  <div className="rarest-info">
                    <span className="rarest-rank">Rank #{pairing.best_rank}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. High Provenance Traits Section */}
      <div className="ask-section">
        <button
          className={`section-header ${expandedSection === 'stier' ? 'expanded' : ''}`}
          onClick={() => toggleSection('stier')}
        >
          <div className="section-header-left">
            <span className="section-emoji">👑</span>
            <span className="section-title">High Provenance</span>
          </div>
          <IonIcon icon={expandedSection === 'stier' ? chevronBack : chevronForward} className="section-chevron" />
        </button>

        {expandedSection === 'stier' && (
          <div className="section-content">
            <p className="section-intro">Most valuable attributes as decided by the community</p>
            <div className="stier-grid">
              {sTierTraits.map((item) => (
                <div
                  key={item.name}
                  className="stier-card"
                  onClick={() => onNftClick(item.previewNftId)}
                >
                  <IonImg
                    src={getNftImageUrl(item.previewNftId)}
                    alt={item.name}
                    className="stier-image"
                  />
                  <div className="stier-info">
                    <span className="stier-name">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskBigPulp;
