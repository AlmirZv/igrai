<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { auth } from '@/config/firebase'
import { Select, Text, Button } from '@/designSystem/components'

// Импорт подкомпонентов
import TaskFormPublic from './TaskFormPublic.vue'
import TaskFormQuest from './TaskFormQuest.vue'
import TaskFormEvent from './TaskFormEvent.vue'
import TaskFormUser from './TaskFormUser.vue'

import type { UserTask } from '@/types/task'
import type { QuestTask } from '@/types/quest'
import type { PublicTask } from '@/types/publicTask'
import type { EventTask } from '@/types/event'
import { latLng } from 'leaflet'
import { i18n } from '@/locales/i18n'

const props = defineProps<{
  lat: number
  lng: number
  type?: 'public' | 'quest' | 'event' | 'user'
}>()

const emit = defineEmits<{
  (e: 'create', task: any): void
  (e: 'select-step-location', { stepId, currentPopupData }: any): void
}>()

// Базовые поля
const type = ref<'public' | 'quest' | 'event' | 'user'>(props.type ?? 'user')

// Общие поля для всех подформ
const common = ref<UserTask | QuestTask | PublicTask | EventTask>({
  title: '',
  description: '',
  type: 'user',
  status: 'active',
  requirements: {
    gender: 'any',
    age: 18,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    membersCount: 1,
  },
  reward: {
    xp: 30,
    points: 1000,
    inventoryItem: '',
  },
})

const showErrorMessage = ref('')

function createTask() {
  const error = validateTask()
  if (error) {
    showErrorMessage.value = error
    return
  }

  showErrorMessage.value = ''

  const task = {
    ...common.value,
    id: crypto.randomUUID(),
    author: auth.currentUser?.displayName,
    authorId: auth.currentUser?.uid,
    location: {
      lat: props.lat,
      lng: props.lng,
      address: '',
    },
    createdAt: new Date().toISOString(),
    participants: [],
  }

  emit('create', task)
}

watch(
  type,
  (newType) => {
    switch (newType) {
      case 'public':
        common.value = {
          title: '',
          description: '',
          type: 'public',
          status: 'active',
          requirements: {
            gender: 'any',
            age: 18,
            startDate: '',
            endDate: '',
            startTime: '',
            endTime: '',
            membersCount: 1,
          },
          reward: {
            xp: 100,
            inventoryItem: '',
          },
        }
        break
      case 'quest':
        common.value = {
          ...common.value,
          title: '',
          description: '',
          finishWords: '',
          type: 'quest',
          status: 'active',
          requirements: {
            gender: 'any',
            minAge: 0,
            maxAge: 200,
            startDate: '',
            endDate: '',
            difficulty: 'easy',
          },
          reward: {
            xp: 50,
            points: 1,
            inventoryItem: '',
          },
          steps: [
            {
              id: crypto.randomUUID(),
              order: 1,
              title: '',
              type: 'riddle',
              riddle: '',
              icon: 'default',
              location: {
                lat: props.lat,
                lng: props.lng,
                address: '',
              },
              description: '',
              answer: '',

              nextStepId: crypto.randomUUID(),
            },
          ],
        }
        break
      case 'event':
        common.value = {
          title: '',
          description: '',
          type: 'event',
          status: 'active',
          requirements: {
            gender: 'any',
            minAge: 0,
            maxAge: 200,
            startDate: '',
            endDate: '',
            startTime: '',
            endTime: '',
            membersCount: 1,
          },
          reward: {
            xp: 40,
            inventoryItem: '',
          },
        }
        break
      case 'user':
        common.value = {
          title: '',
          description: '',
          type: 'user',
          status: 'active',
          requirements: {
            gender: 'any',
            age: 18,
            startDate: '',
            endDate: '',
            startTime: '',
            endTime: '',
            membersCount: 1,
          },
          reward: {
            xp: 30,
            points: 1000,
            inventoryItem: '',
          },
        }
        break
    }
  },
  { immediate: true },
)

function validateUserTask(task: UserTask): string {
  const { title, description, requirements, reward } = task

  if (!title?.trim()) return 'Заполните заголовок'
  if (!description?.trim()) return 'Заполните описание'

  // Проверка полей requirements
  const requiredFields = [
    'gender',
    'age',
    'startDate',
    'endDate',
    'startTime',
    'endTime',
    'membersCount',
  ] as const

  for (const field of requiredFields) {
    if (requirements[field] === '' || requirements[field] == null) {
      return `Заполните поле "${field}"`
    }
  }

  // Проверка награды
  if (reward.points == null) return 'Заполните очки награды'

  // Проверка дат
  const start = new Date(`${requirements.startDate}T${requirements.startTime || '00:00'}`).getTime()
  const end = new Date(`${requirements.endDate}T${requirements.endTime || '00:00'}`).getTime()
  if (end < start) return 'Дата окончания должна быть позже начала'

  return '' // Всё ок
}

function validatePublicTask(task: PublicTask): string {
  const { title, description, requirements, reward } = task

  if (!title?.trim()) return 'Заполните заголовок'
  if (!description?.trim()) return 'Заполните описание'

  return ''
}

