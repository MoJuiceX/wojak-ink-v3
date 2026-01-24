/**
 * Drawer Style Preview Component
 *
 * Renders unique visual previews for drawer customization items
 * instead of generic placeholder icons.
 */

import './DrawerStylePreview.css';

interface DrawerStylePreviewProps {
  item: {
    id: string;
    name: string;
    category: string;
    css_value?: string | null;
    css_class?: string | null;
    preview_type?: string | null;
  };
}

export function DrawerStylePreview({ item }: DrawerStylePreviewProps) {
  const { category, css_value, css_class } = item;

  // Font Colors - show text sample in that color
  if (category === 'font_color') {
    const isGradient = css_value?.includes('gradient');

    return (
      <div className="drawer-preview font-color-preview">
        <span
          className="preview-text"
          style={{
            color: isGradient ? undefined : css_value || '#fff',
            background: isGradient ? (css_value || undefined) : undefined,
            WebkitBackgroundClip: isGradient ? 'text' : undefined,
            WebkitTextFillColor: isGradient ? 'transparent' : undefined,
            backgroundClip: isGradient ? 'text' : undefined,
          }}
        >
          Aa
        </span>
        <div
          className="color-swatch"
          style={{
            background: css_value || '#fff',
          }}
        />
      </div>
    );
  }

  // Font Styles - show styled text
  if (category === 'font_style') {
    return (
      <div className="drawer-preview font-style-preview">
        <span className={`preview-text ${css_class || ''}`}>
          Aa
        </span>
      </div>
    );
  }

  // Font Families - show font sample
  if (category === 'font_family') {
    return (
      <div className="drawer-preview font-family-preview">
        <span
          className="preview-text"
          style={{ fontFamily: css_value || 'system-ui' }}
        >
          Aa
        </span>
      </div>
    );
  }

  // Page Backgrounds - show background preview
  if (category === 'page_background') {
    return (
      <div className={`drawer-preview background-preview ${css_class || ''}`}>
        <div className="mini-drawer">
          <div className="mini-header" />
          <div className="mini-grid">
            <div className="mini-nft" />
            <div className="mini-nft" />
          </div>
        </div>
      </div>
    );
  }

  // Collection Layouts - show layout diagram
  if (category === 'collection_layout') {
    return (
      <div className="drawer-preview layout-preview">
        <LayoutDiagram layoutId={item.id} />
      </div>
    );
  }

  // Avatar Glow - show glowing circle
  if (category === 'avatar_glow') {
    return (
      <div className="drawer-preview avatar-glow-preview">
        <div className={`preview-avatar ${css_class || ''}`} />
      </div>
    );
  }

  // Avatar Size - show size comparison
  if (category === 'avatar_size') {
    const sizeMap: Record<string, number> = {
      'avatar-size-normal': 24,
      'avatar-size-large': 32,
      'avatar-size-xlarge': 40,
      'avatar-size-massive': 48,
    };
    const size = sizeMap[item.id] || 24;

    return (
      <div className="drawer-preview avatar-size-preview">
        <div
          className="preview-avatar"
          style={{ width: size, height: size }}
        />
      </div>
    );
  }

  // Card Styles - show card preview
  if (category === 'card_style') {
    return (
      <div className="drawer-preview card-style-preview">
        <div className={`mini-card ${css_class || ''}`}>
          <div className="card-image" />
          <div className="card-text" />
        </div>
      </div>
    );
  }

  // Entrance Animations - show animation icon
  if (category === 'entrance_animation') {
    return (
      <div className="drawer-preview entrance-preview">
        <div className={`animation-demo ${css_class || ''}`}>
          <div className="demo-element" />
        </div>
      </div>
    );
  }

  // Dialogue Styles - show speech bubble
  if (category === 'dialogue_style') {
    return (
      <div className="drawer-preview dialogue-preview">
        <div className={`mini-dialogue ${css_class || ''}`}>
          Hi!
        </div>
      </div>
    );
  }

  // BigPulp Position - show position diagram
  if (category === 'bigpulp_position') {
    return (
      <div className="drawer-preview position-preview">
        <PositionDiagram positionId={item.id} />
      </div>
    );
  }

  // Stats Style - show mini stats
  if (category === 'stats_style') {
    return (
      <div className="drawer-preview stats-preview">
        <div className={`mini-stats ${css_class || ''}`}>
          <span>42</span>
          <span>NFTs</span>
        </div>
      </div>
    );
  }

  // Tabs Style - show mini tabs
  if (category === 'tabs_style') {
    return (
      <div className="drawer-preview tabs-preview">
        <div className={`mini-tabs ${css_class || ''}`}>
          <span className="active">Tab</span>
          <span>Tab</span>
        </div>
      </div>
    );
  }

  // Visitor Counter - show counter preview
  if (category === 'visitor_counter') {
    if (item.id === 'visitor-counter-hidden') {
      return (
        <div className="drawer-preview counter-preview">
          <span className="hidden-text">Hidden</span>
        </div>
      );
    }
    return (
      <div className="drawer-preview counter-preview">
        <div className={`mini-counter ${css_class || ''}`}>
          1,234
        </div>
      </div>
    );
  }

  // Default fallback - show sparkle icon
  return (
    <div className="drawer-preview default-preview">
      <svg
        viewBox="0 0 24 24"
        width="40"
        height="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
      </svg>
    </div>
  );
}

// Layout diagram component
function LayoutDiagram({ layoutId }: { layoutId: string }) {
  switch (layoutId) {
    case 'layout-grid':
      return (
        <div className="layout-diagram grid">
          <div /><div /><div /><div />
        </div>
      );
    case 'layout-list':
      return (
        <div className="layout-diagram list">
          <div /><div /><div />
        </div>
      );
    case 'layout-showcase':
      return (
        <div className="layout-diagram showcase">
          <div className="main" />
          <div className="side"><div /><div /></div>
        </div>
      );
    case 'layout-carousel':
      return (
        <div className="layout-diagram carousel">
          <div className="left" />
          <div className="center" />
          <div className="right" />
        </div>
      );
    case 'layout-masonry':
      return (
        <div className="layout-diagram masonry">
          <div className="col"><div className="tall" /><div /></div>
          <div className="col"><div /><div className="tall" /></div>
        </div>
      );
    default:
      return (
        <div className="layout-diagram grid">
          <div /><div /><div /><div />
        </div>
      );
  }
}

// Position diagram component
function PositionDiagram({ positionId }: { positionId: string }) {
  const positions: Record<string, { left: string; top: string }> = {
    'bigpulp-pos-right': { left: '70%', top: '50%' },
    'bigpulp-pos-left': { left: '20%', top: '50%' },
    'bigpulp-pos-center': { left: '50%', top: '50%' },
    'bigpulp-pos-hidden': { left: '-100%', top: '50%' },
  };

  const pos = positions[positionId] || positions['bigpulp-pos-right'];
  const isHidden = positionId === 'bigpulp-pos-hidden';

  return (
    <div className="position-diagram">
      <div className="diagram-drawer" />
      {!isHidden && (
        <div
          className="diagram-bigpulp"
          style={{
            left: pos.left,
            top: pos.top,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
      {isHidden && <span className="hidden-label">Hidden</span>}
    </div>
  );
}
