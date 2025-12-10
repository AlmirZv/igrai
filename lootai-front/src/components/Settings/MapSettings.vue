<template>
  <SettingsSection title="Карта" open>
    <!-- ОБЩИЕ ФИЛЬТРЫ -->
    <div class="section-title">Фильтры отображения</div>

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
        <input
          type="number"
          min="1"
          max="60"
          v-model="settings.map.refreshInterval"
          @change="saveSettings"
          :disabled="!settings.map.autoRefresh"
        />
      </label>

      <label class="row">
        <span>Масштаб по умолчанию</span>
        <input
          type="number"
          min="1"
          max="20"
          v-model="settings.map.defaultZoom"
          @change="saveSettings"
        />
      </label>

      <label class="row">
        <span>Тип карты</span>
        <select v-model="settings.map.mapType" @change="saveSettings">
          <option value="default">Стандартная</option>
          <option value="satellite">Спутник</option>
          <option value="terrain">Рельеф</option>
        </select>
      </label>
    </div>

    <!-- ФИЛЬТРЫ ЗАДАЧ -->
    <details class="task-filters">
      <summary>Фильтры по задачам</summary>

      <div class="content">
        <label class="row">
          <span>Пол</span>
          <select v-model="taskFilters.gender" @change="saveSettings">
            <option value="any">Любой</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
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
/* Заголовок блока */
.section-title {
  margin: 8px 0 14px;
  font-size: 15px;
  font-weight: 600;
  color: #3d7eff;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

/* Ряд настроек */
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.row:last-child {
  border-bottom: none;
}

.row span {
  color: #d7d7d7;
}

/* Чекбокс */
.row input[type='checkbox'] {
  width: 20px;
  height: 20px;
  accent-color: #3d7eff;
  cursor: pointer;
}

/* Числовые поля */
.row input[type='number'] {
  width: 90px;
  padding: 6px 10px;
  background: #22252b;
  border: 1px solid #2f3239;
  border-radius: 8px;
  color: #f1f1f1;
  text-align: center;
  font-size: 14px;
}

.row input[type='number']:focus {
  border-color: #3d7eff;
  box-shadow: 0 0 0 2px rgba(61, 126, 255, 0.25);
  outline: none;
}

.row input[type='number']:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Select */
.row select {
  background: #22252b;
  border: 1px solid #2f3239;
  border-radius: 8px;
  padding: 6px 12px;
  color: #f1f1f1;
  cursor: pointer;
  font-size: 14px;
}

.row select:focus {
  border-color: #3d7eff;
  box-shadow: 0 0 0 2px rgba(61, 126, 255, 0.25);
  outline: none;
}

/* Range sliders */
.row input[type='range'] {
  accent-color: #3d7eff;
  width: 120px;
}

.range-value {
  min-width: 40px;
  text-align: right;
  color: #bbb;
}

/* Подблок настроек */
.sub-block {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Фильтры задач */
.task-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.task-filters summary {
  cursor: pointer;
  font-weight: 600;
  color: #3d7eff;
  font-size: 14px;
  margin-bottom: 10px;
}

.task-filters summary:hover {
  color: #6e9cff;
}

.content {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
