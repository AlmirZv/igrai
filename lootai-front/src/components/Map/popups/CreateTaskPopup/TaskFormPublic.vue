<script setup lang="ts">
import { Input, Textarea, Select, Text, Button } from '@/designSystem/components'

const model = defineModel({
  type: Object,
  default: () => ({
    gender: 'any',
    membersCount: 1,
    age: 18,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    difficulty: '',
    rewardPoints: 1000,
    rewardItem: '',
  }),
})
</script>

<template>
  <div class="form-section">
    <div class="field">
      <label>Заголовок:</label>
      <Input v-model="model.title" placeholder="Название" />
    </div>

    <div class="field">
      <label>Описание:</label>
      <Textarea v-model="model.description" placeholder="Опишите задачу..." />
    </div>

    <div class="field">
      <label>Начало:</label>
      <Input type="date" v-model="model.startDate" />
    </div>

    <div class="field">
      <label>Конец:</label>
      <Input type="date" v-model="model.endDate" />
    </div>

    <!-- Награда -->
    <fieldset class="reward">
      <legend>Награда</legend>
      <div class="field">
        <label>XP:</label>
        <span>{{ model.reward.xp }}</span>
      </div>
      <!-- <div class="field">
        <label>Предмет:</label>
        <Button class="create-btn small" @click.prevent="addItem">+</Button>
      </div> -->
    </fieldset>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-xs);
}

.reward {
  margin-top: var(--space-md);
  background: var(--bg-surface);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}

.reward legend {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}
</style>
