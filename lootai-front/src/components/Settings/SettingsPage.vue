<template>
  <div class="settings-page">
    <MapSettings />
    <ProfileSettings />
    <!-- <NotificationsSettings /> -->
    <AppSettings />

    <!-- Инструменты разработчика (только в режиме разработки) -->
    <!-- <div v-if="isDevelopment" class="dev-section">
      <SeedDatabase />
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProfileSettings from './ProfileSettings.vue'
import MapSettings from './MapSettings.vue'
import NotificationsSettings from './NotificationsSettings.vue'
import AppSettings from './AppSettings.vue'
import SeedDatabase from '../DevTools/SeedDatabase.vue'

// Показываем инструменты разработчика только в режиме разработки
const isDevelopment = computed(() => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development'
})
</script>

<style scoped>
.settings-page {
  font-family: Arial, sans-serif;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: white;
  margin-top: 20px;
  overflow: scroll;
}

.dev-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid rgba(37, 185, 160, 0.3);
}

.dev-section::before {
  content: '🛠️ ИНСТРУМЕНТЫ РАЗРАБОТЧИКА';
  display: block;
  color: #25b9a0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 16px;
  text-align: center;
}
</style>
