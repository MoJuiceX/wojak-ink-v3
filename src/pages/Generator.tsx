/**
 * Wojak Generator Page
 *
 * 6-layer avatar composition system with trait selection.
 */

import { PageTransition } from '@/components/layout/PageTransition';
import { useLayout } from '@/hooks/useLayout';
import { GeneratorProvider } from '@/contexts/GeneratorContext';
import {
  PreviewCanvas,
  LayerTabs,
  TraitSelector,
  ActionBar,
  FavoritesModal,
  ExportPanel,
  StickyMiniPreview,
} from '@/components/generator';

function GeneratorContent() {
  const { contentPadding, isDesktop } = useLayout();

  return (
    <PageTransition>
      <div className="min-h-full" style={{ padding: contentPadding }}>
        {isDesktop ? <DesktopLayout /> : <MobileLayout />}
      </div>

      {/* Modals */}
      <FavoritesModal />
      <ExportPanel />

      {/* Mobile sticky preview */}
      {!isDesktop && <StickyMiniPreview />}
    </PageTransition>
  );
}

function DesktopLayout() {
  return (
    <div
      className="flex gap-6 min-h-[calc(100vh-200px)]"
      style={{ maxWidth: '1400px', margin: '0 auto' }}
    >
      {/* Left Panel - Preview and Actions */}
      <div className="flex-shrink-0 space-y-4" style={{ width: '400px' }}>
        {/* Preview Canvas */}
        <PreviewCanvas size={400} />

        {/* Action Bar */}
        <ActionBar />
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

      {/* Right Panel - Layer Selection */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Layer Tabs */}
        <LayerTabs />

        {/* Trait Selector */}
        <div
          className="p-4 rounded-2xl overflow-y-auto"
          style={{
            background: 'var(--color-glass-bg)',
            border: '1px solid var(--color-border)',
            maxHeight: 'calc(100vh - 250px)',
          }}
        >
          <TraitSelector />
        </div>
      </div>
    </div>
  );
}

function MobileLayout() {
  return (
    <div className="space-y-3 pb-4" style={{ marginTop: '-3px' }}>
      {/* Preview Canvas */}
      <PreviewCanvas className="w-full aspect-square" />

      {/* Action Bar */}
      <ActionBar />

      {/* Layer Tabs */}
      <LayerTabs />

      {/* Trait Selector */}
      <div
        className="p-4 rounded-2xl"
        style={{
          background: 'var(--color-glass-bg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <TraitSelector />
      </div>

      {/* Footer Info */}
      <div className="text-center pt-3">
        <h2
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Wojak Generator
        </h2>
        <p
          className="text-sm mb-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Create your own unique Wojak using layers
          <br />
          provided by the artist:{' '}
          <a
            href="https://x.com/MoJuiceX"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-brand-primary)' }}
          >
            @MoJuiceX
          </a>
        </p>
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--color-brand-primary)' }}
        >
          Create. Share. Meme.
        </p>
      </div>
    </div>
  );
}

export default function Generator() {
  return (
    <GeneratorProvider>
      <GeneratorContent />
    </GeneratorProvider>
  );
}
