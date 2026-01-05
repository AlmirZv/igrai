<template>
  <div class="tasks-page">
    <LoadingSpinner v-if="isLoading">{{ $t(`tasks.loadingTasks`) }}...</LoadingSpinner>

    <ErrorState v-else-if="error">
      <p>{{ $t(`tasks.loadingError`) }}: {{ error }}</p>
      <Button @click="loadTasks">{{ $t(`tasks.buttons.reload`) }}</Button>
    </ErrorState>

    <div v-else>
      <TaskTabs v-model="activeTab" />

      <div v-if="activeTab === 'taken' && mode === 'active'" class="task-groups">
        <TaskGroup
          :title="$t('tasks.titles.tasks')"
          :tasks="tasks.taken.user"
          :loading="loadingStates.user"
          @open="openTask"
        />
        <TaskGroup
          :title="$t('tasks.titles.publicTasks')"
          :tasks="tasks.taken.public"
          :loading="loadingStates.public"
          @open="openTask"
        />
        <TaskGroup
          :title="$t('tasks.titles.quests')"
          :tasks="tasks.taken.quest"
          :loading="loadingStates.quest"
          @open="openTask"
        />
        <TaskGroup
          :title="$t('tasks.titles.events')"
          :tasks="tasks.taken.event"
          :loading="loadingStates.event"
          @open="openTask"
        />
      </div>
      <TaskHistory
        v-else-if="activeTab === 'taken' && mode === 'history'"
        :title="$t('tasks.titles.history')"
        :history="tasks.history.taken"
        @open="openTask"
      />

      <div v-else-if="activeTab === 'created' && mode === 'active'" class="task-groups">
        <TaskGroup
          :title="$t('tasks.titles.tasks')"
          :tasks="tasks.created.user"
          :loading="loadingStates.user"
          @open="openTask"
        />
        <TaskGroup
          :title="$t('tasks.titles.publicTasks')"
          :tasks="tasks.created.public"
          :loading="loadingStates.public"
          @open="openTask"
        />
        <TaskGroup
          :title="$t('tasks.titles.quests')"
          :tasks="tasks.created.quest"
          :loading="loadingStates.quest"
          @open="openTask"
        />
        <TaskGroup
          :title="$t('tasks.titles.events')"
          :tasks="tasks.created.event"
          :loading="loadingStates.event"
          @open="openTask"
        />
      </div>
      <TaskHistory
        v-else-if="activeTab === 'created' && mode === 'history'"
        :title="$t('tasks.titles.history')"
        :history="tasks.history.created"
        @open="openTask"
      />

      <TaskModal
        v-if="selectedTask"
        :task="selectedTask"
        :aTab="activeTab"
        @close="selectedTask = null"
        @cancel="cancelTask"
        @accept="accept"
        @decline="decline"
        @complete="completeCurrentTask"
        @edit="startEditTask"
      />

      <component
        v-if="editMode && editingTask"
        :is="editorComponent"
        :task="editingTask as any"
        @save="saveEditedTask"
        @cancel="cancelEdit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { auth } from '../../config/firebase'
import { LoadingSpinner, Button, ErrorState } from '@/designSystem/components'
import type { Task, TaskParticipant } from '../../types/task'
import type { QuestTask } from '@/types/quest'
import type { EventTask } from '@/types/event'
import type { PublicTask } from '@/types/publicTask'
import TaskTabs from './TaskTabs.vue'
import TaskGroup from './TaskGroup.vue'
import TaskHistory from './TaskHistory.vue'
import TaskModal from './TaskModal.vue'
import {
  loadUserTasks,
  loadAuthorTasks,
  acceptParticipantForTask,
  declineParticipantForTask,
  completeTask,
  updateUserTask,
} from '../../composables/useTasks'
import {
  loadUserQuests as loadUserQuestTasks,
  loadAuthorQuests as loadAuthorQuestTasks,
  completeQuestTask,
  updateQuestTask,
} from '../../composables/useQuests'
import {
  loadUserQuests as loadUserEventTasks,
  loadAuthorQuests as loadAuthorEventTasks,
  completeEventTask,
  updateEventTask,
} from '../../composables/useEvents'
import {
  loadUserQuests as loadUserPublicTasks,
  loadAuthorQuests as loadAuthorPublicTasks,
  completePublicTask,
  updatePublicTask,
} from '../../composables/usePublicTasks'
import UserTaskEditor from './editors/UserTaskEditor.vue'
import QuestTaskEditor from './editors/QuestTaskEditor.vue'
import EventTaskEditor from './editors/EventTaskEditor.vue'
import PublicTaskEditor from './editors/PublicTaskEditor.vue'

