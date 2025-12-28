<template>
  <div class="map-container">
    <div ref="mapContainer" class="map"></div>

    <div class="map-controls">
      <Button class="control-btn" @click="centerOnMe" title="Мое местоположение">🧭</Button>
      <!-- <Button @click="createBot"  title="Создать бота">🤖</Button> -->
      <Button
        @click="createTask"
        :class="['control-btn', { active: isCreatingTask }]"
        title="Создать задачу"
      >
        +
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { auth, db } from '@/config/firebase'
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
import { useMap } from '../../composables/map/useMap'
import { useGeolocation } from '../../composables/useGeolocation'
import { loadTasks } from '../../composables/useTasks'
import { loadQuests } from '@/composables/useQuests'
import { loadPublicTasks } from '@/composables/usePublicTasks'
import { socket, state } from '@/socket'
import type { UserSettings } from '@/types/settings'
import { Button } from '@/designSystem/components'

const mapContainer = ref<HTMLElement>()
const settings = ref<UserSettings | null>(null)
const showUsers = ref(true)
const locationUpdateHandler = ref<((data: any) => void) | null>(null)

const {
  mapInstance,
  initMap,
  addUserMarker,
  addTaskMarker,
  addQuestMarker,
  center,
  toggleCreateMode,
} = useMap()
const { getLocation } = useGeolocation()

// Загрузка настроек пользователя
const loadUserSettings = async () => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const settingsRef = doc(db, 'userSettings', uid)
    const snap = await getDoc(settingsRef)

    if (snap.exists()) {
      settings.value = snap.data() as UserSettings
      showUsers.value = settings.value.map?.showUsers ?? true
    } else {
      // Значения по умолчанию
      showUsers.value = true
    }
  } catch (error) {
    console.error('Error loading user settings:', error)
    showUsers.value = true // По умолчанию показываем пользователей
  }
}

// Загрузка существующих пользователей с карты
const loadExistingUsers = async () => {
  if (!showUsers.value) {
    console.log('👥 showUsers is disabled, skipping loadExistingUsers')
    return
  }

  try {
    // console.log('🔍 Loading existing users from Firestore...')
    const usersRef = collection(db, 'users')
    const usersQuery = query(usersRef, where('connected', '==', true))
    const snapshot = await getDocs(usersQuery)

    // console.log(`📊 Found ${snapshot.size} connected users`)
    let addedCount = 0

    snapshot.forEach((doc) => {
      const userData = doc.data()
      const currentUserId = auth.currentUser?.uid

      // Пропускаем себя
      if (userData.id === currentUserId || doc.id === currentUserId) {
        // console.log('⏭️ Skipping own user:', userData.id || doc.id)
        return
      }

      // Проверяем, что у пользователя есть местоположение
      if (userData.location && userData.location.latitude && userData.location.longitude) {
        const userInfo = {
          id: userData.id || doc.id,
          name: userData.name || 'Пользователь',
          avatar: userData.avatar || '',
          status: 'Онлайн',
        }
        const coords: [number, number] = [userData.location.latitude, userData.location.longitude]
        // console.log('✅ Adding existing user marker:', userInfo.id, coords)
        addUserMarker(userData.id || doc.id, coords, userInfo, '#2196F3')
        addedCount++
      } else {
        console.log('⚠️ User has no location:', userData.id || doc.id)
      }
    })

    // console.log(`✅ Added ${addedCount} user markers`)
  } catch (error) {
    console.error('❌ Error loading existing users:', error)
  }
}

// Подписка на обновления пользователей
const setupUserLocationListener = () => {
  if (!showUsers.value) {
    // Отключаем слушатель, если настройка выключена
    if (locationUpdateHandler.value) {
      socket.off('locationUpdate', locationUpdateHandler.value)
      locationUpdateHandler.value = null
    }
    return
  }

  // Удаляем старый обработчик, если есть
  if (locationUpdateHandler.value) {
    socket.off('locationUpdate', locationUpdateHandler.value)
  }

  // Создаем новый обработчик
  locationUpdateHandler.value = (data: any) => {
    const currentUserId = auth.currentUser?.uid

    // console.log('📍 Location update received:', data)

    // Пропускаем свои обновления (они обрабатываются отдельно)
    if (data.userId === currentUserId || data.userId === 'me') {
      // console.log('⏭️ Skipping own location update')
      return
    }

    if (data.location && data.location.latitude && data.location.longitude) {
      const userData = {
        id: data.userId,
        name: data.name || 'Пользователь',
        avatar: data.avatar || '',
        status: 'Онлайн',
      }
      const coords: [number, number] = [data.location.latitude, data.location.longitude]
      // console.log('✅ Adding user marker:', data.userId, coords)
      addUserMarker(data.userId, coords, userData, data.isBot ? 'grey' : '#2196F3')
    } else {
      console.warn('⚠️ Location update missing coordinates:', data)
    }
  }

  socket.on('locationUpdate', locationUpdateHandler.value)
}

