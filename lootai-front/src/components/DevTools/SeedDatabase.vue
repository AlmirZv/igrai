<template>
  <div class="seed-database">
    <div class="dev-panel">
      <h3>🛠️ Инструменты разработчика</h3>
      
      <div class="section">
        <h4>Инициализация базы данных</h4>
        <p>Добавить тестовые задачи с координатами в радиусе 1км</p>
        
        <div class="coordinates-input">
          <label>
            <span>Широта (по умолчанию: 55.7558):</span>
            <input 
              v-model.number="latitude" 
              type="number" 
              step="0.0001" 
              placeholder="55.7558"
            />
          </label>
          <label>
            <span>Долгота (по умолчанию: 37.6176):</span>
            <input 
              v-model.number="longitude" 
              type="number" 
              step="0.0001" 
              placeholder="37.6176"
            />
          </label>
          
          <button 
            @click="getCurrentPosition" 
            :disabled="isLoadingLocation"
            class="location-btn"
          >
            <span v-if="isLoadingLocation">🔄 Получаем координаты...</span>
            <span v-else">📍 Использовать мое местоположение</span>
          </button>
        </div>
        
        <button 
          @click="seedTasks" 
          :disabled="isLoading"
          class="seed-btn"
        >
          <span v-if="isLoading">🔄 Добавляем задачи...</span>
          <span v-else>🌱 Добавить тестовые задачи</span>
        </button>
        
        <div v-if="message" class="message" :class="messageType">
          {{ message }}
        </div>
      </div>
      
      <div class="section">
        <h4>Статистика</h4>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-label">Добавлено задач:</span>
            <span class="stat-value">{{ tasksAdded }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { seedTasks as seedTasksUtil } from '../../utils/seedDatabase'
import { getCurrentLocation, DEFAULT_COORDINATES } from '../../utils/geolocation'

const isLoading = ref(false)
const isLoadingLocation = ref(false)
const message = ref('')
const messageType = ref('info')
const tasksAdded = ref(0)

// Координаты по умолчанию (Москва)
const latitude = ref(DEFAULT_COORDINATES.latitude)
const longitude = ref(DEFAULT_COORDINATES.longitude)

const seedTasks = async () => {
  if (!latitude.value || !longitude.value) {
    showMessage('Пожалуйста, введите корректные координаты', 'error')
    return
  }
  
  isLoading.value = true
  message.value = ''
  
  try {
    const success = await seedTasksUtil(latitude.value, longitude.value)
    
    if (success) {
      tasksAdded.value += 6 // Количество задач в seedDatabase.ts
      showMessage('✅ Тестовые задачи успешно добавлены в базу данных!', 'success')
    } else {
      showMessage('❌ Ошибка при добавлении задач', 'error')
    }
  } catch (error) {
    console.error('Seed tasks error:', error)
    showMessage('❌ Произошла ошибка: ' + error, 'error')
  } finally {
    isLoading.value = false
  }
}

const getCurrentPosition = async () => {
  isLoadingLocation.value = true
  message.value = ''
  
  try {
    const coords = await getCurrentLocation()
    latitude.value = coords.latitude
    longitude.value = coords.longitude
    showMessage('✅ Координаты получены успешно!', 'success')
  } catch (error: any) {
    console.error('Geolocation error:', error)
    showMessage(`❌ Ошибка получения местоположения: ${error.message}`, 'error')
  } finally {
    isLoadingLocation.value = false
  }
}

const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
  message.value = msg
  messageType.value = type
  
  // Автоматически скрываем сообщение через 5 секунд
  setTimeout(() => {
    message.value = ''
  }, 5000)
}
</script>

<style scoped>
.seed-database {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.dev-panel {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(37, 185, 160, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dev-panel h3 {
  color: #25b9a0;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-align: center;
}

.section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section h4 {
  color: #e5e7eb;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.section p {
  color: #9ca3af;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.coordinates-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.coordinates-input label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.coordinates-input span {
  color: #e5e7eb;
  font-size: 14px;
  font-weight: 500;
}

.coordinates-input input {
  background: #374151;
  color: #e5e7eb;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.coordinates-input input:focus {
  outline: none;
  border-color: #25b9a0;
  box-shadow: 0 0 0 2px rgba(37, 185, 160, 0.2);
}

.location-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  margin-top: 8px;
}

.location-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.location-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.seed-btn {
  background: linear-gradient(135deg, #25b9a0 0%, #1e9783 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(37, 185, 160, 0.3);
  width: 100%;
}

.seed-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 185, 160, 0.4);
}

.seed-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.message {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.message.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.message.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.message.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.stat-label {
  color: #9ca3af;
  font-size: 14px;
}

.stat-value {
  color: #25b9a0;
  font-size: 16px;
  font-weight: 600;
}

@media (max-width: 480px) {
  .seed-database {
    padding: 16px;
  }
  
  .dev-panel {
    padding: 20px;
  }
  
  .coordinates-input {
    gap: 10px;
  }
  
  .coordinates-input input {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .seed-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>
