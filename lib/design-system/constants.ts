// TJV Recovery Platform - Design System Constants

export const colors = {
  // TJV Recovery Brand Colors - Primary (EXACT BRAND COLORS)
  primary: {
    DEFAULT: '#006DB1',   // Brand Blue - Primary actions
    dark: '#005A92',      // Darker shade for hover states
    navy: '#002238',      // Brand Navy - Headers, text
    blue: '#006DB1',      // Brand Blue (alias)
    lightBlue: '#C8DBE9', // Brand Light Blue - Backgrounds, accents
  },
  
  // Secondary Colors (Healthcare optimized)
  secondary: {
    green: '#059669',     // Success/Progress
    greenLight: '#10b981',
    greenDark: '#047857',
  },
  
  // Accent Colors (Healthcare specific)
  accent: {
    purple: '#7c3aed',    // Recovery/Progress
    orange: '#ea580c',    // Alerts/Attention
    teal: '#0d9488',      // Chat/Communication
  },
  
  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Status Colors
  status: {
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#006DB1',      // Changed from #2563eb to brand blue
  },
  
  // Semantic Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const

export const typography = {
  // Font Families
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  
  // Font Sizes (Optimized for 40+ age group)
  fontSize: {
    xs: '0.875rem',    // 14px - Minimum for any text
    sm: '1rem',        // 16px - Small text
    base: '1.125rem',  // 18px - Body text
    lg: '1.25rem',     // 20px - Large text
    xl: '1.5rem',      // 24px - Headings
    '2xl': '1.875rem', // 30px - Large headings
    '3xl': '2.25rem',  // 36px - Page titles
    '4xl': '2.5rem',   // 40px - Hero text
  },
  
  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
} as const

export const breakpoints = {
  mobile: '320px',
  mobileLg: '480px',
  tablet: '768px',
  desktop: '1024px',
  desktopLg: '1280px',
  desktopXl: '1536px',
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
  slower: '500ms ease-in-out',
} as const

// Healthcare-specific design tokens
export const healthcareTokens = {
  // Recovery phase colors
  recoveryPhases: {
    preOp: '#ea580c',       // accent.orange
    acute: '#dc2626',       // status.error
    early: '#006DB1',       // primary.blue
    intermediate: '#7c3aed', // accent.purple
    advanced: '#059669',    // secondary.green
    longTerm: '#047857',    // secondary.greenDark
  },
  
  // Task type colors
  taskTypes: {
    form: '#006DB1',        // Using brand blue
    exercise: '#059669',    // secondary.green
    education: '#7c3aed',   // accent.purple
    message: '#0d9488',     // accent.teal
    milestone: '#ea580c',   // accent.orange
  },
  
  // Status indicators
  statusIndicators: {
    online: '#059669',      // secondary.green
    offline: '#9ca3af',     // gray[400]
    busy: '#ea580c',        // accent.orange
    error: '#dc2626',       // status.error
  },
} as const

// Accessibility constants
export const a11y = {
  // Minimum touch target size
  minTouchTarget: '44px',
  
  // Focus ring styles
  focusRing: `ring-2 ring-offset-2 ring-[#006DB1]`, // Using brand blue directly
  
  // Color contrast ratios
  contrastRatios: {
    normal: 4.5,
    large: 3,
  },
} as const

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  notification: 70,
} as const