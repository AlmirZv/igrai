<template>
  <SettingsSection :title="$t('settings.profile.sectionTitle')" open>
    <!-- Основные настройки -->
    <label class="row">
      <span>{{ $t('settings.profile.visibleOnMap') }}</span>
      <input type="checkbox" v-model="settings.profile.visibleOnMap" @change="saveSettings" />
    </label>

    <label class="row">
      <span>{{ $t('settings.profile.showLocation') }}</span>
      <input type="checkbox" v-model="settings.profile.showLocation" @change="saveSettings" />
    </label>

    <label class="row">
      <span>{{ $t('settings.profile.allowTaskInvites') }}</span>
      <input type="checkbox" v-model="settings.profile.allowTaskInvites" @change="saveSettings" />
    </label>

    <!-- Уведомления -->
    <div class="notifications-block">
      <Text variant="h4">{{ $t('settings.profile.notifications') }}</Text>

      <label class="row">
        <span>{{ $t('settings.profile.notificationsFilters.taskUpdates') }}</span>
        <input
          type="checkbox"
          v-model="settings.profile.notifications.taskUpdates"
          @change="saveSettings"
        />
      </label>

      <label class="row">
        <span>{{ $t('settings.profile.notificationsFilters.messages') }}</span>
        <input
          type="checkbox"
          v-model="settings.profile.notifications.messages"
          @change="saveSettings"
        />
      </label>

      <label class="row">
        <span>{{ $t('settings.profile.notificationsFilters.achievements') }}</span>
        <input
          type="checkbox"
          v-model="settings.profile.notifications.achievements"
          @change="saveSettings"
        />
      </label>

      <label class="row">
        <span>{{ $t('settings.profile.notificationsFilters.push') }}</span>
        <input
          type="checkbox"
          v-model="settings.profile.notifications.pushNotifications"
          @change="saveSettings"
        />
      </label>
    </div>

    <!-- Кнопки действий -->
    <div class="buttons">
      <Button @click="editProfile">{{ $t('settings.profile.buttons.editProfile') }}</Button>
      <Button variant="secondary" @click="changeAccount">{{
        $t('settings.profile.buttons.changeAccount')
      }}</Button>
    </div>
  </SettingsSection>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import type { UserSettings } from '../../types/settings'
import SettingsSection from './SettingsSection.vue'
import { signOut } from 'firebase/auth'
import { Button, Text, Input, Select } from '@/designSystem/components'

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

const isLoading = ref(true)

const loadSettings = async () => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) {
      isLoading.value = false
      return
    }

    const settingsRef = doc(db, 'userSettings', uid)
    const snap = await getDoc(settingsRef)

    if (snap.exists()) {
      settings.value = { ...settings.value, ...snap.data() }
    } else {
      // Create initial settings document
      await setDoc(settingsRef, settings.value)
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  } finally {
    isLoading.value = false
  }
}

const saveSettings = async () => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const settingsRef = doc(db, 'userSettings', uid)
    await setDoc(settingsRef, settings.value, { merge: true })
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

const editProfile = () => {
  // Navigate to profile edit page
  console.log('Edit profile clicked')
}

const changeAccount = () => {
  // Handle account change
  signOut(auth)
    .then(() => {
      console.log('Пользователь вышел из аккаунта')
      // тут можно перенаправить на страницу логина или главную
    })
    .catch((error) => {
      console.error('Ошибка при выходе:', error)
    })
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

/* Кнопки */
.buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
</style>
