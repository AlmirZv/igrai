<script setup lang="ts">
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
      <input v-model="model.title" placeholder="Название" />
    </div>

    <div class="field">
      <label>Описание:</label>
      <textarea v-model="model.description" placeholder="Опишите задачу..." />
    </div>

    <div class="field">
      <label>Начало:</label>
      <input type="date" v-model="model.startDate" />
    </div>

    <div class="field">
      <label>Конец:</label>
      <input type="date" v-model="model.endDate" />
    </div>

    <!-- Награда -->
    <fieldset class="reward">
      <legend>Награда</legend>
      <div class="field">
        <label>XP:</label>
        <span>{{ model.reward.xp }}</span>
      </div>
      <div class="field">
        <label>Предмет:</label>
        <!-- <button class="create-btn small" @click.prevent="addItem">+</button> -->
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
</style>
