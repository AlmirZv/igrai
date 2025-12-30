<template>
  <Card>
    <Stack gap="md">
      <div class="xp-block">
        <div class="xp-header">
          <Text variant="caption" color="secondary"> {{ $t(`profile.level`) }} {{ level }} </Text>

          <Text variant="caption" color="muted"> {{ user.xp }} XP </Text>
        </div>

        <div class="progress">
          <div class="bar" :style="{ width: xpPercent + '%' }" />
        </div>
      </div>

      <div class="stats-grid">
        <Stat :label="$t(`profile.stats.points`)" :value="user.points" />
        <Stat :label="$t(`profile.stats.public`)" :value="user.tasksCompleted.public" />
        <Stat :label="$t(`profile.stats.user`)" :value="user.tasksCompleted.user" />
        <Stat :label="$t(`profile.stats.quests`)" :value="user.tasksCompleted.quest" />
      </div>
    </Stack>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, Stack, Stat, Text } from '@/designSystem/components'
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
.progress {
  height: 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-overlay);
  overflow: hidden;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  transition: width var(--motion-duration-normal) ease;
}

.xp-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.xp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}
</style>
