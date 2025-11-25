<template>
  <div class="map-container">
    <div ref="mapContainer" class="map"></div>

    <div class="map-controls">
      <button @click="centerOnMe" class="control-btn" title="Мое местоположение">🧭</button>
      <button @click="createBot" class="control-btn bot-btn" title="Создать бота">🤖</button>
      <button @click="createTask" :class="['control-btn', 'create-task-btn', { active: isCreatingTask }]"
        title="Создать задачу">
        +
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { auth } from '@/config/firebase'
import { useMap } from '../../composables/map/useMap'
import { useGeolocation } from '../../composables/useGeolocation'
import { loadTasks } from '../../composables/useTasks'
import { loadQuests } from '@/composables/useQuests'
import { loadPublicTasks } from '@/composables/usePublicTasks'
import { socket } from '@/socket'

const mapContainer = ref<HTMLElement>()

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

const init = async () => {
  if (!mapContainer.value) return

  // 1. Инициализация карты
  initMap(mapContainer.value, [55.7558, 37.6176], 13)

  // 2. Центр на моем местоположении
  try {
    const { lat, lng } = await getLocation()

    const userData = {
      id: auth.currentUser?.uid,
      name: auth.currentUser?.displayName,
      avatar:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Roundel-azure.svg/1024px-Roundel-azure.svg.png',
      status: 'Онлаин',
    }
    addUserMarker('me', [lat, lng], userData, '#4CAF50')
    center([lat, lng])
    socket.emit("UserEvent:locationUpdate", { userId: 'me', latitude: lat, longitude: lng })
  } catch (err) {
    console.warn('Geolocation failed', err)
  }

  // 3. Загрузка задач
  const tasks = await loadTasks()
  const quests = await loadQuests()
  const publicTasks = await loadPublicTasks()
  // console.log(quests)

  tasks.forEach(addTaskMarker)
  quests.forEach(addQuestMarker)
  publicTasks.forEach(addTaskMarker)

  // 4. Подписка на обновления пользователей
  socket.on("locationUpdate",
    (data) => {
      // console.log('Location update received:', data)
      const userData = {
        id: data.userId,
        name: data.name,
        avatar: 'string',
        status: 'string',
      }
      const coords: [number, number] = [data.location.latitude, data.location.longitude]
      addUserMarker(data.userId, coords, userData, data.isBot ? 'grey' : '#2196F3')
    }
  )
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
    socket.emit("BotEvent:create", { userId: 'me', radius: 1000, userLocation: { lat, lng } }, (result: any) => {
      console.log('bot created', result)
    })
  } catch {
    socket.emit("BotEvent:create", { userId: 'me', radius: 1000 }, (result: any) => {
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
  //socket.off('locationUpdate')
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
  /* расстояние между кнопками */
  /* background: rgba(255, 255, 255, 0.9); легкий фон */
  padding: 8px;
  border-radius: 12px;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); */
}

.control-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.bot-btn {
  background-color: #f0f0f0;
}

.create-task-btn {
  background-color: #f0f0f0;
  color: #388e3c;
}

.create-task-btn.active {
  background-color: #388e3c;
  color: #f0f0f0;
  transform: scale(1.1);
}

.control-btn:active {
  transform: scale(0.95);
}
</style>
