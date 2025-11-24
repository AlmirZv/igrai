<template>
  <SettingsSection title="Карта" open>
    <h4>Фильтры отображения</h4>
    <label v-for="f in filters" :key="f.key" class="row">
      <span>{{ f.label }}</span>
      <input type="checkbox" v-model="f.enabled" @change="saveSettings" />
    </label>

    <div class="map-settings">
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
          v-model="settings.map.refreshInterval"
          min="1"
          max="60"
          @change="saveSettings"
          :disabled="!settings.map.autoRefresh"
        />
      </label>

      <label class="row">
        <span>Масштаб по умолчанию</span>
        <input
          type="number"
          v-model="settings.map.defaultZoom"
          min="1"
          max="20"
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
          <span>{{ taskFilters.age }}</span>
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
          <span>{{ taskFilters.distance }} км</span>
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
h4 {
  margin: 12px 0 16px 0;
  color: #25b9a0;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

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

.row input[type='checkbox'] {
  width: 20px;
  height: 20px;
  accent-color: #25b9a0;
  cursor: pointer;
}

.row input[type='number'] {
  background: #374151;
  color: #e5e7eb;
  border: 1px solid #4b5563;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  width: 80px;
  text-align: center;
}

.row input[type='number']:focus {
  outline: none;
  border-color: #25b9a0;
  box-shadow: 0 0 0 2px rgba(37, 185, 160, 0.2);
}

.row input[type='number']:disabled {
  background: #1f2937;
  color: #6b7280;
  cursor: not-allowed;
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

.row input[type='range'] {
  width: 100px;
  margin: 0 8px;
  accent-color: #25b9a0;
}

.map-settings {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.task-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.task-filters summary {
  color: #25b9a0;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
}

.task-filters summary:hover {
  color: #1e9783;
}

.content {
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 480px) {
  .row {
    margin: 10px 0;
    padding: 6px 0;
  }

  .row span {
    font-size: 13px;
  }

  .row input[type='number'] {
    width: 60px;
    font-size: 13px;
    padding: 4px 8px;
  }

  .row select {
    font-size: 13px;
    padding: 5px 10px;
    min-width: 100px;
  }

  .row input[type='range'] {
    width: 80px;
  }
}
</style>
