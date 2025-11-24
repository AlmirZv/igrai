<template>
  <SettingsSection title="Мой профиль" open>
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

    <div class="notifications-section">
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

    <button class="btn" @click="editProfile">Редактировать профиль</button>
    <button class="btn secondary" @click="changeAccount">Сменить аккаунт</button>
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

.notifications-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.notifications-section h4 {
  color: #25b9a0;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn {
  margin: 6px 0;
  padding: 12px 16px;
  width: 100%;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #25b9a0 0%, #1e9783 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(37, 185, 160, 0.3);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 185, 160, 0.4);
}

.btn.secondary {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  box-shadow: 0 2px 8px rgba(75, 85, 99, 0.3);
}

.btn.secondary:hover {
  box-shadow: 0 4px 12px rgba(75, 85, 99, 0.4);
}

@media (max-width: 480px) {
  .row {
    margin: 10px 0;
    padding: 6px 0;
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
