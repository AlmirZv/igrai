import { createI18n } from 'vue-i18n'
const localeModules: Record<string, Record<string, () => Promise<any>>> = {
  en: import.meta.glob('../en/*.json'),
  ru: import.meta.glob('../ru/*.json'),
  ja: import.meta.glob('../ja/*.json'),
}

// Lazy-loading переводов
const loadLocaleMessages = async (locale: string) => {
  // Импортируем абсолютно все JSON для всех языков
  console.log(locale)

  const modules = localeModules[locale]

  const messages: any = {}

  for (const path in modules) {
    const mod = (await modules[path]()) as any // FIX #1
    const filename = path.split('/').slice(-1)[0] // FIX #2
    const key = filename.replace('.json', '')

    messages[key] = mod.default
  }

  return messages
}

export const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'en',
  messages: {},
})

export const setI18nLanguage = async (locale: string) => {
  const messages = await loadLocaleMessages(locale)
  i18n.global.setLocaleMessage(locale, messages)
  i18n.global.locale.value = locale
}
