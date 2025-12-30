<script setup lang="ts">
import { ref, computed } from 'vue'
import { Input, Textarea, Select, Text, Button } from '@/designSystem/components'

const model = defineModel({
  type: Object,
  default: () => ({
    title: '',
    description: '',
    type: 'event',
    status: 'active',
    requirements: {
      gender: 'any',
      minAge: 18,
      maxAge: 60,
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      membersCount: 1,
    },
    reward: {
      xp: 30,
      inventoryItem: '',
    },
  }),
})

function addItem() {
  console.log('user adding item')
}
</script>

<template>
  <div class="form">
    <div class="field">
      <label>{{ $t(`map.popup.headline`) }}:</label>
      <Input v-model="model.title" :placeholder="$t(`map.popup.placeholders.title`)" />
    </div>

    <div class="field">
      <label>{{ $t(`map.popup.description`) }}:</label>
      <Textarea
        v-model="model.description"
        :placeholder="$t(`map.popup.placeholders.describeTask`) + '...'"
      />
    </div>

    <!-- Пол -->
    <div class="field">
      <label>{{ $t(`map.popup.gender`) }}:</label>
      <Select v-model="model.requirements.gender">
        <option value="any">{{ $t(`map.popup.genderType.any`) }}</option>
        <option value="male">{{ $t(`map.popup.genderType.male`) }}</option>
        <option value="female">{{ $t(`map.popup.genderType.female`) }}</option>
      </Select>
    </div>

    <!-- Возраст -->
    <div class="field">
      <label>{{ $t(`map.popup.ageStart`) }}:</label>
      <Input type="number" v-model="model.requirements.minAge" min="0" />

      <label>{{ $t(`map.popup.ageEnd`) }}:</label>
      <Input type="number" v-model="model.requirements.maxAge" min="0" />
    </div>

    <div class="field">
      <label>{{ $t(`map.popup.start`) }}:</label>
      <div class="inline-inputs">
        <Input type="date" v-model="model.requirements.startDate" />
        <Input type="time" v-model="model.requirements.startTime" />
      </div>
    </div>

    <div class="field">
      <label>{{ $t(`map.popup.end`) }}:</label>
      <div class="inline-inputs">
        <Input type="date" v-model="model.requirements.endDate" />
        <Input type="time" v-model="model.requirements.endTime" />
      </div>
    </div>

    <!-- Награда -->
    <fieldset class="reward">
      <legend>{{ $t(`map.popup.reward`) }}</legend>
      <div class="field">
        <label>XP:</label>
        <span>{{ model.reward.xp }}</span>
      </div>
      <div class="field">
        <label>{{ $t(`map.popup.inventoryItem`) }}:</label>
        <Button class="create-btn small" @click.prevent="addItem">+</Button>
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 100%;
  overflow: auto;
  overflow-x: hidden;
}

.field {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-xs);
}

.inline-inputs {
  display: grid;
  gap: var(--space-sm);
  width: 100%;
  box-sizing: border-box;
}
.inline-inputs input {
  flex: 1;
  /* width: 94%; */
  margin: 0px;
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

.error {
  color: var(--state-error);
  font-size: var(--font-size-sm);
  text-align: center;
}

/* .create-btn {
    margin-top: 6px;
    padding: 8px;
    border: none;
    border-radius: 8px;
    background: #4caf50;
    color: white;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
  } */

.create-btn.small {
  width: auto;
  padding: var(--space-xs) var(--space-sm);
}
</style>
