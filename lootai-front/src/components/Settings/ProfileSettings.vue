<template>
  <SettingsSection title="Мой профиль" open>
    <!-- Основные настройки -->
    <label class="row">
      <span>Показывать меня на карте</span>
      <input type="checkbox" v-model="settings.profile.visibleOnMap" @change="saveSettings" />
    </label>

    <label class="row">
      <span>Показывать местоположение</span>
      <input type="checkbox" v-model="settings.profile.showLocation" @change="saveSettings" />
    </label>

    <label class="row">
      <span>Разрешить приглашения в задачи</span>
      <input type="checkbox" v-model="settings.profile.allowTaskInvites" @change="saveSettings" />
    </label>

    <!-- Уведомления -->
    <div class="notifications-block">
      <h4>Уведомления</h4>

      <label class="row">
        <span>Обновления задач</span>
        <input
          type="checkbox"
          v-model="settings.profile.notifications.taskUpdates"
          @change="saveSettings"
        />
      </label>

      <label class="row">
        <span>Сообщения</span>
        <input
          type="checkbox"
          v-model="settings.profile.notifications.messages"
          @change="saveSettings"
        />
      </label>

      <label class="row">
        <span>Достижения</span>
        <input
          type="checkbox"
          v-model="settings.profile.notifications.achievements"
          @change="saveSettings"
        />
      </label>

      <label class="row">
        <span>Push-уведомления</span>
        <input
          type="checkbox"
          v-model="settings.profile.notifications.pushNotifications"
          @change="saveSettings"
        />
      </label>
    </div>

    <!-- Кнопки действий -->
    <div class="buttons">
      <button class="btn" @click="editProfile">Редактировать профиль</button>
      <button class="btn secondary" @click="changeAccount">Сменить аккаунт</button>
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
/* Кнопки */
.buttons {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #25b9a0, #1e9783);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s ease;
  box-shadow: 0 2px 8px rgba(37, 185, 160, 0.3);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 185, 160, 0.4);
}

.btn.secondary {
  background: linear-gradient(135deg, #374151, #4b5563);
  box-shadow: 0 2px 8px rgba(75, 85, 99, 0.3);
}

.btn.secondary:hover {
  box-shadow: 0 4px 12px rgba(75, 85, 99, 0.4);
}

/* Мобильные адаптации */
@media (max-width: 480px) {
  .row {
    padding: 8px 0;
  }

  .row span {
    font-size: 13px;
  }

  .btn {
    padding: 10px 12px;
    font-size: 14px;
  }
}
</style>
