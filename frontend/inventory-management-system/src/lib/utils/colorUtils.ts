/**
 * Color utility functions for generating distinct, visually appealing colors
 * Used for charts, badges, and other UI components that need color differentiation
 */

// Predefined color palette with high contrast and accessibility in mind
export const DEFAULT_COLOR_PALETTE = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#0088fe',
  '#00c49f',
  '#ffbb28',
  '#ff8042',
  '#8dd1e1',
  '#d084d0',
  '#67b7dc',
  '#ffb347',
  '#87ceeb',
  '#dda0dd',
  '#98fb98',
  '#f0e68c',
  '#ffa07a',
  '#20b2aa',
  '#87cefa',
  '#deb887',
  '#5f9ea0',
  '#cd5c5c',
  '#4682b4',
  '#d2691e',
  '#9acd32',
  '#ee82ee',
  '#90ee90',
  '#f4a460',
  '#40e0d0',
  '#da70d6',
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#96ceb4',
  '#ffeaa7',
  '#dda0dd',
  '#98d8c8',
  '#f7dc6f',
  '#bb8fce',
  '#85c1e9',
];

/**
 * Generates a distinct color using HSL color space
 * Uses the golden angle to distribute hues evenly for maximum visual distinction
 *
 * @param index - The index for color generation
 * @param options - Configuration options for color generation
 */
export interface ColorGenerationOptions {
  saturationBase?: number; // Base saturation (0-100)
  lightnessBase?: number; // Base lightness (0-100)
  saturationRange?: number; // Range of saturation variation
  lightnessRange?: number; // Range of lightness variation
  avoidDarkColors?: boolean; // Avoid colors that are too dark
  avoidLightColors?: boolean; // Avoid colors that are too light
}

export function generateDistinctColor(
  index: number,
  options: ColorGenerationOptions = {}
): string {
  const {
    saturationBase = 65,
    lightnessBase = 55,
    saturationRange = 25,
    lightnessRange = 20,
    avoidDarkColors = true,
    avoidLightColors = true,
  } = options;

  // Use golden angle for optimal hue distribution
  const goldenAngle = 137.508; // Golden angle in degrees
  const hue = (index * goldenAngle) % 360;

  // Create variation in saturation and lightness to avoid similar colors
  const saturationVariation = (index % 4) * (saturationRange / 4);
  const lightnessVariation = (Math.floor(index / 4) % 4) * (lightnessRange / 4);

  let saturation = saturationBase + saturationVariation;
  let lightness = lightnessBase + lightnessVariation;

  // Apply constraints
  saturation = Math.min(95, Math.max(30, saturation));

  if (avoidDarkColors && avoidLightColors) {
    lightness = Math.min(75, Math.max(40, lightness));
  } else if (avoidDarkColors) {
    lightness = Math.max(40, lightness);
  } else if (avoidLightColors) {
    lightness = Math.min(75, lightness);
  }

  return `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
}

/**
 * Get a color from the palette, falling back to generated colors for indices beyond the palette
 *
 * @param index - The index for color selection
 * @param customPalette - Optional custom color palette
 * @param options - Options for color generation when beyond palette
 */
export function getDistinctColor(
  index: number,
  customPalette: string[] = DEFAULT_COLOR_PALETTE,
  options: ColorGenerationOptions = {}
): string {
  if (index < customPalette.length) {
    return customPalette[index];
  }

  return generateDistinctColor(index - customPalette.length, options);
}

/**
 * Generate a complete color palette for a given number of items
 * Ensures no two adjacent colors are too similar
 *
 * @param count - Number of colors needed
 * @param options - Color generation options
 */
export function generateColorPalette(
  count: number,
  options: ColorGenerationOptions = {}
): string[] {
  const colors: string[] = [];
  const maxPaletteUse = Math.min(count, DEFAULT_COLOR_PALETTE.length);

  // Use predefined palette first
  for (let i = 0; i < maxPaletteUse; i++) {
    colors.push(DEFAULT_COLOR_PALETTE[i]);
  }

  // Generate additional colors if needed
  for (let i = maxPaletteUse; i < count; i++) {
    colors.push(generateDistinctColor(i, options));
  }

  return colors;
}

/**
 * Convert hex color to HSL
 * Useful for color manipulations
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Get contrasting text color (black or white) for a given background color
 * Useful for ensuring text readability on colored backgrounds
 */
export function getContrastTextColor(backgroundColor: string): string {
  // Convert color to RGB
  let r, g, b;

  if (backgroundColor.startsWith('#')) {
    r = parseInt(backgroundColor.slice(1, 3), 16);
    g = parseInt(backgroundColor.slice(3, 5), 16);
    b = parseInt(backgroundColor.slice(5, 7), 16);
  } else if (backgroundColor.startsWith('hsl')) {
    // For HSL colors, we'll use a simplified approach
    const lightness = parseInt(backgroundColor.match(/(\d+)%\)$/)?.[1] || '50');
    return lightness > 60 ? '#000000' : '#ffffff';
  } else {
    // Default fallback
    return '#000000';
  }

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
}