// Отслеживание изменений настройки showUsers
watch(showUsers, (newValue) => {
  setupUserLocationListener()
  if (newValue) {
    // Если включили показ пользователей, загружаем существующих
    loadExistingUsers()
  }
})

// Функция для отправки местоположения
const sendLocationUpdate = async (lat: number, lng: number) => {
  const currentUserId = auth.currentUser?.uid
  if (!currentUserId) {
    console.warn('⚠️ User not authenticated')
    return
  }

  const visibleOnMap = settings.value?.profile?.visibleOnMap ?? true
  if (!visibleOnMap) {
    console.log('👁️ visibleOnMap is disabled, skipping location update')
    return
  }

  // Ждем подключения сокета
  const waitForConnection = (): Promise<void> => {
    return new Promise((resolve) => {
      // Проверяем текущее состояние - используем socket.connected как источник истины
      if (socket.connected) {
        // Синхронизируем state с реальным состоянием сокета
        if (!state.connected) {
          state.connected = true
        }
        // console.log('✅ Socket already connected')
        resolve()
        return
      }

      // Если сокет не подключен, пробуем подключить
      if (!socket.connected) {
        console.log('🔌 Socket not connected, attempting to connect...')
        socket.connect()
      }

      console.log('⏳ Waiting for socket connection...', {
        connected: socket.connected,
        disconnected: socket.disconnected,
        stateConnected: state.connected,
      })

      const timeout = setTimeout(() => {
        console.warn('⚠️ Socket connection timeout after 10 seconds')
        console.warn('Socket state:', {
          connected: socket.connected,
          disconnected: socket.disconnected,
          stateConnected: state.connected,
        })
        resolve() // Разрешаем промис даже при таймауте
      }, 10000)

      // Подписываемся на событие подключения
      const onConnect = () => {
        clearTimeout(timeout)
        socket.off('connect', onConnect) // Удаляем обработчик
        console.log('✅ Socket connected in waitForConnection')
        resolve()
      }

      socket.on('connect', onConnect)

      // Также проверяем состояние периодически (на случай если событие уже произошло)
      const checkInterval = setInterval(() => {
        if (socket.connected) {
          // Синхронизируем state
          if (!state.connected) {
            state.connected = true
          }
          clearTimeout(timeout)
          clearInterval(checkInterval)
          socket.off('connect', onConnect)
          console.log('✅ Socket connected (checked)')
          resolve()
        }
      }, 100)

      // Очищаем интервал при таймауте
      setTimeout(() => clearInterval(checkInterval), 10000)
    })
  }

  await waitForConnection()

  // Используем socket.connected как источник истины
  if (socket.connected) {
    // Синхронизируем state
    if (!state.connected) {
      state.connected = true
    }
    // console.log('📤 Sending location update:', { userId: currentUserId, lat, lng })
    socket.emit(
      'UserEvent:locationUpdate',
      {
        userId: currentUserId,
        latitude: lat,
        longitude: lng,
        timestamp: Date.now(),
      },
      (response: any) => {
        if (response && response.status === 'ok') {
          // console.log('✅ Location update sent successfully:', response.data)
        } else if (response && response.status === 'error') {
          console.error('❌ Location update failed:', response.error)
        } else {
          console.log('📨 Location update response:', response)
        }
      },
    )
  } else {
    console.warn('⚠️ Socket still not connected, cannot send location update')
    console.warn('Socket state:', {
      connected: socket.connected,
      disconnected: socket.disconnected,
      stateConnected: state.connected,
    })
  }
}

