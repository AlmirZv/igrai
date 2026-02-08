<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import type { QuestTask, QuestParticipant, QuestRequirements } from '@/types/quest'
import { auth } from '@/config/firebase'
import uInfoComposable from '@/composables/userInfo'
import { calculateDistance } from '@/utils/geolocation'
import { useGeolocation } from '@/composables/useGeolocation'
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import questFinish from './questFinish.vue'
import { Input, Button } from '@/designSystem/components'
// @ts-ignore - three.js types are included in the package
import * as THREE from 'three'
import { createArEngine } from '@/ar/anchors/AnchorFactory'
import { createCube } from '@/ar/assets/createCube'
import { loadArModelWithAnimations } from '@/ar/assets/arModels'
import { loadGLB } from '@/ar/assets/ModelLoader'
import { mindarApi } from '@/api/mindar.api'

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
  (e: 'updateStep', payload: { id: string; step: any }): void
}>()

const isLoading = ref(false)
const popupRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)

const uicomposable = uInfoComposable()

const solved = ref(false)
const finished = ref(false)
const riddleAnswer = ref('')
const arAnswer = ref('')
const arViewerOpen = ref(false)
const arContainer = ref<HTMLElement | null>(null)
let arEngine: any = null

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
    case 'ar':
      return t('map.popup.ar.description') || 'Используйте AR камеру, чтобы найти подсказку'
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
  const { camera } = await BarcodeScanner.checkPermissions()
  if (camera !== 'granted') {
    await BarcodeScanner.requestPermissions()
  }

  document.body.classList.add('scanner-active')
  try {
    const { barcodes } = await BarcodeScanner.scan({ formats: ['QR_CODE'] })
    const content = barcodes?.[0]?.displayValue ?? barcodes?.[0]?.rawValue
    if (content === currentStep.value?.id) {
      emit('updateStep', { id: props.data.id, step: currentStep.value })
      solved.value = true
    }
  } finally {
    document.body.classList.remove('scanner-active')
  }
}

async function openArViewer() {
  const step = currentStep.value
  if (!step || step.type !== 'ar') return

  // Пока у нас нет реального .mind файла, не пытаемся запускать MindAR,
  // иначе она падает с ошибкой декодера ("Extra byte(s) found at buffer").
  if (!step.imageTargetFile || !step.imageTargetFile.toLowerCase().endsWith('.mind')) {
    alert(
      t('map.popup.ar.targetNotReady') ||
        'AR-якорь ещё не готов. Нужен .mind файл, который надо сгенерировать на сервере.'
    )
    return
  }

  arViewerOpen.value = true
  await nextTick()

  if (!arContainer.value) {
    console.error('AR container or image target not available')
    return
  }

  try {
    // Полный URL на бэкенд — иначе MindAR запрашивает с origin фронта
    const mindUrl = mindarApi.resolveMindUrl(step.imageTargetFile)
    const targetCount = step.imageTargetUrls?.length || 1
    arEngine = await createArEngine('image', arContainer.value, mindUrl, { targetCount })

    // Загружаем модель (с анимациями для животных)
    let model: THREE.Object3D
    if (step.modelType === 'cube') {
      model = createCube()
    } else if (step.modelType && String(step.modelType) !== 'cube') {
      const result = await loadArModelWithAnimations(step.modelType)
      model = result.model
      if (result.mixer) arEngine.addAnimationMixer(result.mixer)
    } else if (step.modelUrl) {
      model = await loadGLB(step.modelUrl)
    } else {
      model = createCube() // fallback
    }

    arEngine.addModel(model)

    // Применяем transform через engine (для сглаженного позиционирования)
    if (step.transform) {
      arEngine.setTransform({
        position: new THREE.Vector3(
          step.transform.position.x,
          step.transform.position.y,
          step.transform.position.z
        ),
        rotation: new THREE.Euler(
          step.transform.rotation.x,
          step.transform.rotation.y,
          step.transform.rotation.z
        ),
        scale: new THREE.Vector3(
          step.transform.scale.x,
          step.transform.scale.y,
          step.transform.scale.z
        ),
      })
    }

    arEngine.onAnchorFound(() => {
      console.log('AR anchor found!')
    })

    arEngine.onAnchorLost(() => {
      console.log('AR anchor lost')
    })

    await arEngine.start()
  } catch (error) {
    console.error('Error starting AR viewer:', error)
  }
}

function closeArViewer() {
  if (arEngine) {
    arEngine.stop()
    arEngine = null
  }
  arViewerOpen.value = false
}

function checkArAnswer() {
  isLoading.value = true
  const step = currentStep.value
  if (step && step.type === 'ar' && arAnswer.value === step.answer) {
    emit('updateStep', { id: props.data.id, step: step })
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

onUnmounted(() => {
  if (arEngine) {
    arEngine.stop()
    arEngine = null
  }
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

          <div class="field" v-if="currentStep?.type === 'ar'">
            <Button v-if="!solved && !arViewerOpen" @click="openArViewer">
              {{ t('map.buttons.enableCamera') || 'Включить камеру' }}
            </Button>
            <div v-if="arViewerOpen" class="ar-viewer-container">
              <div class="ar-viewport" ref="arContainer"></div>
              <Button @click="closeArViewer" class="ar-close-btn">
                {{ t('map.buttons.closeCamera') || 'Закрыть камеру' }}
              </Button>
            </div>
            <div v-if="!arViewerOpen" class="field">
              {{ t('map.popup.answer') }}: <Input type="text" v-model="arAnswer" />
              <Button v-if="!solved" @click="checkArAnswer">{{ t('map.popup.answer') }}</Button>
            </div>
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

/* AR Viewer */
.ar-viewer-container {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 10000;
  display: flex;
  flex-direction: column;
}

.ar-viewport {
  flex: 1;
  width: 100%;
  height: 100%;
}

.ar-close-btn {
  position: absolute;
  bottom: var(--space-md);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
}
</style>
