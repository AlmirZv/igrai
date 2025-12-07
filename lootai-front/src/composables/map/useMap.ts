import { ref, createApp } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { auth } from '@/config/firebase'
import { useMapCore } from './useMapCore'
import { useMapPopups } from './useMapPopups'
import { createUserMarker, createTaskMarker } from '@/components/Map/markers'
import CreateTaskPopup from '@/components/Map/popups/CreateTaskPopup/TaskForm.vue'
import taskPopup from '@/components/Map/popups/tpopups/taskPopup.vue'
import questPopup from '@/components/Map/popups/tpopups/questPopup.vue'
import eventPopup from '@/components/Map/popups/tpopups/eventPopup.vue'
import publicTaskPopup from '@/components/Map/popups/tpopups/publicTaskPopup.vue'

import UserPopup from '@/components/Map/popups/UserPopup.vue'
import { applyForTask, createTask } from '../useTasks'
import { createQuest, applyForQuest, updateQuestStep, getQuest } from '../useQuests'
import { createPublicTask } from '../usePublicTasks'
import type { Task } from '@/types/task'
import type { QuestTask, QuestParticipant, QuestStep } from '@/types/quest'
import type { EventTask } from '@/types/event'
import type { PublicTask } from '@/types/publicTask'
const { map, init, addMarker, removeMarker, center } = useMapCore()
const { open, close, move, hide, ignoreNextClick } = useMapPopups(map)

