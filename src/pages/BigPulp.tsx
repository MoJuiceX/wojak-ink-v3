/**
 * BigPulp Intelligence Page
 *
 * NFT analysis platform with AI-powered character guide.
 */

import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useLayout } from '@/hooks/useLayout';
import { BigPulpProvider, useBigPulp } from '@/contexts/BigPulpContext';
import {
  NFTSearchInput,
  NFTPreviewCard,
  BigPulpCharacter,
  AnalysisBadges,
  TabNavigation,
  MarketTab,
  AskTab,
  AttributesTab,
} from '@/components/bigpulp';



function LeftPanel() {
  const {
    searchQuery,
    setSearchQuery,
    searchNFT,
    surpriseMe,
    isLoading,
    error,
    currentAnalysis,
    bigPulp,
    onTypingComplete,
    skipMessage,
  } = useBigPulp();

  const handleSearch = useCallback(
    (id: string) => {
      searchNFT(id);
    },
    [searchNFT]
  );

  return (
    <div className="space-y-6">
      {/* Search input */}
      <NFTSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        onSurprise={surpriseMe}
        isLoading={isLoading}
        error={error || undefined}
      />

      {/* NFT Preview Card */}
      <NFTPreviewCard analysis={currentAnalysis} isLoading={isLoading} />

      {/* BigPulp Character */}
      <BigPulpCharacter
        state={bigPulp}
        onMessageComplete={onTypingComplete}
        onSkipMessage={skipMessage}
      />

      {/* Analysis Badges */}
      {currentAnalysis && (
        <AnalysisBadges
          badges={currentAnalysis.badges}
          provenance={currentAnalysis.provenance}
          rareCombos={currentAnalysis.rareCombos}
        />
      )}
    </div>
  );
}

function RightPanel() {
  const {
    activeTab,
    setActiveTab,
    marketStats,
    heatMapData,
    priceDistribution,
    heatMapViewMode,
    setHeatMapViewMode,
    attributes,
    topSales,
    rarestFinds,
    isMarketLoading,
    isAskLoading,
    isAttributesLoading,
  } = useBigPulp();
  const prefersReducedMotion = useReducedMotion();

  const handleAttributeClick = useCallback(() => {
    // TODO: Handle attribute click for drill-down
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Tab navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'market' && (
            <motion.div
              key="market"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0 }}
              role="tabpanel"
              id="panel-market"
              aria-labelledby="tab-market"
            >
              <MarketTab
                stats={marketStats}
                heatMapData={heatMapData}
                priceDistribution={priceDistribution}
                viewMode={heatMapViewMode}
                onViewModeChange={setHeatMapViewMode}
                isLoading={isMarketLoading}
              />
            </motion.div>
          )}

          {activeTab === 'ask' && (
            <motion.div
              key="ask"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0 }}
              role="tabpanel"
              id="panel-ask"
              aria-labelledby="tab-ask"
            >
              <AskTab
                stats={marketStats}
                topAttributes={attributes.slice(0, 10)}
                topSales={topSales}
                rarestFinds={rarestFinds}
                isLoading={isAskLoading}
              />
            </motion.div>
          )}

          {activeTab === 'attributes' && (
            <motion.div
              key="attributes"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0 }}
              role="tabpanel"
              id="panel-attributes"
              aria-labelledby="tab-attributes"
            >
              <AttributesTab
                attributes={attributes}
                categories={[]}
                onAttributeClick={handleAttributeClick}
                isLoading={isAttributesLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MobileLayout() {
  const { activeTab, setActiveTab, isModalOpen, toggleModal } = useBigPulp();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-6">
      {/* Left panel content */}
      <LeftPanel />

      {/* Tab buttons to open modal */}
      <div className="flex gap-3">
        <button
          className="flex-1 py-3 rounded-xl font-medium text-sm transition-colors"
          style={{
            background: 'var(--color-glass-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          onClick={() => {
            setActiveTab('market');
            toggleModal(true);
          }}
        >
          View Market
        </button>
        <button
          className="flex-1 py-3 rounded-xl font-medium text-sm transition-colors"
          style={{
            background: 'var(--color-glass-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          onClick={() => {
            setActiveTab('ask');
            toggleModal(true);
          }}
        >
          askBigPulp
        </button>
        <button
          className="flex-1 py-3 rounded-xl font-medium text-sm transition-colors"
          style={{
            background: 'var(--color-glass-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          onClick={() => {
            setActiveTab('attributes');
            toggleModal(true);
          }}
        >
          Attributes
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0, 0, 0, 0.7)' }}
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0 }}
              onClick={() => toggleModal(false)}
            />

            {/* Modal content */}
            <motion.div
              className="fixed inset-x-4 top-16 bottom-20 z-50 rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
              }}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: 50 }}
            >
              {/* Modal header */}
              <div
                className="flex items-center justify-between p-4"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <h3
                  className="font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {activeTab === 'market'
                    ? 'Market Analysis'
                    : activeTab === 'ask'
                      ? 'Ask BigPulp'
                      : 'Attributes'}
                </h3>
                <button
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    background: 'var(--color-glass-bg)',
                    color: 'var(--color-text-secondary)',
                  }}
                  onClick={() => toggleModal(false)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-hidden">
                <RightPanel />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DesktopLayout() {
  return (
    <div
      className="flex gap-6 min-h-[calc(100vh-200px)]"
      style={{ maxWidth: '1400px', margin: '0 auto' }}
    >
      {/* Left Panel - 50% width */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ minWidth: 0 }}
      >
        <LeftPanel />
      </div>

      {/* Divider with glow */}
      <div
        className="w-px flex-shrink-0 relative"
        style={{ background: 'var(--color-brand-primary)' }}
      >
        <div
          className="absolute inset-0 blur-md"
          style={{ background: 'var(--color-brand-glow)' }}
        />
      </div>

      {/* Right Panel - 50% width */}
      <div
        className="flex-1 rounded-2xl overflow-hidden"
        style={{
          background: 'var(--color-glass-bg)',
          border: '1px solid var(--color-border)',
          minWidth: 0,
        }}
      >
        <RightPanel />
      </div>
    </div>
  );
}

function BigPulpContent() {
  const { contentPadding, isDesktop } = useLayout();

  // Set browser tab title
  useEffect(() => {
    document.title = 'BigPulp Intelligence';

    // Cleanup: restore default title when leaving page
    return () => {
      document.title = 'wojak.ink';
    };
  }, []);

  return (
    <PageTransition>
      <div className="min-h-full" style={{ padding: contentPadding }}>
        {/* Responsive layout - no header needed, title is in browser tab */}
        {isDesktop ? <DesktopLayout /> : <MobileLayout />}
      </div>
    </PageTransition>
  );
}

export default function BigPulp() {
  return (
    <BigPulpProvider mockData={true}>
      <BigPulpContent />
    </BigPulpProvider>
  );
}
