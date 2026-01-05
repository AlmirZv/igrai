<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <Card class="modal">
      <div class="modal-header">
        <Text variant="h2">{{ task.title }}</Text>
        <Button variant="secondary" @click="$emit('close')">x</Button>
      </div>

      <div class="modal-content">
        <div class="modal-section">
          <Text variant="p"
            ><strong>{{ $t(`tasks.modal.author`) }}:</strong> {{ task.author }}</Text
          >
          <Text variant="p"
            ><strong>{{ $t(`tasks.modal.description`) }}:</strong> {{ task.description }}</Text
          >
          <Text variant="p">
            <strong>{{ $t(`tasks.modal.time`) }}:</strong> {{ task.requirements.startTime }}
            {{ task.requirements.startDate }}
            {{ $t(`tasks.modal.to`) }}
            {{ task.requirements.endTime }} {{ task.requirements.endDate }}
          </Text>
        </div>

        <div class="modal-section requirements">
          <Text variant="h4" color="muted">⚙️ {{ $t(`tasks.modal.requirements.title`) }}</Text>
          <ul>
            <li>
              <strong>{{ $t(`tasks.modal.requirements.age`) }}:</strong> {{ task.requirements.age }}
            </li>
            <li>
              <strong>{{ $t(`tasks.modal.requirements.gender`) }}:</strong>
              {{ gender[task.requirements.gender] }}
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

        <div v-if="aTab === 'created'" class="modal-section participants">
          <h4>👥 {{ $t(`tasks.modal.participants`) }}</h4>
          <ul>
            <li
              v-for="(p, i) in task.participants"
              :key="i"
              class="participant-item"
              @click="showParticipantInfo(p)"
            >
              <span>{{ p.name }}({{ p.gender ? p.gender : '' }}, {{ p.age ? p.age : '' }})</span>
              <div class="participant-actions">
                <Button @click="$emit('accept', p)">✔</Button>
                <Button @click="$emit('decline', p)">✖</Button>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="aTab === 'created'" class="modal-actions">
        <Button variant="primary" v-if="task.status != 'completed'" @click="$emit('complete')">
          {{ $t(`tasks.buttons.completeTask`) }}
        </Button>
        <Button variant="secondary" @click="$emit('close')">{{
          $t(`tasks.buttons.closeTask`)
        }}</Button>
      </div>
      <div v-else class="modal-actions">
        <Button variant="primary" v-if="task.status != 'completed'" @click="$emit('cancel')">
          {{ $t(`tasks.buttons.cancelTask`) }}
        </Button>
        <Button variant="secondary" @click="$emit('close')">{{
          $t(`tasks.buttons.closeTask`)
        }}</Button>
      </div>
    </Card>
  </div>
</template>

<script setup>
import UserPopup from './ParticipantInfo.vue'
import { Card, Text, Button } from '@/designSystem/components'
import { ref } from 'vue'

const props = defineProps({
  task: Object,
  aTab: String,
})
defineEmits(['close', 'cancel', 'complete', 'accept', 'decline'])
console.log(props.task)

const gender = {
  male: 'мужчина',
  female: 'женщина',
  any: 'любой',
}

const showuspopup = ref(false)
const showedPart = ref()
async function showParticipantInfo(participant) {
  // console.log(participant)
  showedPart.value = participant
  showuspopup.value = true
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
}

.modal-content {
  overflow-y: auto;
  overflow-x: hidden;
  max-width: 100%;
  box-sizing: border-box;
  padding-right: 4px; /* чтобы скролл не наезжал */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0; /* позволяет flex-элементам сжиматься */
}

.modal-header :deep(.text) {
  min-width: 0; /* позволяет тексту сжиматься */
  flex: 1;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.modal-section {
  margin-bottom: var(--space-lg);
  max-width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
  overflow-x: hidden;
}

.modal-section :deep(.text) {
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  overflow-x: hidden;
}
.modal-section:last-child {
  border: none;
}

.modal-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.modal-section li {
  margin: var(--space-xs) 0;
}

.reward {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.requirements {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.participants .participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-overlay);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  margin-top: var(--space-xs);
}

.participant-actions {
  display: flex;
  justify-content: space-between;
  gap: var(--space-xs);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
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
