<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import type { QuestTask, QuestParticipant, QuestRequirements } from '@/types/quest'
import { auth } from '@/config/firebase'
import uInfoComposable from '@/composables/userInfo'
import { calculateDistance } from '@/utils/geolocation'
import { useGeolocation } from '@/composables/useGeolocation'
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'
import questFinish from './questFinish.vue'

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
const finished = ref(false)
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

async function scanQRCode() {
  await BarcodeScanner.checkPermission({ force: true })

  document.body.classList.add('scanner-active')
  await BarcodeScanner.startScan()

  const result = await BarcodeScanner.startScan()

  if (result.content == currentStep.value.id) {
    emit('updateStep', { id: props.data.id, step: currentStep.value })
    solved.value = true
  }

  document.body.classList.remove('scanner-active')
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
    <div
      v-if="
        data.participants.find((participant) => participant.id !== auth.currentUser?.uid)?.status !=
        'completed'
      "
    >
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
      <div v-if="type === 'quest' && distance2quest < 10000" class="quest">
        <div>{{ currentStep?.description }}</div>
        <div class="step">
          <b>{{ currentStep?.title }}</b>
          <div>{{ stepContent }}</div>
        </div>

        <div v-if="auth.currentUser?.uid != data.authorId">
          <div class="field" v-if="currentStep?.type === 'riddle'">
            Ответ: <input type="text" v-model="riddleAnswer" />
            <button v-if="!solved" class="action-btn" @click="checkRiddleAnswer">Ответ</button>
          </div>

          <div class="field" v-if="currentStep?.type === 'qr'">
            <button v-if="!solved" class="action-btn" @click="scanQRCode">Scan</button>
          </div>
        </div>
        <div v-else>You are creator</div>
      </div>
      <div v-else class="step">Чтобы учавствовать вам надо быть в пределах квеста</div>

      <!-- Кнопка действия -->
      <!-- <button v-if="!actionDone" class="action-btn" @click="doAction" :disabled="isLoading">
      {{ isLoading ? 'Вы уже участник!' : 'Начать квест' }}
    </button>
    <button v-if="actionDone && actionDone != true" class="action-btn">Ответ</button> -->
    </div>
    <div v-else class="quest-complete">
      <div class="header">
        <span class="badge">Quest "{{ data.title }}" Completed</span>
      </div>

      <div class="meta">
        <p v-if="data.author" class="author">👤 Автор: {{ data.author }}</p>
        <p class="difficulty">🎯 Сложность: {{ (data as QuestTask).requirements.difficulty }}</p>
      </div>

      <div class="reward-block">
        <div class="reward-title">🏆 Ваша награда</div>
        <ul class="reward-list">
          <li>
            XP: <strong>{{ (data as QuestTask).reward.xp }}</strong>
          </li>
          <li>
            Монеты: <strong>{{ (data as QuestTask).reward.points }}</strong>
          </li>
          <li v-if="(data as QuestTask).reward.inventoryItem">
            Предмет: <strong>{{ (data as QuestTask).reward.inventoryItem }}</strong>
          </li>
        </ul>
      </div>

      <div class="finish-words">
        {{ data.finishWords }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Общий стиль попапа */
.popup {
  font-family: 'Segoe UI', sans-serif;
  width: 280px;
  padding: 18px;
  border-radius: 14px;
  background: #1b1e24;
  color: #f1f1f1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

.fullscreen {
  width: 280px;
  padding: 18px;
  border-radius: 14px;
  background: #1b1e24;
  color: #f1f1f1;
  overflow: auto;
}

/* Заголовок */
.title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

/* Автор и мета */
.author,
.difficulty {
  margin: 4px 0;
  font-size: 14px;
  opacity: 0.85;
}

/* Описание */
.description {
  margin: 10px 0;
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
}

/* Формы */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
  font-size: 14px;
}

input {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #3a3f4b;
  background: #242830;
  color: #fff;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #3d7eff;
}

/* Шаги */
.step {
  margin-top: 12px;
  background: #242830;
  padding: 12px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 40vh;
  overflow: auto;
  font-size: 14px;
}

/* Кнопки */
.action-btn {
  margin-top: 12px;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: #3d7eff;
  color: white;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* --- Quest Completed блок --- */

.quest-complete {
  background: #1b1e24;
  padding: 16px;
  border-radius: 14px;
  color: #f1f1f1;
}

.badge {
  display: inline-block;
  background: #3d7eff;
  color: #fff;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Награда */
.reward-block {
  margin-top: 18px;
  background: #242830;
  padding: 14px;
  border-radius: 12px;
}

.reward-title {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 16px;
}

.reward-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.reward-list li {
  margin: 5px 0;
  font-size: 15px;
}

.reward-list strong {
  color: #58ffab;
}

/* Финальные слова */
.finish-words {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
}
</style>
