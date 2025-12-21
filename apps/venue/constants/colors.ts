// Buzzee - Futuristic Design System
// Inspired by the elegant pink/magenta brand identity

export const COLORS = {
  // Primary Brand - Vibrant Pink/Magenta from logo
  primary: '#E91E63',
  primaryLight: '#F06292',
  primaryLighter: '#FCE4EC',
  primaryDark: '#C2185B',
  primaryDarker: '#AD1457',
  primaryGradientStart: '#E91E63',
  primaryGradientEnd: '#F06292',
  primaryGradientVibrant: '#FF1744',

  // Secondary - Deep Purple for contrast
  secondary: '#7C3AED',
  secondaryLight: '#A78BFA',
  secondaryLighter: '#EDE9FE',
  secondaryDark: '#6D28D9',
  secondaryGradientStart: '#7C3AED',
  secondaryGradientEnd: '#A78BFA',

  // Accent - Cyan for futuristic highlights
  accent: '#00BCD4',
  accentLight: '#4DD0E1',
  accentLighter: '#E0F7FA',
  accentDark: '#00ACC1',

  // Cream/Off-white from logo text
  cream: '#FDF6F0',
  creamDark: '#F5E6D3',

  // Neutral - Modern dark grays
  white: '#FFFFFF',
  black: '#000000',
  text: '#1A1A2E',
  textSecondary: '#4A4A68',
  textTertiary: '#8E8EA9',
  textMuted: '#B8B8D1',
  textInverse: '#FFFFFF',

  // Backgrounds - Clean with subtle pink tint
  background: '#FFFFFF',
  backgroundSecondary: '#FAFAFA',
  backgroundTertiary: '#F5F5F7',
  backgroundElevated: '#FFFFFF',
  backgroundDark: '#1A1A2E',
  backgroundDarkSecondary: '#2D2D44',

  // Borders
  border: '#E8E8F0',
  borderLight: '#F0F0F5',
  borderDark: '#D0D0E0',
  borderFocus: '#E91E63',
  divider: '#F0F0F5',

  // Surface
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Semantic Colors
  success: '#00C853',
  successLight: '#E8F5E9',
  successDark: '#00A843',
  successGradientStart: '#00C853',
  successGradientEnd: '#69F0AE',

  warning: '#FF9100',
  warningLight: '#FFF3E0',
  warningDark: '#E65100',
  warningGradientStart: '#FF9100',
  warningGradientEnd: '#FFAB40',

  error: '#FF1744',
  errorLight: '#FFEBEE',
  errorDark: '#D50000',
  errorGradientStart: '#FF1744',
  errorGradientEnd: '#FF5252',

  info: '#2196F3',
  infoLight: '#E3F2FD',
  infoDark: '#1976D2',
  infoGradientStart: '#2196F3',
  infoGradientEnd: '#64B5F6',

  // Interactive States
  pressed: 'rgba(233, 30, 99, 0.08)',
  hover: 'rgba(233, 30, 99, 0.04)',
  focus: 'rgba(233, 30, 99, 0.12)',
  disabled: '#E5E5EA',
  disabledText: '#AEAEB2',

  // Specific UI Elements
  star: '#FFD700',
  starEmpty: '#E0E0E0',
  heart: '#E91E63',
  heartEmpty: '#D0D0D0',
  verified: '#00C853',
  premium: '#FFD700',

  // Venue Category Colors
  bar: '#E91E63',
  barLight: '#FCE4EC',
  restaurant: '#00C853',
  restaurantLight: '#E8F5E9',
  club: '#7C3AED',
  clubLight: '#EDE9FE',
  hotel: '#2196F3',
  hotelLight: '#E3F2FD',
  cafe: '#FF9100',
  cafeLight: '#FFF3E0',

  // Glassmorphism - Futuristic
  glass: 'rgba(255, 255, 255, 0.8)',
  glassDark: 'rgba(26, 26, 46, 0.85)',
  glassLight: 'rgba(255, 255, 255, 0.5)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  glassPink: 'rgba(233, 30, 99, 0.1)',

  // Overlay
  overlay: 'rgba(26, 26, 46, 0.5)',
  overlayLight: 'rgba(26, 26, 46, 0.3)',
  overlayDark: 'rgba(26, 26, 46, 0.8)',

  // Shimmer
  shimmerBase: '#F0F0F5',
  shimmerHighlight: '#FFFFFF',

  // Shadow color reference
  shadowColor: '#1A1A2E',

  // Gradients object for reference
  gradients: {
    primary: ['#E91E63', '#F06292'],
    primaryVibrant: ['#FF1744', '#E91E63', '#F06292'],
    secondary: ['#7C3AED', '#A78BFA'],
    success: ['#00C853', '#69F0AE'],
    warning: ['#FF9100', '#FFAB40'],
    error: ['#FF1744', '#FF5252'],
    info: ['#2196F3', '#64B5F6'],
    sunset: ['#E91E63', '#FF9100'],
    ocean: ['#2196F3', '#00BCD4'],
    aurora: ['#7C3AED', '#E91E63', '#FF9100'],
    dark: ['#1A1A2E', '#2D2D44'],
    glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)'],
    skeleton: ['#F0F0F5', '#E8E8F0', '#F0F0F5'],
    futuristic: ['#E91E63', '#7C3AED', '#00BCD4'],
    neon: ['#FF1744', '#E91E63', '#F50057'],
  },
} as const;

