/**
 * Color Utilities
 * Color manipulation, conversion, and interpolation
 */

// ============================================
// TYPES
// ============================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSLA extends HSL {
  a: number;
}

// ============================================
// COLOR CONVERSION
// ============================================

/**
 * Hex to RGB
 */
export const hexToRgb = (hex: string): RGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

/**
 * RGB to Hex
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * RGB to HSL
 */
export const rgbToHsl = (r: number, g: number, b: number): HSL => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

/**
 * HSL to RGB
 */
export const hslToRgb = (h: number, s: number, l: number): RGB => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

/**
 * Hex to HSL
 */
export const hexToHsl = (hex: string): HSL => {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
};

/**
 * HSL to Hex
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

// ============================================
// COLOR INTERPOLATION
// ============================================

/**
 * Lerp between two RGB colors
 */
export const lerpRgb = (color1: RGB, color2: RGB, t: number): RGB => ({
  r: Math.round(color1.r + (color2.r - color1.r) * t),
  g: Math.round(color1.g + (color2.g - color1.g) * t),
  b: Math.round(color1.b + (color2.b - color1.b) * t),
});

/**
 * Lerp between two hex colors
 */
export const lerpColor = (hex1: string, hex2: string, t: number): string => {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const result = lerpRgb(c1, c2, t);
  return rgbToHex(result.r, result.g, result.b);
};

/**
 * Lerp through multiple colors
 */
export const lerpColors = (colors: string[], t: number): string => {
  if (colors.length === 0) return '#000000';
  if (colors.length === 1) return colors[0];

  const segments = colors.length - 1;
  const segment = Math.floor(t * segments);
  const localT = (t * segments) % 1;

  if (segment >= segments) return colors[colors.length - 1];

  return lerpColor(colors[segment], colors[segment + 1], localT);
};

// ============================================
// COLOR MANIPULATION
// ============================================

/**
 * Lighten color by percentage
 */
export const lighten = (hex: string, percent: number): string => {
  const hsl = hexToHsl(hex);
  hsl.l = Math.min(100, hsl.l + percent);
  return hslToHex(hsl.h, hsl.s, hsl.l);
};

/**
 * Darken color by percentage
 */
export const darken = (hex: string, percent: number): string => {
  const hsl = hexToHsl(hex);
  hsl.l = Math.max(0, hsl.l - percent);
  return hslToHex(hsl.h, hsl.s, hsl.l);
};

/**
 * Saturate color by percentage
 */
export const saturate = (hex: string, percent: number): string => {
  const hsl = hexToHsl(hex);
  hsl.s = Math.min(100, hsl.s + percent);
  return hslToHex(hsl.h, hsl.s, hsl.l);
};

/**
 * Desaturate color by percentage
 */
export const desaturate = (hex: string, percent: number): string => {
  const hsl = hexToHsl(hex);
  hsl.s = Math.max(0, hsl.s - percent);
  return hslToHex(hsl.h, hsl.s, hsl.l);
};

/**
 * Rotate hue by degrees
 */
export const rotateHue = (hex: string, degrees: number): string => {
  const hsl = hexToHsl(hex);
  hsl.h = (hsl.h + degrees + 360) % 360;
  return hslToHex(hsl.h, hsl.s, hsl.l);
};

/**
 * Get complementary color
 */
export const complementary = (hex: string): string => rotateHue(hex, 180);

/**
 * Get triadic colors
 */
export const triadic = (hex: string): [string, string, string] => [
  hex,
  rotateHue(hex, 120),
  rotateHue(hex, 240),
];

/**
 * Set alpha on hex color
 */
export const withAlpha = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

// ============================================
// COLOR STRINGS
// ============================================

/**
 * RGB to CSS string
 */
export const rgbString = (r: number, g: number, b: number): string =>
  `rgb(${r}, ${g}, ${b})`;

/**
 * RGBA to CSS string
 */
export const rgbaString = (
  r: number,
  g: number,
  b: number,
  a: number
): string => `rgba(${r}, ${g}, ${b}, ${a})`;

/**
 * HSL to CSS string
 */
export const hslString = (h: number, s: number, l: number): string =>
  `hsl(${h}, ${s}%, ${l}%)`;

/**
 * HSLA to CSS string
 */
export const hslaString = (
  h: number,
  s: number,
  l: number,
  a: number
): string => `hsla(${h}, ${s}%, ${l}%, ${a})`;

// ============================================
// COLOR PRESETS
// ============================================

/**
 * Generate random color
 */
export const randomColor = (): string => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return rgbToHex(r, g, b);
};

/**
 * Generate random pastel color
 */
export const randomPastel = (): string => {
  const h = Math.floor(Math.random() * 360);
  return hslToHex(h, 70, 80);
};

/**
 * Generate random vibrant color
 */
export const randomVibrant = (): string => {
  const h = Math.floor(Math.random() * 360);
  return hslToHex(h, 90, 50);
};

/**
 * Get contrast color (black or white)
 */
export const getContrastColor = (hex: string): string => {
  const rgb = hexToRgb(hex);
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// ============================================
// GAME COLOR PALETTES
// ============================================

export const GAME_PALETTES = {
  fire: ['#FF0000', '#FF4500', '#FF6B00', '#FFD700', '#FFFF00'],
  ice: ['#00BFFF', '#1E90FF', '#4169E1', '#0000CD', '#FFFFFF'],
  nature: ['#228B22', '#32CD32', '#90EE90', '#8B4513', '#654321'],
  ocean: ['#006994', '#40E0D0', '#00CED1', '#20B2AA', '#5F9EA0'],
  sunset: ['#FF4500', '#FF6347', '#FF7F50', '#FFD700', '#87CEEB'],
  neon: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000', '#00FF00'],
  pastel: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
  retro: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
};

/**
 * Get gradient stops for canvas gradient
 */
export const getGradientStops = (
  colors: string[]
): Array<{ offset: number; color: string }> => {
  return colors.map((color, i) => ({
    offset: i / (colors.length - 1),
    color,
  }));
};
