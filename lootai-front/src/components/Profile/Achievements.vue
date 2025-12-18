<template>
  <Card>
    <Stack gap="md">
      <Text variant="h2">Достижения</Text>

      <Stack gap="sm">
        <Text v-for="ach in visibleAchievements" :key="ach.id" variant="caption">
          {{ ach.title }}
        </Text>
      </Stack>

      <Button
        v-if="achievements.length > DEFAULT_VISIBLE"
        variant="ghost"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Свернуть' : 'Показать все' }}
      </Button>
    </Stack>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserProfile } from '../../types/profile'
import { Card, Stack, Text, Button } from '@/designSystem/components'
defineProps<{ user: UserProfile }>()

type Achievement = {
  id: string
  title: string
}

const DEFAULT_VISIBLE = 3

const achievements = [
  { id: '1', title: '100 user tasks done!' },
  { id: '2', title: '100 public tasks done!' },
  { id: '3', title: '100 quests done!' },
  { id: '4', title: '500 XP earned!' },
  { id: '5', title: 'First quest completed!' },
]

const expanded = ref(false)

const visibleAchievements = computed(() =>
  expanded.value ? achievements : achievements.slice(0, DEFAULT_VISIBLE),
)
</script>
