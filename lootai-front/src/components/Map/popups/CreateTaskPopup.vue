<script setup lang="ts">
import { ref, computed } from 'vue'
import { auth } from '@/config/firebase'

const props = defineProps<{
  lat: number
  lng: number
}>()

const emit = defineEmits<{
  (e: 'create', task: any): void
}>()

// Локальные реактивные данные формы
const title = ref('')
const description = ref('')
const type = ref('public') // public | quest | user
const gender = ref('any')
const membersCount = ref(1)
const age = ref(18)
const startDate = ref('')
const endDate = ref('')
const startTime = ref('')
const endTime = ref('')
const difficulty = ref('')

const rewardPoints = ref(1000)
const rewardItem = ref('')

const rewardXp = computed(() => {
  switch (type.value) {
    case 'public':
      return 100
    case 'quest':
      return 50
    case 'event':
      return 40
    case 'user':
      return 30
    default:
      return 0
  }
})

const showErrorMessage = ref('')

function addItem() {
  console.log('user adding item')
}

// Отправка задачи
function createTask() {
  const task = {
    id: crypto.randomUUID(),
    author: auth.currentUser?.displayName,
    authorId: auth.currentUser?.uid,
    title: title.value || 'Без названия',
    description: description.value,
    type: type.value,
    status: 'active',
    requirements: {
      gender: gender.value,
      age: age.value,
      startDate: startDate.value,
      startTime: startTime.value,
      endDate: endDate.value,
      endTime: endTime.value,
      membersCount: membersCount.value,
      custom: '',
      difficulty: difficulty.value,
    },
    reward: {
      xp: rewardXp.value,
      points: rewardPoints.value,
      inventoryItem: rewardItem.value,
    },
    location: {
      lat: props.lat,
      lng: props.lng,
      address: '', // можно геокодером подтянуть
    },
    createdAt: new Date().toISOString(),
    participants: [],
  }
  console.log(task)

  type TaskType = string

  interface TaskValues {
    description?: string
    startDate?: string
    startTime?: string
    endDate?: string
    endTime?: string
    difficulty?: string
    rewardPoints?: number
    age: number
    gender: string
  }

  const requiredFields: Record<TaskType, (keyof TaskValues)[]> = {
    public: ['description', 'startDate', 'endDate', 'age', 'gender'],
    quest: ['description', 'startDate', 'endDate', 'difficulty'],
    event: ['description', 'startDate', 'startTime'],
    user: [
      'description',
      'startDate',
      'startTime',
      'endTime',
      'endDate',
      'rewardPoints',
      'age',
      'gender',
    ],
  }

  function validateTask(type: TaskType, values: TaskValues): string {
    const fields = requiredFields[type]
    const isValid = fields.every((field) => values[field] !== undefined && values[field] !== '')

    // Дополнительно можно проверить даты
    if (isValid && values.startDate && values.endDate) {
      const start = new Date(values.startDate).getTime()
      const end = new Date(values.endDate).getTime()
      if (end < start) {
        return 'endDate must be later than startDate'
      }
    }

    return isValid ? `` : 'fill all empty inputs'
  }

  // Пример использования:
  const result = validateTask(type.value, {
    description: description.value,
    startDate: startDate.value,
    startTime: startTime.value,
    endDate: endDate.value,
    endTime: endTime.value,
    rewardPoints: rewardPoints.value,
    difficulty: difficulty.value,
    age: age.value,
    gender: gender.value,
  })

  // console.log(result) // "user ok"
  if (!result) {
    emit('create', task)
  } else {
    showErrorMessage.value = result
  }
}
</script>

<template>
  <div class="popup">
    <h3 class="title">Создание задачи</h3>

    <form class="form">
      <!-- Тип задачи -->
      <div class="field">
        <label>Тип задачи:</label>
        <select v-model="type">
          <option value="public">Общественная</option>
          <option value="quest">Квест</option>
          <option value="event">Событие</option>
          <option value="user">Личная</option>
        </select>
      </div>

      <!-- Заголовок -->
      <div class="field">
        <label>Заголовок:</label>
        <input v-model="title" placeholder="Название" />
      </div>

      <!-- Описание -->
      <div class="field">
        <label>Описание:</label>
        <textarea v-model="description" placeholder="Опишите задачу..." />
      </div>

      <!-- Пол -->
      <div v-if="type != 'public' || 'user'" class="field">
        <label>Пол:</label>
        <select v-model="gender">
          <option value="any">Любой</option>
          <option value="male">Мужчины</option>
          <option value="female">Женщины</option>
        </select>
      </div>

      <!-- Возраст -->
      <div v-if="type != 'public' || 'user'" class="field">
        <label>Возраст:</label>
        <input type="number" v-model="age" min="0" />
      </div>

      <div v-if="type != 'public' || 'user'" class="field">
        <label>Количество:</label>
        <input type="number" v-model="membersCount" min="1" />
      </div>

      <!-- Дата -->
      <div class="field">
        <label>Начало:</label>
        <div class="inline-inputs">
          <input type="date" v-model="startDate" />
          <input type="time" v-model="startTime" />
        </div>
      </div>
      <div v-if="type != 'event'" class="field">
        <label>Конец:</label>
        <div class="inline-inputs">
          <input type="date" v-model="endDate" />
          <input type="time" v-model="endTime" />
        </div>
      </div>

      <!-- Награда -->
      <fieldset class="reward">
        <legend>Награда</legend>
        <div class="field">
          <label>XP:</label>
          <span>{{ rewardXp }}</span>
        </div>
        <div v-if="type != 'public'" class="field">
          <label>Очки:</label>
          <input type="number" v-model="rewardPoints" min="0" />
        </div>
        <div class="field">
          <label>Предмет:</label>
          <button class="create-btn small" @click.prevent="addItem">+</button>
        </div>
      </fieldset>

      <!-- Ошибки -->
      <div v-if="showErrorMessage" class="error">{{ showErrorMessage }}</div>

      <!-- Кнопка -->
      <button class="create-btn" type="button" @click="createTask">Создать задачу</button>
    </form>
  </div>
</template>

<style scoped>
.popup {
  font-family: sans-serif;
  width: 300px;
  padding: 10px;
  border-radius: 12px;
  background: white;
}

.title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field {
  display: grid;
  grid-template-columns: 100px 1fr; /* подпись фикс, поле тянется */
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.inline-inputs {
  /* display: flex; */
  gap: 6px;
}
.inline-inputs input {
  width: 94%;
  margin: 1px;
}

input,
select,
textarea {
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 13px;
  flex: 1; /* поле растягивается по колонке */
  min-width: 0; /* предотвращает переполнение */
}

textarea {
  min-height: 50px;
  resize: vertical;
}

.reward {
  margin-top: 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reward legend {
  font-size: 13px;
  font-weight: bold;
}

.error {
  color: red;
  font-size: 13px;
  text-align: center;
}

.create-btn {
  margin-top: 6px;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: #4caf50;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}
.create-btn:hover {
  background: #45a049;
}
.create-btn.small {
  width: auto;
  padding: 4px 10px;
}
</style>
