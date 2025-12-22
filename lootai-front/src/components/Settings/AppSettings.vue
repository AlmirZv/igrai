<template>
  <SettingsSection title="Приложение" open>
    <label class="row">
      <span>Язык интерфейса 🌐</span>
      <Select width="100" v-model="settings.app.language" @change="saveSettings">
        <option value="ru">Русский</option>
        <option value="en">English</option>
      </Select>
    </label>

    <label class="row">
      <span>Тема</span>
      <Select width="100" v-model="settings.app.theme" @change="saveSettings">
        <option value="light">Светлая</option>
        <option value="dark">Тёмная</option>
      </Select>
    </label>

    <label class="row">
      <span>Размер шрифта</span>
      <Select width="100" v-model="settings.app.fontSize" @change="saveSettings">
        <option value="small">Маленький</option>
        <option value="medium">Средний</option>
        <option value="large">Большой</option>
      </Select>
    </label>

    <label class="row">
      <span>Звуки</span>
      <input type="checkbox" v-model="settings.app.soundEnabled" @change="saveSettings" />
    </label>

    <label class="row">
      <span>Вибрация</span>
      <input type="checkbox" v-model="settings.app.vibrationEnabled" @change="saveSettings" />
    </label>

    <div class="version-info">
      <p class="version">Версия: {{ appConfig.version }}</p>
      <p class="build">Сборка: {{ appConfig.buildDate }}</p>
    </div>
  </SettingsSection>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import type { UserSettings, AppConfig } from '../../types/settings'
import SettingsSection from './SettingsSection.vue'
import { Text, Input, Select } from '@/designSystem/components'

const settings = ref<UserSettings>({
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
})

const appConfig = ref<AppConfig>({
  version: '1.0.0',
  minVersion: '1.0.0',
  buildDate: new Date().toISOString().split('T')[0],
  features: {
    chat: true,
    tasks: true,
    achievements: true,
    inventory: true,
  },
  limits: {
    maxTaskParticipants: 10,
    maxChatMessages: 1000,
    maxFileSize: 5242880, // 5MB
  },
})

const loadSettings = async () => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const settingsRef = doc(db, 'userSettings', uid)
    const snap = await getDoc(settingsRef)

    if (snap.exists()) {
      settings.value = { ...settings.value, ...snap.data() }
    }
  } catch (error) {
    console.error('Error loading app settings:', error)
  }
}

const saveSettings = async () => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const settingsRef = doc(db, 'userSettings', uid)
    await setDoc(settingsRef, settings.value, { merge: true })
  } catch (error) {
    console.error('Error saving app settings:', error)
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
/* Ряд настроек */
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
  font-size: var(--font-size-sm);
  border-bottom: 1px solid var(--border-subtle);
}

.row:last-child {
  border-bottom: none;
}

.row span {
  color: var(--text-muted);
}

/* Чекбокс */
.row input[type='checkbox'] {
  width: 20px;
  height: 20px;
  accent-color: var(--text-accent);
  cursor: pointer;
}

/* Range sliders */
.row input[type='range'] {
  accent-color: var(--text-accent);
  width: 120px;
}

.range-value {
  min-width: 40px;
  text-align: right;
  color: var(--text-muted);
}

/* Подблок настроек */
.sub-block {
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Фильтры задач */
.task-filters {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-subtle);
}

.task-filters summary {
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  color: var(--text-accent);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-sm);
}

.content {
  padding: var(--space-sm) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.version-info {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-subtle);
}

.version,
.build {
  margin: var(--space-sm) 0;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-align: center;
}

.version {
  font-weight: var(--font-weight-semibold);
  color: var(--text-accent);
}
</style>