const activeTab = ref<'taken' | 'created'>('taken')
const mode = ref<'active' | 'history'>('active')

type AnyTask = Task | QuestTask | EventTask | PublicTask

const selectedTask = ref<AnyTask | null>(null)
const editingTask = ref<AnyTask | null>(null)
const editMode = ref(false)
const isLoading = ref(true)
const error = ref('')

const loadingStates = reactive({
  user: false,
  public: false,
  quest: false,
  event: false,
})

const tasks = reactive({
  taken: {
    user: [] as Task[],
    public: [] as PublicTask[],
    quest: [] as QuestTask[],
    event: [] as EventTask[],
  },
  created: {
    user: [] as Task[],
    public: [] as PublicTask[],
    quest: [] as QuestTask[],
    event: [] as EventTask[],
  },
  history: {
    taken: {
      user: [] as Task[],
      public: [] as PublicTask[],
      quest: [] as QuestTask[],
      event: [] as EventTask[],
    },
    created: {
      user: [] as Task[],
      public: [] as PublicTask[],
      quest: [] as QuestTask[],
      event: [] as EventTask[],
    },
  },
})

const splitActiveHistory = <T extends { status: string; createdAt?: Date; updatedAt?: Date }>(
  items: T[],
) => {
  const sorted = items.sort(
    (a, b) =>
      (b.updatedAt || b.createdAt || new Date()).getTime() -
      (a.updatedAt || a.createdAt || new Date()).getTime(),
  )

  return {
    active: sorted.filter((task) => task.status === 'active'),
    history: sorted.filter((task) => task.status === 'completed' || task.status === 'cancelled'),
  }
}

const loadTasks = async () => {
  try {
    isLoading.value = true
    error.value = ''

    const uid = auth.currentUser?.uid
    if (!uid) return

    await Promise.all([
      loadTakenUserTasks(uid),
      loadCreatedUserTasks(uid),
      loadTakenPublicTasksFn(uid),
      loadCreatedPublicTasksFn(uid),
      loadTakenQuestTasksFn(uid),
      loadCreatedQuestTasksFn(uid),
      loadTakenEventTasksFn(uid),
      loadCreatedEventTasksFn(uid),
    ])
  } catch (err) {
    console.error('Error loading tasks:', err)
    error.value = 'Не удалось загрузить задачи'
  } finally {
    isLoading.value = false
  }
}

const loadTakenUserTasks = async (uid: string) => {
  try {
    loadingStates.user = true
    const list = await loadUserTasks(uid)
    const { active, history } = splitActiveHistory(list)
    tasks.taken.user = active
    tasks.history.taken.user = history
  } catch (err) {
    console.error('Error loading user tasks:', err)
  } finally {
    loadingStates.user = false
  }
}

const loadCreatedUserTasks = async (uid: string) => {
  try {
    const list = await loadAuthorTasks(uid)
    const { active, history } = splitActiveHistory(list)
    tasks.created.user = active
    tasks.history.created.user = history
  } catch (err) {
    console.error('Error loading created user tasks:', err)
  }
}

const loadTakenPublicTasksFn = async (uid: string) => {
  try {
    loadingStates.public = true
    const list = await loadUserPublicTasks(uid)
    const { active, history } = splitActiveHistory(list)
    tasks.taken.public = active as PublicTask[]
    tasks.history.taken.public = history as PublicTask[]
  } catch (err) {
    console.error('Error loading public tasks:', err)
  } finally {
    loadingStates.public = false
  }
}

const loadCreatedPublicTasksFn = async (uid: string) => {
  try {
    const list = await loadAuthorPublicTasks(uid)
    const { active, history } = splitActiveHistory(list)
    tasks.created.public = active as PublicTask[]
    tasks.history.created.public = history as PublicTask[]
  } catch (err) {
    console.error('Error loading created public tasks:', err)
  }
}

const loadTakenQuestTasksFn = async (uid: string) => {
  try {
    loadingStates.quest = true
    const list = await loadUserQuestTasks(uid)
    const { active, history } = splitActiveHistory(list)
    tasks.taken.quest = active as QuestTask[]
    tasks.history.taken.quest = history as QuestTask[]
  } catch (err) {
    console.error('Error loading quests:', err)
  } finally {
    loadingStates.quest = false
  }
}

const loadCreatedQuestTasksFn = async (uid: string) => {
  try {
    const list = await loadAuthorQuestTasks(uid)
    const { active, history } = splitActiveHistory(list)
    tasks.created.quest = active as QuestTask[]
    tasks.history.created.quest = history as QuestTask[]
  } catch (err) {
    console.error('Error loading created quests:', err)
  }
}

