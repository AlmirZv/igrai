<template>
  <SettingsSection :title="$t('settings.app.sectionTitle')" open>
    <label class="row">
      <span>{{ $t('settings.app.language') + ' 🌐' }}</span>
      <Select width="100" v-model="state.draft.value.app.language" @change="saveToDB">
        <option value="ru">{{ $t('settings.app.langOptions.ru') }}</option>
        <option value="en">{{ $t('settings.app.langOptions.en') }}</option>
        <option value="ja">{{ $t('settings.app.langOptions.ja') }}</option>
      </Select>
    </label>

    <label class="row">
      <span>{{ $t('settings.app.theme') }}</span>
      <Select width="100" v-model="state.draft.value.app.theme" @change="saveToDB">
        <option value="light">{{ $t('settings.app.themeOptions.light') }}</option>
        <option value="dark">{{ $t('settings.app.themeOptions.dark') }}</option>
        <option value="dandadan">{{ $t('settings.app.themeOptions.dandadan') }}</option>
      </Select>
    </label>

    <label class="row">
      <span>{{ $t('settings.app.fontSize') }}</span>
      <Select width="100" v-model="settings.app.fontSize" @change="saveToDB">
        <option value="small">{{ $t('settings.app.fontOptions.small') }}</option>
        <option value="medium">{{ $t('settings.app.fontOptions.medium') }}</option>
        <option value="large">{{ $t('settings.app.fontOptions.large') }}</option>
      </Select>
    </label>

    <label class="row">
      <span>{{ $t('settings.app.sound') }}</span>
      <input type="checkbox" v-model="settings.app.soundEnabled" @change="saveToDB" />
    </label>

    <label class="row">
      <span>{{ $t('settings.app.vibration') }}</span>
      <input type="checkbox" v-model="settings.app.vibrationEnabled" @change="saveToDB" />
    </label>

    <div class="version-info">
      <p class="version">{{ $t('settings.app.version') }}: {{ appConfig.version }}</p>
      <p class="build">{{ $t('settings.app.build') }}: {{ appConfig.buildDate }}</p>
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
import useSettings from '@/composables/useSettings'
import { i18n } from '@/locales/i18n'

const allLocaleModules = import.meta.glob('@/locales/*/*.json')

const { state, applyDraft, resetDraft, getUserSettings } = useSettings()

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

onMounted(async () => {
  console.log(allLocaleModules)

  const uid = auth.currentUser?.uid
  if (uid) await getUserSettings(uid)
  // console.log(i18n.global.messages.value)
  // console.log('locale =', i18n.global.locale.value)
})

// Сохранить настройки карты в userSettings
const saveToDB = async () => {
  const uid = auth.currentUser?.uid
  if (!uid) return

  // при необходимости запиши filters / taskFilters в state.draft
  // state.draft.value.mapFilters = filters
  // state.draft.taskFilters = taskFilters

  await applyDraft(uid)
}
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
