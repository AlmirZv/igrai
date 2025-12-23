import type { ThemeTokens } from '../tokens'

export const lightTheme: ThemeTokens = {
  bg: {
    app: '#F6F7F9', // светлый фон всего приложения
    map: '#FFFFFF', // чистый фон карты / белый холст
    surface: '#FFFFFF', // карточки / блоки
    overlay: 'rgb(227, 227, 227)', // лёгкий оверлей
  },
  text: {
    primary: '#1A1A1E', // почти чёрный — читаемость
    secondary: '#4A4A55', // приглушённый серый
    muted: '#8C8C9A', // для вспомогательных надписей
    accent: '#007AFF', // яркий синий (как iOS primary)
    onAccent: '#FFFFFF', // текст на кнопках
  },
  accent: {
    primary: '#007AFF', // фирменный синий акцент
    secondary: '#34C759', // зелёный акцент (успех)
    special: '#FF2D55', // розово-красный для выделений
  },
  state: {
    success: '#34C759',
    warning: '#FFCC00',
    error: '#FF3B30',
  },
  border: {
    subtle: 'rgba(0,0,0,0.08)', // лёгкие линии
    strong: 'rgba(0,0,0,0.16)', // более заметные разделители
  },
  shadow: {
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.12)',
    lg: '0 8px 20px rgba(0,0,0,0.16)',
    xs: '0 1px 2px rgba(0,0,0,0.06)',
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
      emphasized: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
}