const loadTakenEventTasksFn = async (uid: string) => {
  try {
    loadingStates.event = true
    const list = await loadUserEventTasks(uid)
    const { active, history } = splitActiveHistory(list)
    tasks.taken.event = active as EventTask[]
    tasks.history.taken.event = history as EventTask[]
  } catch (err) {
    console.error('Error loading events:', err)
  } finally {
    loadingStates.event = false
  }
}

const loadCreatedEventTasksFn = async (uid: string) => {
  try {
    const list = await loadAuthorEventTasks(uid)
    const { active, history } = splitActiveHistory(list)
    tasks.created.event = active as EventTask[]
    tasks.history.created.event = history as EventTask[]
  } catch (err) {
    console.error('Error loading created events:', err)
  }
}

const openTask = (task: AnyTask) => {
  selectedTask.value = task
}

const startEditTask = () => {
  if (!selectedTask.value || activeTab.value !== 'created') return
  editingTask.value = selectedTask.value
  editMode.value = true
}

const editorComponent = computed(() => {
  if (!editingTask.value) return null

  switch (editingTask.value.type) {
    case 'quest':
      return QuestTaskEditor
    case 'event':
      return EventTaskEditor
    case 'public':
      return PublicTaskEditor
    default:
      return UserTaskEditor
  }
})

const cancelEdit = () => {
  editMode.value = false
  editingTask.value = null
}

const saveEditedTask = async (payload: AnyTask) => {
  if (!editingTask.value) return

  try {
    switch (editingTask.value.type) {
      case 'quest':
        await updateQuestTask(editingTask.value.id, payload as Partial<QuestTask>)
        break
      case 'event':
        await updateEventTask(editingTask.value.id, payload as Partial<EventTask>)
        break
      case 'public':
        await updatePublicTask(editingTask.value.id, payload as Partial<PublicTask>)
        break
      default:
        await updateUserTask(editingTask.value.id, payload as Partial<Task>)
        break
    }

    editMode.value = false
    editingTask.value = null
    await loadTasks()
  } catch (err) {
    console.error('Error updating task', err)
    alert('Ошибка при сохранении изменений')
  }
}

const cancelTask = async () => {
  if (!selectedTask.value) return

  try {
    const type = selectedTask.value.type
    switch (type) {
      case 'quest':
        await updateQuestTask(selectedTask.value.id, { status: 'cancelled' } as Partial<QuestTask>)
        break
      case 'event':
        await updateEventTask(selectedTask.value.id, { status: 'cancelled' } as Partial<EventTask>)
        break
      case 'public':
        await updatePublicTask(selectedTask.value.id, {
          status: 'cancelled',
        } as Partial<PublicTask>)
        break
      case 'user':
      default:
        await updateUserTask(selectedTask.value.id, { status: 'cancelled' } as Partial<Task>)
    }

    selectedTask.value = null
    await loadTasks()
  } catch (err) {
    console.error('Error cancelling task:', err)
    alert('Ошибка при отмене задачи')
  }
}

const accept = async (participant: TaskParticipant) => {
  if (!selectedTask.value) return

  await acceptParticipantForTask(selectedTask.value.id, participant)
}

const decline = async (participant: TaskParticipant) => {
  if (!selectedTask.value) return

  await declineParticipantForTask(selectedTask.value.id, participant)
}

const completeCurrentTask = async () => {
  if (!selectedTask.value) return

  const type = selectedTask.value.type

  try {
    if (type === 'quest') {
      await completeQuestTask(selectedTask.value.id)
    } else if (type === 'event') {
      await completeEventTask(selectedTask.value.id)
    } else if (type === 'public') {
      await completePublicTask(selectedTask.value.id)
    } else {
      await completeTask(selectedTask.value.id)
    }

    const tab = activeTab.value
    const currentArray = tasks[tab][type] as AnyTask[]
    const index = currentArray.findIndex((t: AnyTask) => t.id === selectedTask.value?.id)
    if (index !== -1) {
      const [task] = currentArray.splice(index, 1)
      task.status = 'completed'
      ;(tasks.history[tab][type] as AnyTask[]).push(task)
    }

    selectedTask.value = null
  } catch (err) {
    console.error('Error completing task:', err)
    alert('Ошибка при завершении задачи')
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.tasks-page {
  overflow: auto;
  margin-bottom: 80px;
}

.task-groups {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: 0 var(--space-md);
}
</style>
