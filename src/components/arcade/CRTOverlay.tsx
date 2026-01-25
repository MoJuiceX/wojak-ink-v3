/**
 * CRT Overlay Effect Component
 *
 * Applies a CRT monitor aesthetic overlay to the arcade screen.
 * Includes scanlines, vignette, noise/grain, and screen glare.
 *
 * This effect is always enabled for all games.
 */

import './CRTOverlay.css';

interface CRTOverlayProps {
  /** Opacity of the overall effect (0-1, default 1) */
  intensity?: number;
}

export function CRTOverlay({ intensity = 1 }: CRTOverlayProps) {
  return (
    <div
      className="crt-overlay"
      style={{ '--crt-intensity': intensity } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* Scanlines layer */}
      <div className="crt-scanlines" />

      {/* Vignette layer */}
      <div className="crt-vignette" />

      {/* Noise/grain layer (animated) */}
      <div className="crt-noise" />

      {/* Screen curvature highlight */}
      <div className="crt-screen-glare" />
    </div>
  );
}

export default CRTOverlay;
