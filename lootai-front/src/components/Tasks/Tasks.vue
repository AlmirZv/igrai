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
        ^title="$t('tasks.titles.history')"
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
        :history="(activeTab as 'taken') == 'taken' ? tasks.history.taken : tasks.history.created"
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
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import { LoadingSpinner, Button, ErrorState } from '@/designSystem/components'
import type { Task, TaskFilters, TaskParticipant } from '../../types/task'
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
} from '../../composables/useTasks'

const activeTab = ref<'taken' | 'created'>('taken')
const mode = ref<'active' | 'history'>('active')

const selectedTask = ref<Task | null>(null)
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
    public: [] as Task[],
    quest: [] as Task[],
    event: [] as Task[],
  },
  created: {
    user: [] as Task[],
    public: [] as Task[],
    quest: [] as Task[],
    event: [] as Task[],
  },
  history: {
    taken: {
      user: [] as Task[],
      public: [] as Task[],
      quest: [] as Task[],
      event: [] as Task[],
    },
    created: {
      user: [] as Task[],
      public: [] as Task[],
      quest: [] as Task[],
      event: [] as Task[],
    },
  },
})

const loadTasks = async () => {
  try {
    isLoading.value = true
    error.value = ''

    const uid = auth.currentUser?.uid
    if (!uid) {
      return
    }

    // Load tasks where user is participant
    await loadingUserTasks(uid)

    // Load tasks created by user
    await loadCreatedTasks(uid)

    // Load task history
    await loadTaskHistory(uid)
  } catch (err) {
    console.error('Error loading tasks:', err)
    error.value = 'Не удалось загрузить задачи'
  } finally {
    isLoading.value = false
  }
}

const loadingUserTasks = async (uid: string) => {
  try {
    loadingStates.user = true
    const userTasks: Task[] = await loadUserTasks(uid)

    // Сортируем и фильтруем локально
    const sortedTasks = userTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    const activeTasks = sortedTasks
      .filter((task) => task.status === 'active')
      .filter((task) => task.status != 'completed')

    // Separate by type
    tasks.taken.user = activeTasks.filter((task) => task.type === 'user')
    tasks.taken.public = activeTasks.filter((task) => task.type === 'public')
    tasks.taken.quest = activeTasks.filter((task) => task.type === 'quest')
    tasks.taken.event = activeTasks.filter((task) => task.type === 'event')
  } catch (err) {
    console.error('Error loading user tasks:', err)
  } finally {
    loadingStates.user = false
  }
}

const loadCreatedTasks = async (uid: string) => {
  try {
    const createdTasks: Task[] = await loadAuthorTasks(uid)

    // Сортируем и разделяем по типам локально
    const sortedTasks = createdTasks
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .filter((task) => task.status != 'completed')

    // Separate by type
    tasks.created.user = sortedTasks.filter((task) => task.type === 'user')
    tasks.created.public = sortedTasks.filter((task) => task.type === 'public')
    tasks.created.quest = sortedTasks.filter((task) => task.type === 'quest')
    tasks.created.event = sortedTasks.filter((task) => task.type === 'event')
  } catch (err) {
    console.error('Error loading created tasks:', err)
  }
}

const loadTaskHistory = async (uid: string) => {
  try {
    const allUserTasks: Task[] = await loadUserTasks(uid)

    // Фильтруем и сортируем локально
    const historyTasks = allUserTasks
      .filter((task) => task.status === 'completed' || task.status === 'cancelled')
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

    tasks.history.taken.user = historyTasks.filter((task) => task.type === 'user')
    tasks.history.taken.public = historyTasks.filter((task) => task.type === 'public')
    tasks.history.taken.quest = historyTasks.filter((task) => task.type === 'quest')
    tasks.history.taken.event = historyTasks.filter((task) => task.type === 'event')

    const allCreatedTasks: Task[] = await loadAuthorTasks(uid)

    // Фильтруем и сортируем локально
    const historyCreatedTasks = allCreatedTasks
      .filter((task) => task.status === 'completed' || task.status === 'cancelled')
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

    tasks.history.created.user = historyCreatedTasks.filter((task) => task.type === 'user')
    tasks.history.created.public = historyCreatedTasks.filter((task) => task.type === 'public')
    tasks.history.created.quest = historyCreatedTasks.filter((task) => task.type === 'quest')
    tasks.history.created.event = historyCreatedTasks.filter((task) => task.type === 'event')
  } catch (err) {
    console.error('Error loading task history:', err)
  }
}

const openTask = (task: Task) => {
  selectedTask.value = task
}

const cancelTask = async () => {
  if (!selectedTask.value) return

  try {
    const taskRef = doc(db, 'tasks', selectedTask.value.id)
    await updateDoc(taskRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now(),
    })

    // Update local state
    selectedTask.value.status = 'cancelled'

    alert('Задача отменена!')
    selectedTask.value = null

    // Reload tasks
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

  // 6️⃣ Можно вызвать API для сохранения на сервере
  await completeTask(selectedTask.value.id)

  const tab = activeTab.value // 'taken' или 'created'
  const type = selectedTask.value.type // 'user', 'public', 'quest', 'event'

  // 1️⃣ Найти индекс задачи в массиве текущих активных задач
  const currentArray = tasks[tab][type]
  const index = currentArray.findIndex((t) => t.id === selectedTask.value?.id)
  if (index === -1) return // не нашли — выходим

  // 2️⃣ Удалить задачу из текущего массива и получить её
  const [task] = currentArray.splice(index, 1)

  // 3️⃣ Добавить задачу в историю
  tasks.history[tab][type].push(task)

  // 4️⃣ Обновить статус (по желанию)
  task.status = 'completed'

  // 5️⃣ Очистить selectedTask
  selectedTask.value = null
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
