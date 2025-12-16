// src/designSystem/utils/applyTheme.ts
import type { ThemeTokens } from '../tokens'

export function applyTheme(theme: ThemeTokens) {
  const root = document.documentElement

  const walk = (obj: any, path: string[] = []) => {
    for (const [key, value] of Object.entries(obj)) {
      const next = [...path, key]
      if (typeof value === 'object') {
        walk(value, next)
      } else {
        root.style.setProperty(`--${next.join('-')}`, value as string)
      }
    }
  }

  walk(theme)
}
