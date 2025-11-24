<template>
  <SettingsSection title="Уведомления">
    <label class="row">
      <span>Включить уведомления</span>
      <input type="checkbox" v-model="enabled" />
    </label>

    <label class="row">
      <span>Типы уведомлений</span>
      <select v-model="type">
        <option value="all">Все</option>
        <option value="tasks">Только задачи</option>
        <option value="friends">Только друзья</option>
      </select>
    </label>
  </SettingsSection>
</template>

<script setup>
import { ref } from 'vue'
import SettingsSection from './SettingsSection.vue'

const enabled = ref(true)
const type = ref('all')
</script>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
}
</style>
