<template>
  <SettingsSection title="Приложение" open>
    <label class="row">
      <span>Язык интерфейса 🌐</span>
      <select v-model="settings.app.language" @change="saveSettings">
        <option value="ru">Русский</option>
        <option value="en">English</option>
      </select>
    </label>

    <label class="row">
      <span>Тема</span>
      <select v-model="settings.app.theme" @change="saveSettings">
        <option value="light">Светлая</option>
        <option value="dark">Тёмная</option>
      </select>
    </label>

    <label class="row">
      <span>Размер шрифта</span>
      <select v-model="settings.app.fontSize" @change="saveSettings">
        <option value="small">Маленький</option>
        <option value="medium">Средний</option>
        <option value="large">Большой</option>
      </select>
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
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.row:last-child {
  border-bottom: none;
}

.row span {
  color: #e5e7eb;
  font-size: 14px;
  font-weight: 500;
}

.row select {
  background: #374151;
  color: #e5e7eb;
  border: 1px solid #4b5563;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  min-width: 120px;
}

.row select:focus {
  outline: none;
  border-color: #25b9a0;
  box-shadow: 0 0 0 2px rgba(37, 185, 160, 0.2);
}

.row input[type='checkbox'] {
  width: 20px;
  height: 20px;
  accent-color: #25b9a0;
  cursor: pointer;
}

.version-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.version,
.build {
  margin: 4px 0;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
}

.version {
  font-weight: 600;
  color: #25b9a0;
}

@media (max-width: 480px) {
  .row {
    margin: 10px 0;
    padding: 6px 0;
  }

  .row span {
    font-size: 13px;
  }

  .row select {
    font-size: 13px;
    padding: 5px 10px;
    min-width: 100px;
  }
}
</style>