function validateQuestTask(task: QuestTask): string {
  const { title, description, requirements, reward, steps, finishWords } = task
  console.log(task)

  if (!finishWords?.trim()) return 'Заполните финальные слова пользователю'
  if (!title?.trim()) return 'Заполните заголовок'
  if (!description?.trim()) return 'Заполните описание'

  if (!requirements.difficulty) return 'Заполните сложность'

  // Проверка полей requirements
  const requiredFields = [
    'gender',
    'minAge',
    'maxAge',
    'startDate',
    'endDate',
    'minAge',
    'maxAge',
    'difficulty',
  ] as const

  for (const field of requiredFields) {
    if (requirements[field] === '' || requirements[field] == null) {
      return `Заполните поле "${field}"`
    }
  }

  // Проверка награды
  if (reward.points == null) return 'Заполните очки награды'

  // Проверка дат
  const start = new Date(`${requirements.startDate}T00:00`).getTime()
  const end = new Date(`${requirements.endDate}T00:00`).getTime()

  if (end < start) return 'Дата окончания должна быть позже начала'

  console.log(steps)
  for (const step of steps) {
    if (step.title === '' || step.title == null) return `Введите название шага №${step.order}`

    if (step.description === '' || step.description == null)
      return `Заполните описание шага "${step.title}"`
    if (step.location.lat == null) return `Выберите локацию для шага "${step.title}"`

    switch (step.type) {
      case 'riddle':
        if (step.riddle === '' || step.riddle == null) return `Впишите загадку шага"${step.title}"`
        if (step.answer === '' || step.answer == null) return `Заполните ответ шага "${step.title}"`
        break
      case 'qr':
        if (step.clue === '' || step.clue == null)
          return `Впишите подсказку по поиску куаркода шага"${step.title}"`
        console.log('QR код:', step.qrCode)
        break
      case 'photo':
        if (step.photoExampleUrl === '' || step.photoExampleUrl == null)
          return `Загрузите фото шага"${step.title}"`
        break
    }
  }

  return '' // Всё ок
}

function validateEventTask(task: EventTask): string {
  const { title, requirements } = task

  if (!title?.trim()) return 'Заполните заголовок'

  // Для события проверяем только даты
  if (requirements.startDate && requirements.endDate) {
    const start = new Date(
      `${requirements.startDate}T${requirements.startTime || '00:00'}`,
    ).getTime()
    const end = new Date(`${requirements.endDate}T${requirements.endTime || '00:00'}`).getTime()
    if (end < start) return 'Дата окончания должна быть позже начала'
  }

  return ''
}

// Главная функция
function validateTask(): string {
  const task = common.value
  if (!task) return 'Нет данных задачи'

  switch (task.type) {
    case 'user':
      return validateUserTask(task)
    case 'public':
      return validatePublicTask(task)
    case 'quest':
      return validateQuestTask(task)
    case 'event':
      return validateEventTask(task)
    default:
      return 'Неизвестный тип задачи'
  }
}

function selectStepLocation(stepId: any) {
  const currentPopupData = {
    onLocationSelected: (lat: number, lng: number) => {
      console.log(stepId)
      console.log(console.log(common.value))
      const newLatLng: any = {
        lat,
        lng,
      }
      if (common.value.type == 'quest') {
        common.value.steps.forEach((step) => {
          if (step.id == stepId) {
            step.location = newLatLng
          }
        })
      }
    },
  }

  emit('select-step-location', currentPopupData)
}
</script>

<template>
  <div class="popup">
    <!-- фиксированная шапка -->
    <div class="popup-header">
      <Text variant="h3">{{ $t(`map.popup.creatingTask`) }}</Text>
      <!-- Ошибки -->
      <div v-if="showErrorMessage" class="error">{{ showErrorMessage }}</div>
    </div>

    <!-- прокручиваемая часть -->
    <div class="popup-scroll">
      <div class="field">
        <label>{{ $t(`map.popup.taskType`) }}:</label>
        <Select v-model="type">
          <option value="public">{{ $t(`map.popup.types.public`) }}</option>
          <option value="quest">{{ $t(`map.popup.types.quest`) }}</option>
          <option value="event">{{ $t(`map.popup.types.event`) }}</option>
          <option value="user">{{ $t(`map.popup.types.user`) }}</option>
        </Select>
      </div>
      <component
        :is="
          {
            public: TaskFormPublic,
            quest: TaskFormQuest,
            event: TaskFormEvent,
            user: TaskFormUser,
          }[type]
        "
        @select-step-location="selectStepLocation"
        v-model="common"
      />

      <!-- <div v-if="showErrorMessage" class="error">{{ showErrorMessage }}</div> -->
    </div>

    <!-- фиксированная нижняя часть -->
    <div class="popup-footer">
      <Button class="create-btn" type="button" @click="createTask">{{
        $t(`map.buttons.createTask`)
      }}</Button>
    </div>
  </div>
</template>

<style scoped>
.popup {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden; /* важно — скрывает скролл вне контента */
}

/* === верхняя часть (не скроллится) === */
.popup-header {
  text-align: center;
}

/* === скроллируемая часть === */
.popup-scroll {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-sm);
}

/* === нижняя часть (кнопка) === */
.popup-footer {
  flex-shrink: 0;
  padding: var(--space-sm);
  align-items: center;
}

.field {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-xs);
}

.create-btn {
  width: 100%;
}

.error {
  color: var(--state-error);
  font-size: var(--font-size-sm);
  text-align: center;
  margin-top: var(--space-sm);
}
</style>
