import type { Config } from 'tailwindcss'
import { colors, spacing, typography, borderRadius, shadows } from './lib/design-system/constants'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TJV Recovery Brand Colors
        primary: {
          DEFAULT: colors.primary.blue,     // #006DB1
          navy: colors.primary.navy,        // #002238
          light: colors.primary.lightBlue,  // #C8DBE9
        },
        // Secondary colors
        secondary: {
          DEFAULT: colors.secondary.green,
          light: colors.secondary.greenLight,
          dark: colors.secondary.greenDark,
        },
        // Accent colors
        accent: {
          purple: colors.accent.purple,
          orange: colors.accent.orange,
          teal: colors.accent.teal,
        },
        // Status colors
        success: colors.status.success,
        warning: colors.status.warning,
        error: colors.status.error,
        info: colors.status.info,
        // Gray scale
        gray: colors.gray,
      },
      fontFamily: {
        sans: typography.fontFamily.primary.split(','),
        mono: typography.fontFamily.mono.split(','),
      },
      fontSize: typography.fontSize,
      fontWeight: {
        normal: String(typography.fontWeight.normal),
        medium: String(typography.fontWeight.medium),
        semibold: String(typography.fontWeight.semibold),
        bold: String(typography.fontWeight.bold),
      },
      spacing: spacing,
      borderRadius: borderRadius,
      boxShadow: shadows,
      screens: {
        'xs': '320px',
        'sm': '480px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'fade-out': 'fadeOut 200ms ease-in-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'slide-in-left': 'slideInLeft 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'slide-down': 'slideDown 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      // Healthcare-specific utilities
      backgroundImage: {
        'gradient-health': 'linear-gradient(135deg, #006DB1 0%, #059669 100%)',
        'gradient-recovery': 'linear-gradient(135deg, #7c3aed 0%, #006DB1 100%)',
        'gradient-alert': 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
      },
    },
  },
  plugins: [],
}

export default config