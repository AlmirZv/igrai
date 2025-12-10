<template>
  <div class="settings-page">
    <div class="settings-section">
      <MapSettings />
    </div>

    <div class="settings-section">
      <ProfileSettings />
    </div>

    <div class="settings-section">
      <AppSettings />
    </div>

    <!-- DevTools (появляется только в dev-режиме) -->
    <!-- <div v-if="isDevelopment" class="settings-section dev-section">
      <SeedDatabase />
      <NotificationsSettings />
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

const isDevelopment = computed(() => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development'
})
</script>

<style scoped>
/* Общая страница */
.settings-page {
  font-family: 'Segoe UI', sans-serif;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow-y: auto;
  background: #121417;
  min-height: 100vh;
  color: #f1f1f1;
}

/* Карточка секции */
.settings-section {
  background: #1b1e24;
  padding: 18px;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* DevTools */
.dev-section {
  border: 1px solid rgba(61, 126, 255, 0.35);
  padding-top: 24px;
  margin-top: 10px;
}

.dev-section::before {
  content: '🛠️ ИНСТРУМЕНТЫ РАЗРАБОТЧИКА';
  display: block;
  color: #3d7eff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 12px;
  text-align: center;
}
</style>