// Futuristic Typography System - Elegant & Modern
export const TYPOGRAPHY = {
  // Font families - Using system fonts that complement the elegant logo
  fonts: {
    // Primary - Clean sans-serif for body text
    primary: 'System',
    // Display - For headlines and branding
    display: 'System',
    // Mono - For codes and numbers
    mono: 'monospace',
  },

  // Fluid type scale
  sizes: {
    '2xs': 10,
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
    '4xl': 44,
    '5xl': 56,
    '6xl': 68,
  },

  // Font weights
  weights: {
    thin: '200' as const,
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
    black: '900' as const,
  },

  // Line heights
  lineHeights: {
    none: 1,
    tight: 1.15,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.65,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -1,
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
} as const;

// 4px Grid Spacing System
export const SPACING = {
  '2xs': 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
  '7xl': 96,
  '8xl': 128,
} as const;

// Border Radius System - More rounded for modern feel
export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  full: 9999,
} as const;

// Advanced Shadow System
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 16,
  },
  // Pink/Magenta glow shadows
  primary: {
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryLg: {
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 12,
  },
  secondary: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  success: {
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  // Neon glow effect
  neon: {
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  neonCyan: {
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  // Button shadows
  button: {
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  buttonPressed: {
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  // Card shadows
  card: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHover: {
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
  },
  // Floating elements
  float: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 16,
  },
} as const;

// Animation Constants
export const ANIMATION = {
  // Durations
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
    slowest: 700,
  },

  // Legacy support
  fast: 150,
  normal: 250,
  slow: 400,
  verySlow: 600,

  // Spring configs for react-native animated
  spring: {
    snappy: { damping: 20, stiffness: 400, mass: 1 },
    bouncy: { damping: 10, stiffness: 200, mass: 0.8 },
    smooth: { damping: 20, stiffness: 150, mass: 1 },
    gentle: { damping: 25, stiffness: 100, mass: 1 },
    stiff: { damping: 30, stiffness: 500, mass: 1 },
    default: { damping: 15, stiffness: 250, mass: 1 },
  },

  // Scale values for press states
  scale: {
    pressed: 0.96,
    pressedSm: 0.98,
    hover: 1.02,
    hoverLg: 1.05,
  },
} as const;

// Gradients for LinearGradient - Futuristic Pink Theme
export const GRADIENTS = {
  primary: ['#E91E63', '#F06292'] as const,
  primaryVibrant: ['#FF1744', '#E91E63', '#F06292'] as const,
  primaryDark: ['#C2185B', '#E91E63'] as const,
  secondary: ['#7C3AED', '#A78BFA'] as const,
  secondaryVibrant: ['#6D28D9', '#7C3AED', '#A78BFA'] as const,
  success: ['#00C853', '#69F0AE'] as const,
  warning: ['#FF9100', '#FFAB40'] as const,
  error: ['#FF1744', '#FF5252'] as const,
  info: ['#2196F3', '#64B5F6'] as const,
  sunset: ['#E91E63', '#FF9100'] as const,
  ocean: ['#2196F3', '#00BCD4'] as const,
  aurora: ['#7C3AED', '#E91E63', '#00BCD4'] as const,
  dark: ['#1A1A2E', '#2D2D44'] as const,
  darkReverse: ['#2D2D44', '#1A1A2E'] as const,
  glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)'] as const,
  glassDark: ['rgba(26,26,46,0.9)', 'rgba(26,26,46,0.7)'] as const,
  skeleton: ['#F0F0F5', '#E8E8F0', '#F0F0F5'] as const,
  shimmer: ['transparent', 'rgba(255,255,255,0.6)', 'transparent'] as const,
  // Futuristic gradients
  futuristic: ['#E91E63', '#7C3AED', '#00BCD4'] as const,
  neon: ['#FF1744', '#E91E63'] as const,
  neonPurple: ['#E91E63', '#7C3AED'] as const,
  neonCyan: ['#00BCD4', '#00E5FF'] as const,
  cyberpunk: ['#E91E63', '#00BCD4'] as const,
} as const;

// Blur values
export const BLUR = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 40,
} as const;

// Z-Index System
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
  max: 9999,
} as const;

// Type exports
export type ColorName = keyof typeof COLORS;

// Alias for backwards compatibility
export const Colors = COLORS;

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  ANIMATION,
  GRADIENTS,
  BLUR,
  Z_INDEX,
};
