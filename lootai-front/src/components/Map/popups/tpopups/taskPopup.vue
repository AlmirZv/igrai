<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task, TaskParticipant, TaskRequirements } from '@/types/task'
import { auth } from '@/config/firebase'
import uInfoComposable from '@/composables/userInfo'
import { Button } from '@/designSystem/components'

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
      <div class="requirements">
        ⏰ {{ (data as Task).requirements.startTime }} {{ (data as Task).requirements.startDate }} |
        {{ (data as Task).requirements.endTime }} {{ (data as Task).requirements.endDate }}
        <br />
        👥 Нужно участников: {{ (data as Task).requirements.membersCount }} <br />
        🎂 Возраст: {{ (data as Task).requirements.age }}+ <br />
        ⚧ Пол: {{ (data as Task).requirements.gender }} <br />
      </div>
      <div class="reward">
        🎁 <b>Награда:</b> {{ (data as Task).reward.xp }} XP,
        {{ (data as Task).reward.points }} очков,
        {{ (data as Task).reward.inventoryItem }}
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

    <!-- Локация -->
    <!-- <p v-if="data.location" class="location">📍 {{ data.location.address }}</p> -->

    <!-- Кнопка действия -->
    <Button v-if="!actionDone" class="action-btn" @click="doAction" :disabled="isLoading">
      {{
        isLoading ? (type == 'user' ? 'Заявка на рассмотрении' : 'Вы уже участник!') : actionLabel
      }}
    </Button>
    <Button v-if="actionDone && actionDone != true" class="action-done-btn" :disabled="true">
      {{ actionDone }}
    </Button>
  </div>
</template>

<style scoped>
.title {
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.author {
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}
.description {
  margin: 0 0 var(--space-md) 0;
  font-size: var(--font-size-sm);
}
.reward {
  margin-top: var(--space-md);
  background: var(--bg-surface);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}
.requirements {
  margin-top: var(--space-md);
  background: var(--bg-surface);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}
.participants .list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin: var(--space-xs) 0;
}
.participant {
  font-size: var(--font-size-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--space-sm);
}
.participant.accepted {
  background: var(--state-success);
  color: var(--text-accent);
}
.participant.pending {
  background: var(--state-error);
  color: var(--text-accent);
}
.location {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}
</style>
