<template>
  <div class="tasks-page">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка задач...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>Ошибка загрузки: {{ error }}</p>
      <button @click="loadTasks" class="retry-btn">Повторить</button>
    </div>

    <div v-else>
      <TaskTabs v-model="activeTab" />

      <div v-if="activeTab === 'taken'" class="task-groups">
        <TaskGroup
          title="Задачи"
          :tasks="tasks.taken.user"
          :loading="loadingStates.user"
          @open="openTask"
        />
        <TaskGroup
          title="Общественные"
          :tasks="tasks.taken.public"
          :loading="loadingStates.public"
          @open="openTask"
        />
        <TaskGroup
          title="Квесты"
          :tasks="tasks.taken.quest"
          :loading="loadingStates.quest"
          @open="openTask"
        />
        <TaskGroup
          title="События"
          :tasks="tasks.taken.event"
          :loading="loadingStates.event"
          @open="openTask"
        />
        <TaskHistory title="История" :history="tasks.history.taken" @open="openTask" />
      </div>

      <div v-else class="task-groups">
        <TaskGroup
          title="Задачи"
          :tasks="tasks.created.user"
          :loading="loadingStates.user"
          @open="openTask"
        />
        <TaskGroup
          title="Общественные"
          :tasks="tasks.created.public"
          :loading="loadingStates.public"
          @open="openTask"
        />
        <TaskGroup
          title="Квесты"
          :tasks="tasks.created.quest"
          :loading="loadingStates.quest"
          @open="openTask"
        />
        <TaskGroup
          title="События"
          :tasks="tasks.created.event"
          :loading="loadingStates.event"
          @open="openTask"
        />
        <TaskHistory
          title="История"
          :history="(activeTab as 'taken') == 'taken' ? tasks.history.taken : tasks.history.created"
          @open="openTask"
        />
      </div>

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
  margin-top: 30px;
  font-family: cursive;
  color: #fff;
  min-height: 400px;

  overflow: auto;
  margin-bottom: 50px;
}

.task-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  color: black;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #374151;
  border-top: 3px solid #25b9a0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  font-size: 16px;
  margin: 0;
  color: #e5e7eb;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #ef4444;
  text-align: center;
}

.error-state p {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #ef4444;
}

.retry-btn {
  background: linear-gradient(135deg, #25b9a0 0%, #1e9783 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(37, 185, 160, 0.3);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 185, 160, 0.4);
}

@media (max-width: 480px) {
  .tasks-page {
    margin-top: 30px;
  }

  .task-groups {
    padding: 8px;
    gap: 8px;
  }

  .loading-state,
  .error-state {
    padding: 40px 16px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border-width: 2px;
  }

  .loading-state p,
  .error-state p {
    font-size: 14px;
  }
}
</style>
