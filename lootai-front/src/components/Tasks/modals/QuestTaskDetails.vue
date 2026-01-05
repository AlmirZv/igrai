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
          <Text variant="p">
            <strong>{{ $t(`tasks.modal.finishWords`) }}:</strong> {{ task.finishWords }}
          </Text>
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
              {{ gender[task.requirements.gender] }}
            </li>
            <li>
              <strong>{{ $t(`tasks.modal.requirements.date`) }}:</strong>
              {{ task.requirements.startDate }} - {{ task.requirements.endDate }}
            </li>
            <li>
              <strong>{{ $t(`tasks.modal.requirements.difficulty`) }}:</strong>
              {{ difficulty[task.requirements.difficulty] }}
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
          <ul>
            <li v-for="step in task.steps" :key="step.id">
              <strong>{{ step.title }}</strong> — {{ step.description }}
            </li>
          </ul>
        </div>

        <div v-if="aTab === 'created'" class="modal-section participants">
          <h4>👥 {{ $t(`tasks.modal.participants`) }}</h4>
          <ul>
            <li v-for="(p, i) in task.participants" :key="i" class="participant-item">
              <span>{{ p.name }} ({{ p.gender || '' }}, {{ p.age || '' }})</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="aTab === 'created'" class="modal-actions">
        <Button variant="primary" v-if="task.status !== 'completed'" @click="$emit('complete')">
          {{ $t(`tasks.buttons.completeTask`) }}
        </Button>
        <Button variant="secondary" @click="$emit('edit')">{{
          $t(`tasks.buttons.editTask`)
        }}</Button>
        <Button variant="secondary" @click="$emit('close')">{{
          $t(`tasks.buttons.closeTask`)
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
import { Card, Text, Button } from '@/designSystem/components'
import type { QuestTask } from '@/types/quest'

defineProps<{
  task: QuestTask
  aTab: 'taken' | 'created'
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'complete'): void
  (e: 'edit'): void
}>()

const gender: Record<string, string> = {
  male: 'мужчина',
  female: 'женщина',
  any: 'любой',
}

const difficulty: Record<string, string> = {
  easy: 'легко',
  medium: 'средне',
  hard: 'сложно',
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
