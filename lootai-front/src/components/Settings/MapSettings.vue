<template>
  <SettingsSection title="Карта" open>
    <!-- ОБЩИЕ ФИЛЬТРЫ -->
    <Text variant="h4" color="accent">Фильтры отображения</Text>

    <label v-for="f in filters" :key="f.key" class="row">
      <span>{{ f.label }}</span>
      <input type="checkbox" v-model="f.enabled" @change="saveSettings" />
    </label>

    <!-- НАСТРОЙКИ КАРТЫ -->
    <div class="sub-block">
      <label class="row">
        <span>Показывать задачи</span>
        <input type="checkbox" v-model="settings.map.showTasks" @change="saveSettings" />
      </label>

      <label class="row">
        <span>Показывать пользователей</span>
        <input type="checkbox" v-model="settings.map.showUsers" @change="saveSettings" />
      </label>

      <label class="row">
        <span>Автообновление</span>
        <input type="checkbox" v-model="settings.map.autoRefresh" @change="saveSettings" />
      </label>

      <label class="row">
        <span>Интервал обновления (мин)</span>
        <Input
          type="number"
          min="1"
          max="60"
          width="100"
          v-model="settings.map.refreshInterval"
          @change="saveSettings"
          :disabled="!settings.map.autoRefresh"
        />
      </label>

      <label class="row">
        <span>Масштаб по умолчанию</span>
        <Input
          type="number"
          min="1"
          max="20"
          width="100"
          v-model="settings.map.defaultZoom"
          @change="saveSettings"
        />
      </label>

      <label class="row">
        <span>Тип карты</span>
        <Select width="100" v-model="settings.map.mapType" @change="saveSettings">
          <option value="default">Стандартная</option>
          <option value="satellite">Спутник</option>
          <option value="terrain">Рельеф</option>
        </Select>
      </label>
    </div>

    <!-- ФИЛЬТРЫ ЗАДАЧ -->
    <details class="task-filters">
      <summary>Фильтры по задачам</summary>

      <div class="content">
        <label class="row">
          <span>Пол</span>
          <Select width="100" v-model="taskFilters.gender" @change="saveSettings">
            <option value="any">Любой</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </Select>
        </label>

        <label class="row">
          <span>Возраст</span>
          <input type="range" min="10" max="70" v-model="taskFilters.age" @change="saveSettings" />
          <span class="range-value">{{ taskFilters.age }}</span>
        </label>

        <label class="row">
          <span>Дистанция</span>
          <input
            type="range"
            min="1"
            max="50"
            v-model="taskFilters.distance"
            @change="saveSettings"
          />
          <span class="range-value">{{ taskFilters.distance }} км</span>
        </label>
      </div>
    </details>
  </SettingsSection>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import type { UserSettings } from '../../types/settings'
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

const filters = reactive([
  { key: 'people', label: 'Люди рядом 👤', enabled: true },
  { key: 'friends', label: 'Друзья 🤝', enabled: true },
  { key: 'tasks', label: 'Задачи 📌', enabled: true },
  { key: 'quests', label: 'Квесты 🎮', enabled: true },
  { key: 'public', label: 'Общественные 🌍', enabled: true },
])

const taskFilters = reactive({
  gender: 'any',
  age: 25,
  distance: 10,
})

const loadSettings = async () => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const settingsRef = doc(db, 'userSettings', uid)
    const snap = await getDoc(settingsRef)

    if (snap.exists()) {
      const data = snap.data()
      settings.value = { ...settings.value, ...data }

      // Load map filters if they exist
      if (data.mapFilters) {
        Object.assign(filters, data.mapFilters)
      }
      if (data.taskFilters) {
        Object.assign(taskFilters, data.taskFilters)
      }
    }
  } catch (error) {
    console.error('Error loading map settings:', error)
  }
}

const saveSettings = async () => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const settingsRef = doc(db, 'userSettings', uid)
    const settingsToSave = {
      ...settings.value,
      mapFilters: filters,
      taskFilters: taskFilters,
    }
    await setDoc(settingsRef, settingsToSave, { merge: true })
  } catch (error) {
    console.error('Error saving map settings:', error)
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
</style>
