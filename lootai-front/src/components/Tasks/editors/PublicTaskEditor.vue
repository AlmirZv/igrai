<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <Card class="modal">
      <div class="modal-header">
        <Text variant="h3">{{ $t(`tasks.edit.publicTitle`) }}</Text>
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

        <div class="grid">
          <label>
            XP
            <Input v-model.number="form.reward.xp" type="number" min="0" />
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
            {{ $t(`tasks.modal.requirements.startTime`) }}
            <Input v-model="form.requirements.startTime" type="time" />
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.endDate`) }}
            <Input v-model="form.requirements.endDate" type="date" />
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.endTime`) }}
            <Input v-model="form.requirements.endTime" type="time" />
          </label>
        </div>

        <div class="grid">
          <label>
            {{ $t(`tasks.modal.requirements.members`) }}
            <Input v-model.number="form.requirements.membersCount" type="number" min="1" />
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.age`) }}
            <Input v-model.number="form.requirements.age" type="number" min="0" />
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.gender`) }}
            <Select v-model="form.requirements.gender">
              <option value="any">{{ $t(`tasks.edit.genderType.any`) }}</option>
              <option value="male">{{ $t(`tasks.edit.genderType.male`) }}</option>
              <option value="female">{{ $t(`tasks.edit.genderType.female`) }}</option>
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
import type { PublicTask } from '@/types/publicTask'

const props = defineProps<{
  task: PublicTask
}>()

const emit = defineEmits<{
  (e: 'save', payload: Partial<PublicTask>): void
  (e: 'cancel'): void
}>()

const form = reactive(JSON.parse(JSON.stringify(props.task)) as PublicTask)

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
