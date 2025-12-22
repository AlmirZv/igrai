// src/designSystem/themes/dandadan.ts
import type { ThemeTokens } from '../tokens'

export const dandadanTheme: ThemeTokens = {
  bg: {
    app: '#08070B', // глубокий космический чёрный
    map: '#0C0A11',
    surface: '#14121D', // тёмный фиолетово-индиговый
    overlay: '#1B1826',
  },
  text: {
    primary: '#F5F3FF', // мягкий бело-фиолетовый
    secondary: '#C7BFEA',
    muted: '#8E87B2',
    accent: '#FF5AF2', // магентовый неон
    onAccent: '#130916',
  },
  accent: {
    primary: '#FF5AF2', // главный неон (магентовый)
    secondary: '#4EF3FF', // паранормальный бирюзовый
    special: '#FFB84E', // тёплый оранжевый (как сияние энерджи)
  },
  state: {
    success: '#5CFFBC', // яркая мятная вспышка
    warning: '#FFD54A',
    error: '#FF5978',
  },
  border: {
    subtle: 'rgba(255, 90, 242, 0.15)', // магента-глоу
    strong: 'rgba(78, 243, 255, 0.25)', // бирюза-глоу
  },
  shadow: {
    sm: '0 2px 6px rgba(255, 90, 242, 0.15)', // soft magenta glow
    md: '0 10px 20px rgba(78, 243, 255, 0.18)', // turquoise glow
    lg: '0 12px 28px rgba(255, 90, 242, 0.25)', // strong neon aura
    xs: '0 3px 6px rgba(78, 243, 255, 0.2)',
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
      brand: '"Orbitron", sans-serif', // более «sci-fi» настроение
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
      emphasized: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
}
