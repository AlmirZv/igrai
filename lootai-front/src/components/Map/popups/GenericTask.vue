<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task, TaskParticipant, TaskRequirements } from '@/types/task'
import { auth } from '@/config/firebase'
import uInfoComposable from '@/composables/userInfo'

type PopupType = 'user' | 'quest' | 'public' | 'event'

interface BaseData {
  id: string
  title: string
  description: string
  author?: string
  authorId: string
  location?: { address: string }
}

interface QuestData extends BaseData {
  difficulty: 'easy' | 'medium' | 'hard'
  stages: string[]
  participants?: TaskParticipant
  requirements: TaskRequirements
}

interface EventData extends BaseData {
  date: string
  organizer: string
  participants?: TaskParticipant
  requirements: TaskRequirements
}

const props = defineProps<{
  type: PopupType
  data: Task | QuestData | EventData
}>()

const emit = defineEmits<{
  (e: 'action', payload: { type: PopupType; id: string }): void
}>()

const isLoading = ref(false)
const uicomposable = uInfoComposable()

function doAction() {
  isLoading.value = true

  emit('action', { type: props.type, id: props.data.id })

  // setTimeout(() => (isLoading.value = false), 1000)
}

const actionLabel = computed(() => {
  switch (props.type) {
    case 'user':
      return 'Участвовать в задании'
    case 'quest':
      return 'Начать квест'
    case 'public':
      return 'Записаться на событие'
    default:
      return 'Участвовать'
  }
})

const actionDone = computed(() => {
  const userAge = uicomposable.state.age.value
  const userGender = uicomposable.state.user.value.gender

  const requiredAge = props.data.requirements.age
  const requiredGender = props.data.requirements.gender

  const userId = auth.currentUser?.uid

  if (props.data.authorId == userId) {
    return true
  }

  if (userAge < requiredAge) {
    return `Требуется возраст > ${requiredAge}`
  }

  if (requiredGender != 'any' && userGender != requiredGender) {
    return `Требуются  ${requiredGender == 'female' ? 'Девушки' : 'Парни'}`
  }

  if (hasParticipants(props.data.participants)) {
    const participants = Array.isArray(props.data.participants)
      ? props.data.participants
      : props.data.participants
        ? [props.data.participants]
        : []
    // console.log(auth.currentUser)

    const isParticipant = participants?.some((p) => p.id === userId)

    const acceptedMemberCount = participants.filter((p) => p.status === 'accepted').length

    if (props.type == 'user' && acceptedMemberCount == props.data.requirements.membersCount) {
      return 'Количество участников набрано'
    }
    if (isParticipant) {
      const isParticipantAccepted = participants?.some(
        (p) => p.id === userId && p.status == 'accepted',
      )
      if (isParticipantAccepted) {
        return 'Вы уже участник!'
      } else {
        return 'Заявка на рассмотрении'
      }
    } else {
      console.log('Пользователь ещё не в списке')
    }
    return true
  } else {
    return false
  }
})
function hasParticipants(participants: TaskParticipant | TaskParticipant[] | undefined): boolean {
  const arr = Array.isArray(participants) ? participants : participants ? [participants] : []
  return arr.length > 0
}
</script>

<template>
  <div class="popup">
    <!-- Заголовок -->
    <h3 class="title">{{ data.title }}</h3>

    <!-- Автор -->
    <p v-if="data.author" class="author">👤 {{ data.author }}</p>

    <!-- Описание -->
    <p class="description">{{ data.description }}</p>

    <!-- Task -->
    <div v-if="type === 'user'" class="task">
      <div class="reward">
        🎁 <b>Награда:</b> {{ (data as Task).reward.xp }} XP,
        {{ (data as Task).reward.points }} очков,
        {{ (data as Task).reward.inventoryItem }}
      </div>
      <div class="requirements">
        ⏰ {{ (data as Task).requirements.startTime }} {{ (data as Task).requirements.startDate }} |
        {{ (data as Task).requirements.endTime }} {{ (data as Task).requirements.endDate }}
        <br />
        👥 Нужно участников: {{ (data as Task).requirements.membersCount }} <br />
        🎂 Возраст: {{ (data as Task).requirements.age }}+ <br />
        ⚧ Пол: {{ (data as Task).requirements.gender }} <br />
      </div>
      <div class="participants">
        <b>Участники:</b>
        <div class="list">
          <div
            v-for="p in (data as Task).participants"
            :key="p.name"
            class="participant"
            :class="p.status"
          >
            {{ p.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quest -->
    <div v-if="type === 'quest'" class="quest">
      <p>🎯 Сложность: {{ (data as QuestData).difficulty }}</p>
      <ul>
        <li v-for="(stage, i) in (data as QuestData).stages" :key="i">{{ i + 1 }}. {{ stage }}</li>
      </ul>
    </div>

    <!-- Event -->
    <div v-if="type === 'public'" class="event">
      📅 {{ (data as EventData).date }} <br />
      👥 Организатор: {{ (data as EventData).organizer }}
    </div>

    <!-- Локация -->
    <!-- <p v-if="data.location" class="location">📍 {{ data.location.address }}</p> -->

    <!-- Кнопка действия -->
    <button v-if="!actionDone" class="action-btn" @click="doAction" :disabled="isLoading">
      {{
        isLoading ? (type == 'user' ? 'Заявка на рассмотрении' : 'Вы уже участник!') : actionLabel
      }}
    </button>
    <button v-if="actionDone && actionDone != true" class="action-done-btn" :disabled="true">
      {{ actionDone }}
    </button>
  </div>
</template>

<style scoped>
.popup {
  font-family: sans-serif;
  width: 260px;
  padding: 10px;
  border-radius: 12px;
  background: white;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); */
}
.title {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.author {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #777;
}
.description {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #444;
}
.reward {
  margin-bottom: 8px;
  padding: 6px;
  border-radius: 8px;
  background: #f0f8ff;
  font-size: 13px;
}
.requirements {
  font-size: 12px;
  margin-bottom: 8px;
}
.participants .list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
.participant {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
}
.participant.accepted {
  background: #d4f5d4;
}
.participant.pending {
  background: #fce5cd;
}
.location {
  margin: 0;
  font-size: 12px;
  color: #666;
}
.action-btn {
  margin-top: 8px;
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: #4caf50;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}
.action-done-btn {
  margin-top: 8px;
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: #91c293;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}
.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
