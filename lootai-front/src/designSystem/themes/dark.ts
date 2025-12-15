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
  space: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
  },
}
