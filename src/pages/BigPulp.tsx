/**
 * BigPulp Intelligence Page
 *
 * NFT analysis platform with AI-powered character guide.
 */

import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PageTransition } from '@/components/layout/PageTransition';
import { useLayout } from '@/hooks/useLayout';
import { BigPulpProvider, useBigPulp } from '@/contexts/BigPulpContext';
import {
  NFTSearchInput,
  NFTPreviewCard,
  BigPulpCharacter,
  TabNavigation,
  MarketTab,
  AskTab,
  AttributesTab,
} from '@/components/bigpulp';



function TopLeftPanel() {
  const {
    searchQuery,
    setSearchQuery,
    searchNFT,
    surpriseMe,
    isLoading,
    error,
    bigPulp,
    currentNftHeadTrait,
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
    <div className="relative h-full">
      {/* BigPulp Character with Orange Grove background */}
      <BigPulpCharacter
        message={bigPulp.message}
        isTyping={bigPulp.isTyping}
        headTrait={currentNftHeadTrait || undefined}
        onTypingComplete={onTypingComplete}
        onSkipMessage={skipMessage}
      />

      {/* Search input - overlaid on top of Orange Grove, aligned with speech bubble */}
      <div className="absolute top-3" style={{ zIndex: 10, left: '35px', width: '280px' }}>
        <NFTSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          onSurprise={surpriseMe}
          isLoading={isLoading}
          error={error || undefined}
        />
      </div>
    </div>
  );
}

function TopRightPanel() {
  const {
    currentAnalysis,
    isLoading,
    currentNftTraits,
    currentNftHpTraits,
    currentNftNamedCombos,
    currentNftCultures,
    currentNftIsFiveHp,
    currentNftIsHomieEdition,
    currentNftHomieName,
  } = useBigPulp();

  return (
    <div className="h-full overflow-hidden">
      {/* NFT Preview Card - constrained to container */}
      <NFTPreviewCard
        analysis={currentAnalysis}
        isLoading={isLoading}
        traits={currentNftTraits}
        hpTraits={currentNftHpTraits}
        namedCombos={currentNftNamedCombos}
        cultures={currentNftCultures}
        isFiveHp={currentNftIsFiveHp}
        isHomieEdition={currentNftIsHomieEdition}
        homieName={currentNftHomieName}
      />
    </div>
  );
}

function BottomPanel() {
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
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Tab navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <div className="p-4">
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
  return (
    <div className="space-y-6">
      {/* Search + BigPulp Character */}
      <TopLeftPanel />

      {/* NFT Preview + Badges */}
      <TopRightPanel />

      {/* Market/Ask/Attributes - Full width white box */}
      <BottomPanel />
    </div>
  );
}

function DesktopLayout() {
  return (
    <div
      className="space-y-6"
      style={{ maxWidth: '1400px', margin: '0 auto' }}
    >
      {/* Top Row: Search/BigPulp (left) | NFT Preview (right) - same height */}
      <div className="flex gap-6" style={{ height: '400px' }}>
        {/* Left Panel - BigPulp with search overlay */}
        <div className="flex-1" style={{ minWidth: 0, height: '100%' }}>
          <TopLeftPanel />
        </div>

        {/* Right Panel - NFT Preview - same height */}
        <div className="flex-1" style={{ minWidth: 0, height: '100%' }}>
          <TopRightPanel />
        </div>
      </div>

      {/* Bottom Row: Market/Ask/Attributes - Full width */}
      <BottomPanel />
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
      <div style={{ padding: contentPadding, minHeight: isDesktop ? 'calc(100dvh - 64px)' : 'auto' }}>
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
