<template>
  <SettingsSection title="Карта" open>
    <!-- ОБЩИЕ ФИЛЬТРЫ -->
    <Text variant="h4" color="accent">Фильтры отображения</Text>

    <label v-for="f in filters" :key="f.key" class="row">
      <span>{{ f.label }}</span>
      <input type="checkbox" v-model="f.enabled" @change="saveToDB" />
    </label>

    <!-- НАСТРОЙКИ КАРТЫ -->
    <div class="sub-block">
      <label class="row">
        <span>Показывать задачи</span>
        <input type="checkbox" v-model="settings.map.showTasks" @change="saveToDB" />
      </label>

      <label class="row">
        <span>Показывать пользователей</span>
        <input type="checkbox" v-model="settings.map.showUsers" @change="saveToDB" />
      </label>

      <label class="row">
        <span>Автообновление</span>
        <input type="checkbox" v-model="settings.map.autoRefresh" @change="saveToDB" />
      </label>

      <label class="row">
        <span>Интервал обновления (мин)</span>
        <Input
          type="number"
          min="1"
          max="60"
          width="100"
          v-model="settings.map.refreshInterval"
          @change="saveToDB"
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
          @change="saveToDB"
        />
      </label>

      <label class="row">
        <span>Тип карты</span>
        <Select width="100" v-model="settings.map.mapType" @change="saveToDB">
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
          <Select width="100" v-model="taskFilters.gender" @change="saveToDB">
            <option value="any">Любой</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </Select>
        </label>

        <label class="row">
          <span>Возраст</span>
          <input type="range" min="10" max="70" v-model="taskFilters.age" @change="saveToDB" />
          <span class="range-value">{{ taskFilters.age }}</span>
        </label>

        <label class="row">
          <span>Дистанция</span>
          <input type="range" min="1" max="50" v-model="taskFilters.distance" @change="saveToDB" />
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
import useSettings from '@/composables/useSettings'

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

onMounted(async () => {
  const uid = auth.currentUser?.uid
  if (uid) await getUserSettings(uid)
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
</style>
