<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import type { QuestTask, QuestParticipant, QuestRequirements } from '@/types/quest'
import { auth } from '@/config/firebase'
import uInfoComposable from '@/composables/userInfo'
import { calculateDistance } from '@/utils/geolocation'
import { useGeolocation } from '@/composables/useGeolocation'

const { getLocation } = useGeolocation()
type PopupType = 'quest'

const props = defineProps<{
  type: PopupType
  data: QuestTask
}>()

const emit = defineEmits<{
  (e: 'action', payload: { type: PopupType; id: string }): void
}>()

const isLoading = ref(false)
const popupRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)

const uicomposable = uInfoComposable()

const solved = ref(false)
const riddleAnswer = ref('')

const currentStep = computed(() => {
  console.log(props.data)
  const step = props.data.steps.find(
    (step) =>
      step.id ==
      props.data.participants.find((participant) => participant.id == auth.currentUser?.uid)
        ?.progress.currentStepId,
  )
  if (step) return step
  else return props.data.steps[0]
})

const stepContent = computed(() => {
  const step = currentStep.value
  console.log(step)
  if (!step) return ''

  switch (step.type) {
    case 'riddle':
      return step.riddle
    case 'qr':
      return step.qrCode
    case 'photo':
      return step.photoExampleUrl || ''
    default:
      return ''
  }
})

function doAction() {
  isLoading.value = true

  emit('action', { type: props.type, id: props.data.id })
  // setTimeout(() => (isLoading.value = false), 1000)
}

function checkRiddleAnswer() {
  isLoading.value = true
  // console.log(riddleAnswer.value)
  if (currentStep.value.type == 'riddle' && riddleAnswer.value == currentStep.value.answer) {
    emit('updateStep', { id: props.data.id, step: currentStep.value })
    solved.value = true
  } else {
    console.log('Неправильный ответ')
  }
  isLoading.value = false
}

const actionDone = computed(() => {
  const userAge = uicomposable.state.age.value
  const userGender = uicomposable.state.user.value.gender

  const requiredAge = props.data.requirements.minAge
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

    const isParticipant = participants?.some((p) => p.id === userId)

    if (isParticipant) {
      const isParticipantAccepted = participants?.some(
        (p) => p.id === userId && p.status == 'accepted',
      )
      if (isParticipantAccepted) {
        return 'Вы уже участник!'
      }
    } else {
      console.log('Пользователь ещё не в списке')
    }
    return true
  } else {
    return false
  }
})

function hasParticipants(participants: QuestParticipant | QuestParticipant[] | undefined): boolean {
  const arr = Array.isArray(participants) ? participants : participants ? [participants] : []
  return arr.length > 0
}

// Проверка высоты контента
function checkHeight() {
  nextTick(() => {
    if (!popupRef.value) return
    const popupHeight = popupRef.value.scrollHeight
    const windowHeight = window.innerHeight
    isFullscreen.value = popupHeight > windowHeight * 0.8
  })
}

onMounted(async () => {
  checkHeight()
  window.addEventListener('resize', checkHeight)
  console.log(currentStep.value)
  distance2quest.value = await checkDistance()
})

watch(() => props.data, checkHeight, { deep: true })

const distance2quest = ref(100)
async function checkDistance() {
  // userposition
  const { lat, lng } = await getLocation()
  // step position
  const stepPosition = currentStep.value.location
  const distance = Math.ceil(calculateDistance(stepPosition.lat, stepPosition.lng, lat, lng) * 1000)
  console.log(distance)
  return distance
}
</script>

<template>
  <div ref="popupRef" class="popup" :class="{ fullscreen: isFullscreen }">
    <!-- Заголовок -->
    <h3 class="title">{{ data.title }}</h3>

    <!-- Автор -->
    <p v-if="data.author" class="author">👤 {{ data.author }}</p>
    <p class="author">🎯 Сложность: {{ (data as QuestTask).requirements.difficulty }}</p>
    <div class="author">
      <div>Награда:</div>
      XP: {{ (data as QuestTask).reward.xp }}, Монет:
      {{ (data as QuestTask).reward.points }}
      {{ (data as QuestTask).reward.inventoryItem ? ',' : '' }}
      {{ (data as QuestTask).reward.inventoryItem }}
    </div>
    <!-- Описание -->
    <p class="description">{{ data.description }}</p>

    <!-- Quest -->
    <div v-if="type === 'quest' && distance2quest < 10" class="quest">
      <div>{{ currentStep?.description }}</div>
      <div class="step">
        <b>{{ currentStep?.title }}</b>
        <div>{{ stepContent }}</div>
      </div>

      <div class="field" v-if="currentStep?.type === 'riddle'">
        Ответ: <input type="text" v-model="riddleAnswer" />
        <button v-if="!solved" class="action-btn" @click="checkRiddleAnswer">Ответ</button>
      </div>
    </div>
    <div v-else class="step">Чтобы учавствовать вам надо быть в пределах квеста</div>

    <!-- Кнопка действия -->
    <!-- <button v-if="!actionDone" class="action-btn" @click="doAction" :disabled="isLoading">
      {{ isLoading ? 'Вы уже участник!' : 'Начать квест' }}
    </button>
    <button v-if="actionDone && actionDone != true" class="action-btn">Ответ</button> -->
  </div>
</template>

<style scoped>
.field {
  display: grid;
  grid-template-columns: 100px 1fr; /* подпись фикс, поле тянется */
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-top: 6px;
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

.popup {
  font-family: sans-serif;
  width: 260px;
  /* height:  80vh; */
  padding: 10px;
  border-radius: 12px;
  background: white;
  /* overflow: auto; */
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); */
}
.fullscreen {
  font-family: sans-serif;
  width: 260px;
  /* height: 80vh; */
  padding: 10px;
  border-radius: 12px;
  background: white;
  overflow: auto;
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
.step {
  margin-top: 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 40vh;
  overflow: auto;
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
