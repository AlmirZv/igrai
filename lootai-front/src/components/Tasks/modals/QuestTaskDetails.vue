<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <Card class="modal">
      <div class="modal-header">
        <Text variant="h2">{{ task.title }}</Text>
        <Button variant="secondary" @click="$emit('close')">x</Button>
      </div>

      <div class="modal-content">
        <div class="modal-section">
          <Text variant="p">
            <strong>{{ $t(`tasks.modal.author`) }}:</strong> {{ task.author }}
          </Text>
          <Text variant="p">
            <strong>{{ $t(`tasks.modal.description`) }}:</strong> {{ task.description }}
          </Text>
          <!-- <Text variant="p">
            <strong>{{ $t(`tasks.modal.finishWords`) }}:</strong> {{ task.finishWords }}
          </Text> -->
        </div>

        <div class="modal-section requirements">
          <Text variant="h4" color="muted">⚙️ {{ $t(`tasks.modal.requirements.title`) }}</Text>
          <ul>
            <li>
              <strong>{{ $t(`tasks.modal.requirements.age`) }}:</strong>
              {{ task.requirements.minAge }} - {{ task.requirements.maxAge }}
            </li>
            <li>
              <strong>{{ $t(`tasks.modal.requirements.gender`) }}:</strong>
              {{ $t(`tasks.edit.genderType.${task.requirements.gender}`) }}
            </li>
            <li>
              <strong>{{ $t(`tasks.modal.time`) }}:</strong>
              {{ task.requirements.startDate }} - {{ task.requirements.endDate }}
            </li>
            <li>
              <strong>{{ $t(`tasks.modal.requirements.difficulty`) }}:</strong>
              {{ $t(`tasks.edit.difficultyType.${task.requirements.difficulty}`) }}
            </li>
          </ul>
        </div>

        <div class="modal-section reward">
          <Text variant="h4" color="muted">💎 {{ $t(`tasks.modal.reward.title`) }}</Text>
          <ul>
            <li>
              <strong>{{ $t(`tasks.modal.reward.experience`) }}:</strong> {{ task.reward.xp }}
            </li>
            <li>
              <strong>{{ $t(`tasks.modal.reward.points`) }}:</strong> {{ task.reward.points }}
            </li>
            <li>
              <strong>{{ $t(`tasks.modal.reward.inventory`) }}:</strong>
              {{ task.reward.inventoryItem }}
            </li>
          </ul>
        </div>

        <div class="modal-section steps">
          <Text variant="h4" color="muted">🧭 {{ $t(`tasks.modal.steps`) }}</Text>

          <div v-if="aTab === 'created'">
            <div v-for="step in task.steps">
              <div>{{ step.description }}</div>
              <div class="step">
                <b>{{ step.title }}</b>
                <div v-if="step.type == 'riddle'">{{ step.riddle }}</div>
                <div v-else-if="step.type == 'qr'">{{ step.qrCode }}</div>
                <div v-else-if="step.type == 'photo'">{{ step.photoExampleUrl || '' }}</div>
                <div v-else></div>
              </div>
            </div>
          </div>

          <div v-else>
            <div>{{ currentStep?.description }}</div>
            <div v-if="distance2quest < 10000" class="step">
              <b>{{ currentStep?.title }}</b>
              <div>{{ stepContent }}</div>
            </div>
            <div v-else class="step">{{ $t('map.popup.requirements.distanceToQuest') }}</div>

            <div>
              <div class="field" v-if="currentStep?.type === 'riddle'">
                {{ $t('map.popup.answer') }}: <Input type="text" v-model="riddleAnswer" />
                <Button v-if="!solved" @click="checkRiddleAnswer">{{
                  $t('map.popup.answer')
                }}</Button>
              </div>

              <div class="field" v-if="currentStep?.type === 'qr'">
                <Button v-if="!solved" @click="scanQRCode">Scan</Button>
              </div>
            </div>
          </div>
        </div>

        <!-- <div v-if="aTab === 'created'" class="modal-section participants">
          <h4>👥 {{ $t(`tasks.modal.participants`) }}</h4>
          <ul>
            <li v-for="(p, i) in task.participants" :key="i" class="participant-item">
              <span>{{ p.name }} ({{ p.gender || '' }}, {{ p.age || '' }})</span>
            </li>
          </ul>
        </div> -->
      </div>

      <div v-if="aTab === 'created'" class="modal-actions">
        <Button variant="primary" v-if="task.status !== 'completed'" @click="$emit('complete')">
          {{ $t(`tasks.buttons.completeTask`) }}
        </Button>
        <Button variant="secondary" @click="$emit('edit')">{{
          $t(`tasks.buttons.editTask`)
        }}</Button>
      </div>
      <div v-else class="modal-actions">
        <Button variant="secondary" @click="$emit('close')">{{
          $t(`tasks.buttons.closeTask`)
        }}</Button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { auth } from '@/config/firebase'
import { Card, Text, Button } from '@/designSystem/components'
import type { QuestTask } from '@/types/quest'
import { calculateDistance } from '@/utils/geolocation'
import { useGeolocation } from '@/composables/useGeolocation'
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'

const { getLocation } = useGeolocation()

const props = defineProps<{
  task: QuestTask
  aTab: 'taken' | 'created'
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'complete'): void
  (e: 'edit'): void
}>()

const solved = ref(false)
const riddleAnswer = ref('')

const currentStep = computed(() => {
  console.log(props.task)
  const step = props.task.steps.find(
    (step) =>
      step.id ==
      props.task.participants.find((participant) => participant.id == auth.currentUser?.uid)
        ?.progress.currentStepId,
  )
  if (step) return step
  else return props.task.steps[0]
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

onMounted(async () => {
  console.log(currentStep.value)
  distance2quest.value = await checkDistance()
})

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

function checkRiddleAnswer() {
  // console.log(riddleAnswer.value)
  if (currentStep.value.type == 'riddle' && riddleAnswer.value == currentStep.value.answer) {
    // emit('updateStep', { id: props.data.id, step: currentStep.value })
    solved.value = true
  } else {
    console.log('Неправильный ответ')
  }
}

async function scanQRCode() {
  await BarcodeScanner.checkPermission({ force: true })

  document.body.classList.add('scanner-active')
  await BarcodeScanner.startScan()

  const result = await BarcodeScanner.startScan()

  if (result.content == currentStep.value.id) {
    // emit('updateStep', { id: props.data.id, step: currentStep.value })
    solved.value = true
  }

  document.body.classList.remove('scanner-active')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn var(--motion-duration-normal) var(--motion-easing-standart);
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 100%;
  box-sizing: border-box;
  transform: translateY(10px);
  animation: slideUp var(--motion-duration-normal) var(--motion-easing-standart) forwards;
  overflow: auto;
  max-height: 90vh;
}

.modal-content {
  overflow-y: auto;
  overflow-x: hidden;
  max-width: 100%;
  box-sizing: border-box;
  padding-right: 4px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-section {
  margin-bottom: var(--space-lg);
}

.modal-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.modal-section li {
  margin: var(--space-xs) 0;
}

.reward,
.requirements {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
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
  border: 1px solid var(--border-subtle);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
