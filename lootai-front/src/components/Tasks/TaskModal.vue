<template>
  <component
    v-if="modalComponent"
    :is="modalComponent"
    :task="task"
    :aTab="aTab"
    v-on="listeners"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task as UserTask, TaskParticipant as UserTaskParticipant } from '@/types/task'
import type { QuestTask } from '@/types/quest'
import type { EventTask } from '@/types/event'
import type { PublicTask } from '@/types/publicTask'
import UserTaskDetails from './modals/UserTaskDetails.vue'
import QuestTaskDetails from './modals/QuestTaskDetails.vue'
import EventTaskDetails from './modals/EventTaskDetails.vue'
import PublicTaskDetails from './modals/PublicTaskDetails.vue'

type SupportedTask = (UserTask | QuestTask | EventTask | PublicTask) & { type: string }

const props = defineProps<{
  task: SupportedTask
  aTab: 'taken' | 'created'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'cancel'): void
  (e: 'complete'): void
  (e: 'accept', p: UserTaskParticipant): void
  (e: 'decline', p: UserTaskParticipant): void
  (e: 'edit'): void
}>()

const modalComponent = computed(() => {
  switch (props.task?.type) {
    case 'quest':
      return QuestTaskDetails
    case 'event':
      return EventTaskDetails
    case 'public':
      return PublicTaskDetails
    case 'user':
    default:
      return UserTaskDetails
  }
})

const listeners = computed(() => {
  const base = {
    close: () => emit('close'),
    complete: () => emit('complete'),
    edit: () => emit('edit'),
  }

  if (props.task?.type === 'user') {
    return {
      ...base,
      cancel: () => emit('cancel'),
      accept: (p: UserTaskParticipant) => emit('accept', p),
      decline: (p: UserTaskParticipant) => emit('decline', p),
    }
  }

  if (props.task?.type === 'public' || props.task?.type === 'event') {
    return {
      ...base,
      cancel: () => emit('cancel'),
    }
  }

  return base
})
</script>
