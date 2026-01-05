<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import type { QuestTask, QuestParticipant, QuestRequirements } from '@/types/quest'
import { auth } from '@/config/firebase'
import uInfoComposable from '@/composables/userInfo'
import { calculateDistance } from '@/utils/geolocation'
import { useGeolocation } from '@/composables/useGeolocation'
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'
import questFinish from './questFinish.vue'
import { Input, Button } from '@/designSystem/components'

const { getLocation } = useGeolocation()

import { i18n } from '@/locales/i18n'

const t = i18n.global.t

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
    return `${t('map.popup.requirements.ageMoreThan')} ${requiredAge}`
  }

  if (requiredGender != 'any' && userGender != requiredGender) {
    return `${t('map.popup.requirements.required')} ${requiredGender == 'female' ? t('map.popup.genderType.female') : t('map.popup.genderType.male')}`
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
        return t('map.buttons.alreadyMember')
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
      <p class="author">
        🎯 {{ t('map.popup.difficulty') }}: {{ (data as QuestTask).requirements.difficulty }}
      </p>
      <div class="author">
        <div>{{ t('map.popup.reward') }}:</div>
        XP: {{ (data as QuestTask).reward.xp }}, {{ t('map.popup.points') }}:
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
            {{ t('map.popup.answer') }}: <Input type="text" v-model="riddleAnswer" />
            <Button v-if="!solved" @click="checkRiddleAnswer">{{ t('map.popup.answer') }}</Button>
          </div>

          <div class="field" v-if="currentStep?.type === 'qr'">
            <Button v-if="!solved" @click="scanQRCode">Scan</Button>
          </div>
        </div>
        <div v-else>{{ t('map.popup.requirements.youCreatedTask') }}</div>
      </div>
      <div v-else class="step">{{ t('map.popup.requirements.distanceToQuest') }}</div>

      <!-- Кнопка действия -->
      <!-- <button v-if="!actionDone" class="action-btn" @click="doAction" :disabled="isLoading">
      {{ isLoading ? 'Вы уже участник!' : 'Начать квест' }}
    </button>
    <button v-if="actionDone && actionDone != true" class="action-btn">Ответ</button> -->
    </div>
    <div v-else class="quest-complete">
      <div class="header">
        <span class="badge"
          >{{ t('map.popup.types.quest') }} "{{ data.title }}" {{ t('map.popup.completed') }}</span
        >
      </div>

      <div class="meta">
        <p v-if="data.author" class="author">👤 {{ t('map.popup.author') }}: {{ data.author }}</p>
        <p class="difficulty">
          🎯 {{ t('map.popup.difficulty') }}: {{ (data as QuestTask).requirements.difficulty }}
        </p>
      </div>

      <div class="reward-block">
        <div class="reward-title">🏆 {{ t('map.popup.yourReward') }}</div>
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
/* Заголовок */
.title {
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

/* Автор и мета */
.author,
.difficulty {
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

/* Описание */
.description {
  margin: 0 0 var(--space-md) 0;
  font-size: var(--font-size-sm);
  /* font-weight: var(--font-weight-semibold); */
  /* color: var(--text-muted); */
}

/* Формы */
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
  font-size: var(--font-size-sm);
}

/* Шаги */
.step {
  margin-top: var(--space-md);
  background: var(--bg-surface);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 40vh;
  overflow: auto;
  font-size: var(--font-size-sm);
}

/* --- Quest Completed блок --- */

.badge {
  display: inline-block;
  background: var(--bg-surface);
  color: var(--text-accent);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-md);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Награда */
.reward-block {
  margin-top: var(--space-md);
  background: var(--bg-surface);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}

.reward-title {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-md);
}

.reward-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.reward-list li {
  margin: var(--space-xs) 0;
  font-size: var(--font-size-md);
}

.reward-list strong {
  color: var(--text-accent);
}

/* Финальные слова */
.finish-words {
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-subtle);
  font-size: var(--font-size-sm);
  opacity: 0.9;
  line-height: var(--font-lineHeight-normal);
}
</style>