export function useMap() {
  const isCreatingTask = ref(false)
  const selectingStep = ref(false)
  const pendingQuestData = ref<any>(null)
  const mapInstance = ref<L.Map>()

  // 🗺️ Инициализация карты
  function initMap(container: HTMLElement, coords: [number, number], zoom = 13) {
    const m = init(container, coords, zoom)
    mapInstance.value = m

    m.on('click', (e: L.LeafletMouseEvent) => {
      if (ignoreNextClick.value) {
        ignoreNextClick.value = false
        return
      }

      if (selectingStep.value) {
        const { lat, lng } = e.latlng
        pendingQuestData.value?.onLocationSelected(lat, lng)
        // mapInstance.value?.closePopup()
        move(lat, lng)

        selectingStep.value = false
        return
      }

      if (isCreatingTask.value) {
        const { lat, lng } = e.latlng
        open(
          CreateTaskPopup,
          {
            lat,
            lng,
            onCreate: async (task: Task | QuestTask | PublicTask) => {
              console.log(task)
              isCreatingTask.value = false
              if (task.type == 'quest') await createQuest(task)
              if (task.type == 'user') await createTask(task)
              if (task.type == 'public') await createPublicTask(task)
              close(true)
              addTaskMarker(task)
            },
            onSelectStepLocation: (data: any) => {
              selectingStep.value = true
              pendingQuestData.value = data

              hide()
              // close(false)
            },
          },
          lat,
          lng,
          {
            onRemove: (wasProgrammatic) => {
              // если пользователь закрыл попап вручную (крестик) — wasProgrammatic === false
              if (!wasProgrammatic) {
                // отбой режима выбора если он был включен
                selectingStep.value = false
                pendingQuestData.value = null
                isCreatingTask.value = false
              }
              // если wasProgrammatic === true — это hide(), ничего не делаем
            },
          },
        )
      }
    })

    return m
  }

  // 👤 Добавление маркера пользователя
  function addUserMarker(id: string, coords: [number, number], user: any, color: string) {
    const icon = createUserMarker(color)
    const marker = addMarker(id, coords, icon)
    if (!marker) return
    if (!mapInstance.value) return

    marker.bindPopup(L.popup())

    marker.on('popupopen', () => {
      const el = document.createElement('div')
      const app = createApp(UserPopup, { user })
      app.mount(el)
      marker.getPopup()?.setContent(el)

      // marker.once('popupclose', () => app.unmount())
      marker.on('popupclose', () => {
        app.unmount()
        // Удаляем обработчик после выполнения, чтобы избежать дублирования
        marker.off('popupclose')
      })
    })
  }

  // 🧭 Добавление маркера задачи
  function addTaskMarker(task: Task | QuestTask | EventTask | PublicTask) {
    const color =
      task.type === 'public'
        ? '#00ff25'
        : task.type === 'quest'
          ? '#ffffff'
          : task.type === 'event'
            ? '#fcff00b5'
            : '#0000ffb5'
    const icon =
      task.type === 'public'
        ? '🏢'
        : task.type === 'quest'
          ? '🎯'
          : task.type === 'event'
            ? '🎉'
            : '🤝'

    const popup =
      task.type === 'public'
        ? publicTaskPopup
        : task.type === 'quest'
          ? questPopup
          : task.type === 'event'
            ? eventPopup
            : taskPopup
    const marker = addMarker(
      task.id,
      [task.location?.lat || 0, task.location?.lng || 0],
      createTaskMarker(color, icon),
    )
    if (!marker) return

    marker.bindPopup(L.popup())
    marker.on('popupopen', () => {
      const el = document.createElement('div')
      const app = createApp(popup, {
        type: task.type,
        data: task,
        onAction: async (payload: { type: string; id: string }) => {
          if (task.type == 'user') await applyForTask(payload.id, payload.type)
          return true
        },
      })
      app.mount(el)
      marker.getPopup()?.setContent(el)
      // marker.once('popupclose', () => app.unmount())
      marker.on('popupclose', () => {
        app.unmount()
        // Удаляем обработчик после выполнения, чтобы избежать дублирования
        marker.off('popupclose')
      })
    })
  }

  // 🧭 Добавление маркера квеста
  function addQuestMarker(quest: QuestTask) {
    const color = '#ffffff'
    const icon = '🎯'

    const popup = questPopup

    let marker: any = ''
    if (quest.participants.length == 0) {
      marker = addMarker(
        quest.id,
        [quest.steps[0].location?.lat || 0, quest.steps[0].location?.lng || 0],
        createTaskMarker(color, icon),
      )
    } else {
      quest.participants.forEach((participant) => {
        if (participant.id == auth.currentUser?.uid) {
          const currentStep = quest.steps.find(
            (step) => step.id == participant.progress.currentStepId,
          )

          marker = addMarker(
            quest.id,
            [currentStep?.location?.lat || 0, currentStep?.location?.lng || 0],
            createTaskMarker(color, icon),
          )
        } else {
          console.log(quest)

          marker = addMarker(
            quest.id,
            [quest.steps[0].location?.lat || 0, quest.steps[0].location?.lng || 0],
            createTaskMarker(color, icon),
          )
        }
      })
    }

    if (!marker) return

    marker.bindPopup(L.popup())
    marker.on('popupopen', () => {
      const el = document.createElement('div')
      const app = createApp(popup, {
        type: quest.type,
        data: quest,
        onAction: async (payload: { type: string; id: string }) => {
          await applyForQuest(payload.id)
          return true
        },
        onUpdateStep: async (payload: { id: string; step: QuestStep }) => {
          console.log(payload)
          await updateQuestStep(payload.id, payload.step)

          // Пересоздаём маркер и попап с обновлёнными данными квеста
          const updatedQuest = await getQuest(payload.id)
          if (!updatedQuest) return true

          // Удаляем старый маркер
          removeMarker(payload.id)

          // Создаём новый маркер с обновлённым квестом
          addQuestMarker(updatedQuest)
          // to do add finishquest marker if its last step of the quest

          return true
        },
      })
      app.mount(el)
      marker.getPopup()?.setContent(el)
      // marker.once('popupclose', () => app.unmount())
      marker.on('popupclose', () => {
        app.unmount()
        // Удаляем обработчик после выполнения, чтобы избежать дублирования
        marker.off('popupclose')
      })
    })
  }

  // 🧩 Тоггл режима создания задач
  function toggleCreateMode() {
    isCreatingTask.value = !isCreatingTask.value
    return isCreatingTask.value
  }

  return {
    initMap,
    center,
    addUserMarker,
    addTaskMarker,
    addQuestMarker,
    toggleCreateMode,
    isCreatingTask,
    mapInstance,
  }
}
