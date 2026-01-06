<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <Card class="modal">
      <div class="modal-header">
        <Text variant="h3">{{ $t(`tasks.edit.questTitle`) }}</Text>
        <Button variant="secondary" @click="$emit('cancel')">x</Button>
      </div>

      <form class="form" @submit.prevent="submit">
        <label>
          {{ $t(`tasks.modal.title`) }}
          <Input v-model="form.title" type="text" required />
        </label>

        <label>
          {{ $t(`tasks.modal.description`) }}
          <Textarea v-model="form.description" rows="3" required />
        </label>

        <label>
          {{ $t(`tasks.modal.finishWords`) }}
          <Textarea v-model="form.finishWords" rows="2" />
        </label>

        <div class="grid">
          <label>
            XP
            <Input v-model.number="form.reward.xp" type="number" min="0" />
          </label>
          <label>
            {{ $t(`tasks.modal.reward.points`) }}
            <Input v-model.number="form.reward.points" type="number" min="0" />
          </label>
          <label>
            {{ $t(`tasks.modal.reward.inventory`) }}
            <Input v-model="form.reward.inventoryItem" type="text" />
          </label>
        </div>

        <div class="grid">
          <label>
            {{ $t(`tasks.modal.requirements.startDate`) }}
            <Input v-model="form.requirements.startDate" type="date" />
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.endDate`) }}
            <Input v-model="form.requirements.endDate" type="date" />
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.age`) }}
            <Input v-model.number="form.requirements.minAge" type="number" min="0" />
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.age`) }} max
            <Input v-model.number="form.requirements.maxAge" type="number" min="0" />
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.gender`) }}
            <Select v-model="form.requirements.gender">
              <option value="any">Любой</option>
              <option value="male">Мужчина</option>
              <option value="female">Женщина</option>
            </Select>
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.difficulty`) }}
            <Select v-model="form.requirements.difficulty">
              <option value="easy">{{ $t(`tasks.edit.difficultyType.easy`) }}</option>
              <option value="medium">{{ $t(`tasks.edit.difficultyType.medium`) }}</option>
              <option value="hard">{{ $t(`tasks.edit.difficultyType.hard`) }}</option>
            </Select>
          </label>
        </div>

        <div class="actions">
          <Button variant="primary" type="submit">{{ $t(`tasks.buttons.save`) }}</Button>
          <Button variant="secondary" type="button" @click="$emit('cancel')">
            {{ $t(`tasks.buttons.cancel`) }}
          </Button>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Card, Text, Button, Select, Input, Textarea } from '@/designSystem/components'
import type { QuestTask } from '@/types/quest'

const props = defineProps<{
  task: QuestTask
}>()

const emit = defineEmits<{
  (e: 'save', payload: Partial<QuestTask>): void
  (e: 'cancel'): void
}>()

const form = reactive(JSON.parse(JSON.stringify(props.task)) as QuestTask)

const submit = () => {
  emit('save', form)
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
  z-index: 1001;
}

.modal {
  width: 90%;
  max-width: 720px;
  padding: var(--space-lg);
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

label {
  display: flex;
  flex-direction: column;
  gap: var(--space-xxs);
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-sm);
}

.actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}
</style>
