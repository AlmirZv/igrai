import { reactive, toRefs, watch } from 'vue'
import type { UserSettings } from '@/types/settings'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db, auth } from '@/config/firebase'

import { applyTheme, lightTheme, dandadanTheme, darkTheme } from '@/designSystem'

import { i18n, setI18nLanguage } from '@/locales/i18n/index'
import { Preferences } from '@capacitor/preferences'

const emptySettings: UserSettings = {
  profile: {
    visibleOnMap: true,
    showLocation: true,
    allowTaskInvites: true,
    notifications: {
      taskUpdates: true,
      messages: true,
      achievements: true,
      pushNotifications: true,
    },
  },
  app: {
    language: 'ru',
    theme: 'dark',
    fontSize: 'medium',
    soundEnabled: true,
    vibrationEnabled: true,
  },
  map: {
    showTasks: true,
    showUsers: true,
    defaultZoom: 15,
    mapType: 'default',
    autoRefresh: true,
    refreshInterval: 5,
  },
}

const state = reactive({
  settings: JSON.parse(JSON.stringify(emptySettings)) as UserSettings,
  draft: JSON.parse(JSON.stringify(emptySettings)) as UserSettings,
})

const themeMap = {
  light: lightTheme,
  dark: darkTheme,
  dandadan: dandadanTheme,
} as const

export async function getUserSettings(id?: string) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')
  const uid = auth.currentUser.uid

  const settingsRef = doc(db, 'userSettings', id ?? uid)
  const snap = await getDoc(settingsRef)
  const settings = snap.data() as UserSettings

  state.settings = settings
  state.draft = JSON.parse(JSON.stringify(settings))
  console.log(settings)

  // Применяем настройки при загрузке
  applyTheme(themeMap[state.draft.app.theme])
  await setI18nLanguage(state.draft.app.language)

  return settings
}

export async function applyDraft(uid: string) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')

  const settingsRef = doc(db, 'userSettings', uid)

  await updateDoc(settingsRef, JSON.parse(JSON.stringify(state.draft)))

  state.settings = JSON.parse(JSON.stringify(state.draft))
}

export function resetDraft() {
  state.draft = JSON.parse(JSON.stringify(state.settings))
}

export async function setLanguage(lang: string) {
  // Меняем язык в vue-i18n
  // i18n.global.locale.value = lang
  await setI18nLanguage(lang)

  // Сохраняем в нативное хранилище (Capacitor)
  // await Preferences.set({
  //   key: 'app_language',
  //   value: lang,
  // })
}

export async function loadPreferredLanguage() {
  const { value } = await Preferences.get({ key: 'app_language' })
  if (value) {
    i18n.global.locale.value = value
  }
}

// WATCHERS — Автоприменение настроек
watch(
  () => state.draft.app?.theme,
  (newTheme) => {
    if (!newTheme) return
    applyTheme(themeMap[newTheme])
  },
)
watch(
  () => state.draft.app.language,
  async (lang) => {
    if (!lang) return
    console.log('here')

    await setI18nLanguage(lang)
  },
)

export default () => ({
  state: toRefs(state),
  getUserSettings,
  applyDraft,
  resetDraft,
})