const init = async () => {
  if (!mapContainer.value) return

  // 0. Загрузка настроек
  await loadUserSettings()

  // 1. Инициализация карты
  initMap(mapContainer.value, [55.7558, 37.6176], 13)

  // 2. Подписка на обновления пользователей (делаем это раньше, чтобы не пропустить события)
  setupUserLocationListener()

  // 3. Центр на моем местоположении
  try {
    const { lat, lng } = await getLocation()
    const currentUserId = auth.currentUser?.uid

    if (!currentUserId) {
      console.warn('⚠️ User not authenticated')
      return
    }

    const userData = {
      id: currentUserId,
      name: auth.currentUser?.displayName || 'Я',
      avatar:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Roundel-azure.svg/1024px-Roundel-azure.svg.png',
      status: 'Онлайн',
    }
    addUserMarker('me', [lat, lng], userData, '#4CAF50')
    center([lat, lng])

    // Отправляем свое местоположение
    await sendLocationUpdate(lat, lng)
  } catch (err) {
    console.warn('⚠️ Geolocation failed', err)
  }

  // 4. Загрузка задач
  const tasks = await loadTasks()
  const quests = await loadQuests()
  const publicTasks = await loadPublicTasks()

  tasks.forEach(addTaskMarker)
  quests.forEach(addQuestMarker)
  publicTasks.forEach(addTaskMarker)

  // 5. Загрузка существующих пользователей
  if (showUsers.value) {
    await loadExistingUsers()
  }

  // 6. Логирование состояния
  // console.log('🗺️ Map initialized:', {
  //   showUsers: showUsers.value,
  //   socketConnected: state.connected,
  //   currentUserId: auth.currentUser?.uid,
  // })
}

const centerOnMe = async () => {
  try {
    const { lat, lng } = await getLocation()
    center([lat, lng])
  } catch (err) {
    console.error('Geolocation error:', err)
  }
}

const createBot = async () => {
  try {
    const { lat, lng } = await getLocation()
    const currentUserId = auth.currentUser?.uid
    if (!currentUserId) return

    socket.emit(
      'BotEvent:create',
      { userId: currentUserId, radius: 1000, userLocation: { lat, lng } },
      (result: any) => {
        console.log('bot created', result)
      },
    )
  } catch {
    const currentUserId = auth.currentUser?.uid
    if (!currentUserId) return

    socket.emit('BotEvent:create', { userId: currentUserId, radius: 1000 }, (result: any) => {
      console.log('bot created', result)
    })
  }
}

const isCreatingTask = ref(false)
const createTask = async () => {
  try {
    const createOn = toggleCreateMode()
    isCreatingTask.value = createOn
  } catch (err) {
    console.error('toggleCreateMode error:', err)
  }
}

onMounted(init)
onUnmounted(() => {
  mapInstance.value?.remove()
  // Отключаем слушатель при размонтировании
  if (locationUpdateHandler.value) {
    socket.off('locationUpdate', locationUpdateHandler.value)
    locationUpdateHandler.value = null
  }
})
</script>

<style scoped>
.map {
  z-index: 0;
  height: 100vh;
}

.map-controls {
  z-index: 1000;
  top: 20px;
  right: 20px;
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px;
  border-radius: 12px;
}

.control-btn {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: var(--shadow-xs);
}

.control-btn.active {
  background-color: var(--text-accent);
  /* color: #f0f0f0; */
  transform: scale(1.1);
}

.control-btn:active {
  transform: scale(0.95);
}
</style>
<style>
.leaflet-popup-content-wrapper {
  background: var(--bg-overlay);
  color: var(--text-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-xs);
}

.leaflet-popup-tip {
  background: var(--bg-overlay);
}

/* .leaflet-control-zoom leaflet-bar leaflet-control */

.leaflet-touch .leaflet-control-zoom-out {
  color: var(--text-accent);
  background-color: var(--bg-surface);
  box-shadow: var(--shadow-xs);
}
.leaflet-touch .leaflet-control-zoom-in {
  color: var(--text-accent);
  background-color: var(--bg-surface);
  box-shadow: var(--shadow-xs);
}
.leaflet-control-zoom .leaflet-control .leaflet-bar {
  color: var(--text-accent);
  background-color: var(--bg-surface);
  box-shadow: var(--shadow-xs);
}
.leaflet-bar a {
  border-bottom: 1px solid var(--border-strong);
}
</style>
