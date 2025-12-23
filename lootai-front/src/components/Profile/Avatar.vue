<template>
  <Card>
    <Stack gap="md">
      <!-- Header -->
      <div class="profile-header">
        <div class="avatar" :style="{ backgroundImage: `url(${avatarUrl})` }" />

        <div class="identity">
          <Text variant="h3">
            {{ user.name }}
            <span class="level-badge">Lv {{ level }}</span>
          </Text>
          <Text v-if="showPersonalInfo" variant="caption" color="secondary">
            {{ user.email }}
          </Text>
        </div>
      </div>

      <!-- Meta -->
      <div class="profile-meta">
        <Text variant="caption" color="secondary"> {{ user.age }} лет </Text>
        <span class="dot" />
        <Text variant="caption" color="secondary">
          {{ user.gender }}
        </Text>
      </div>
    </Stack>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, Stack, FormField } from '@/designSystem/components'
import type { UserProfile } from '../../types/profile'
const props = defineProps<{
  user: UserProfile
  showPersonalInfo?: Boolean
}>()

const avatarUrl = computed(() =>
  props.user.avatar === 'default-purple'
    ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Roundel-azure.svg/1024px-Roundel-azure.svg.png'
    : props.user.avatar,
)

const level = computed(() => Math.floor(Math.sqrt(props.user.xp / 100)))
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.identity {
  display: flex;
  flex-direction: column;
  gap: var(--space-xxs);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.level-badge {
  margin-left: var(--space-xs);
  padding: 2px 6px;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
  background: var(--accent-primary);
  color: var(--text-onAccent);
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--border-subtle);
}
</style>
