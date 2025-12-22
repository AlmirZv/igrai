<template>
  <div class="settings-page">
    <Card>
      <MapSettings />
    </Card>

    <Card>
      <ProfileSettings />
    </Card>

    <Card>
      <AppSettings />
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProfileSettings from './ProfileSettings.vue'
import MapSettings from './MapSettings.vue'
import NotificationsSettings from './NotificationsSettings.vue'
import AppSettings from './AppSettings.vue'
import SeedDatabase from '../DevTools/SeedDatabase.vue'
import { Card } from '@/designSystem/components'

const isDevelopment = computed(() => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development'
})
</script>

<style scoped>
/* Общая страница */
.settings-page {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  overflow-y: auto;
  padding-bottom: 80px;
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
