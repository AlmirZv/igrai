<template>
  <div class="profile-stats">
    <div class="xp-block">
      <div class="label">Уровень {{ level }}</div>
      <div class="progress">
        <div class="bar" :style="{ width: xpPercent + '%' }"></div>
      </div>
      <div class="xp">{{ user.xp }} XP</div>
    </div>

    <div class="points">Очки: {{ user.points }}</div>

    <div class="tasks">
      <p>Общественные: {{ user.tasksCompleted.public }}</p>
      <p>Пользовательские: {{ user.tasksCompleted.user }}</p>
      <p>Квесты: {{ user.tasksCompleted.quest }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserProfile } from '../../types/profile'

const props = defineProps<{ user: UserProfile }>()

const level = computed(() => Math.floor(Math.sqrt(props.user.xp / 100)))
const xpPercent = computed(() => {
  const currentLevelXp = level.value ** 2 * 100
  const nextLevelXp = (level.value + 1) ** 2 * 100
  return ((props.user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
})
</script>

<style scoped>
.profile-stats {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 6px;
}
.label {
  font-weight: bold;
}
.progress {
  width: 100%;
  height: 10px;
  background: #1f2937;
  border-radius: 5px;
  margin: 4px 0;
  overflow: hidden;
}
.bar {
  height: 100%;
  background: #8000ff;
}
.xp {
  font-size: 13px;
  color: #9ca3af;
}
.points {
  margin: 8px 0;
  font-weight: bold;
}
.tasks p {
  margin: 2px 0;
  font-size: 14px;
}
</style>
