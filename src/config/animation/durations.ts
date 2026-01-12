/**
 * Animation Duration System
 *
 * Research-backed timing based on Nielsen Norman Group perception thresholds.
 * Device-specific multipliers for optimal feel across screen sizes.
 */

/**
 * PERCEPTION THRESHOLDS:
 *
 * < 100ms  → Perceived as INSTANT (micro-feedback, button press)
 * 100-300ms → Perceived as FAST (small UI transitions, hover)
 * 300-500ms → Perceived as NORMAL (page transitions, modals)
 * > 500ms  → Perceived as SLOW (decorative only)
 * > 1000ms → Perceived as DISCONNECTED (user loses cause-effect)
 */
export const DURATION = {
  // Instant feedback (< 100ms perceived as instant)
  instant: 50,

  // Micro-interactions (button press, toggle, selection)
  micro: 100,

  // Fast transitions (hover, small element movement)
  fast: 150,

  // Standard transitions (most UI changes)
  normal: 200,

  // Moderate transitions (modals, drawers)
  moderate: 300,

  // Complex transitions (page changes, large movements)
  complex: 400,

  // Decorative/attention (use sparingly)
  slow: 500,

  // Continuous animations (loading, pulse)
  continuous: 1000,
} as const;

export type DurationKey = keyof typeof DURATION;

/**
 * Device multipliers based on research:
 * - Web users expect instant response
 * - Mobile optimal at 200-300ms (Material Design)
 * - Tablet 30% longer (larger distances)
 * - Wearable 30% shorter (smaller distances)
 */
export const DEVICE_MULTIPLIER = {
  mobile: 1,
  tablet: 1.3,
  desktop: 0.75,
  wearable: 0.7,
} as const;

export type DeviceType = keyof typeof DEVICE_MULTIPLIER;

/**
 * Get device-adjusted duration
 */
export const getDeviceDuration = (
  base: number,
  device: DeviceType = 'desktop'
): number => Math.round(base * DEVICE_MULTIPLIER[device]);

/**
 * Convert duration to seconds for Framer Motion
 */
export const toSeconds = (ms: number): number => ms / 1000;

/**
 * Duration guidelines reference:
 *
 * | Animation Type   | Duration | Rationale           |
 * |------------------|----------|---------------------|
 * | Button press     | 100ms    | Instant feedback    |
 * | Hover effect     | 150ms    | Fast but visible    |
 * | Tooltip appear   | 200ms    | Quick info reveal   |
 * | Dropdown open    | 200ms    | Responsive feel     |
 * | Modal enter      | 300ms    | Allow tracking      |
 * | Modal exit       | 200ms    | Exits faster        |
 * | Page transition  | 300-400ms| Time to perceive    |
 * | Drawer slide     | 300ms    | Spatial awareness   |
 * | Toast appear     | 250ms    | Attention w/o disrupt|
 * | Loading spinner  | 1000ms   | Continuous indicator|
 */
