// src/designSystem/themes/dark.ts
import type { ThemeTokens } from '../tokens'

export const darkTheme: ThemeTokens = {
  bg: {
    app: '#0E0E11',
    map: '#0A0A0D',
    surface: '#18181D',
    overlay: '#1F1F26',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3C2',
    muted: '#7A7A8C',
    accent: '#6CF2C2',
    onAccent: '#0E0E11',
  },
  accent: {
    primary: '#6CF2C2',
    secondary: '#4AA3FF',
    special: '#F472D0',
  },
  state: {
    success: '#4ADE80',
    warning: '#FACC15',
    error: '#F87171',
  },
  border: {
    subtle: 'rgba(255,255,255,0.08)',
    strong: 'rgba(255,255,255,0.16)',
  },
  shadow: {
    sm: '0 2px 6px rgba(0,0,0,0.2)',
    md: '0 10px 20px rgba(0,0,0,0.3)',
    lg: '0 10px 20px rgba(102, 126, 234, 0.3)',
    xs: '0 3px 6px rgba(102, 126, 234, 0.3)',
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    pill: '32px',
  },
  font: {
    family: {
      base: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, monospace',
      brand: '"Pacifico", cursive',
    },
    size: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '22px',
      xxl: '40px',
    },
    weight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.7',
    },
    letterSpacing: {
      xs: '0.02em',
      sm: '0.04em',
      md: '0.06em',
      lg: '0.08em',
      xl: '0.1em',
      xxl: '0.14em',
    },
  },
  motion: {
    duration: {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.5s',
    },
    easing: {
      standard: 'ease',
      emphasized: '',
    },
  },
}
