// src/composables/useMap.ts
import { ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createUserMarker, createTaskMarker } from '@/components/Map/markers'
import type { Task } from '@/types/task'
import { createTask, applyForTask } from './useTasks'
import { createApp } from 'vue'
import GenericTask from '@/components/Map/popups/GenericTask.vue'
import UserPopup from '@/components/Map/popups/UserPopup.vue'
import CreateTaskPopup from '@/components/Map/popups/CreateTaskPopup/TaskForm.vue'
// import CreateTaskPopup from '@/components/Map/popups/CreateTaskPopup.vue'

const pendingQuestData = ref<any>(null) // сохраняем данные текущего попапа
const popupInstance = ref<L.Popup>()
const popupApp = ref<ReturnType<typeof createApp> | null>(null)
const popupContainer = ref<HTMLElement | null>(null)
const selectingStepLocation = ref(false)

export function useMap() {
  const ignoreNextClick = ref(false)
  const mapInstance = ref<L.Map>()
  const markers = ref<Map<string, L.Marker>>(new Map())

  const initMap = (container: HTMLElement, coords: [number, number], zoom = 13) => {
    const map = L.map(container).setView(coords, zoom)
    mapInstance.value = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'lootai',
      maxZoom: 19,
    }).addTo(map)

    // Добавление по клику
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (!selectingStepLocation.value) {
        if (!isCreatingTask.value) return
        const { lat, lng } = e.latlng
        openCreateTaskPopup(lat, lng)
      } else {
        const { lat, lng } = e.latlng
        console.log('Координаты выбраны для шага:', lat, lng)

        // Передаем координаты обратно в форму (через callback)
        pendingQuestData.value?.onLocationSelected(lat, lng)
        const type = 'quest'
        movePopup(lat, lng)
        selectingStepLocation.value = false
      }
    })

    return map
  }

  // Добавление маркера пользователя
  const addUserMarker = (
    id: string,
    coords: [number, number],
    name: string,
    color: string,
    user: any,
  ) => {
    if (!mapInstance.value) return

    const existing = markers.value.get(id)
    if (existing) mapInstance.value.removeLayer(existing as any)

    const marker = L.marker(coords, { icon: createUserMarker(color) }).addTo(mapInstance.value)

    marker.bindPopup(L.popup())

    marker.on('popupopen', () => {
      const el = document.createElement('div')
      const popupApp = createApp(UserPopup, { user })
      popupApp.mount(el)

      marker.getPopup()?.setContent(el)

      marker.once('popupclose', () => {
        popupApp.unmount()
      })
    })

    markers.value.set(id, marker)
  }

  // Добавление маркера задачи
  const addTaskMarker = (task: Task) => {
    if (!mapInstance.value) return

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

    const marker = L.marker([task.location?.lat || 0, task.location?.lng || 0], {
      icon: createTaskMarker(color, icon),
    }).addTo(mapInstance.value)

    marker.bindPopup(L.popup())

    marker.on('popupopen', () => {
      const el = document.createElement('div')
      const app = createApp(GenericTask, {
        type: task.type,
        data: task,
        onAction: async (payload: { type: string; id: string }) => {
          await applyForTask(payload.id, payload.type)
          return true
        },
      })
      app.mount(el)

      marker.getPopup()?.setContent(el)

      marker.once('popupclose', () => {
        app.unmount()
      })
    })
  }

  // Центрирование карты
  const centerMap = (coords: [number, number], zoom = 15) => {
    mapInstance.value?.setView(coords, zoom)
  }

  // включение и выключение возможности добавить задачу через кнопку на карте
  const isCreatingTask = ref(false)
  const createTaskButton = () => {
    isCreatingTask.value = !isCreatingTask.value
    return isCreatingTask.value
  }

  function openCreateTaskPopup(lat: number, lng: number, type?: any) {
    // Если Vue-приложение уже создано — просто перемещаем popup
    if (popupApp.value && popupInstance.value) {
      // ✅ пересоздаём DOM-контейнер (так как старый удалил Leaflet)
      popupContainer.value = document.createElement('div')

      // ✅ Вставляем старый Vue-компонент обратно в новый контейнер
      popupContainer.value.appendChild(popupApp.value._container ?? document.createElement('div'))

      popupInstance.value.setLatLng([lat, lng])
      popupInstance.value.setContent(popupContainer.value)
      mapInstance.value?.openPopup(popupInstance.value)
      return
    }

    // 🟢 Первый запуск — создаём Vue-компонент и popup
    popupContainer.value = document.createElement('div')

    popupApp.value = createApp(CreateTaskPopup, {
      lat,
      lng,
      type,
      onCreate: (task: Task) => {
        console.log('Создана задача:', task)

        // Сохраняем задачу в store / Firebase
        // createTask(task)
        // Добавляем маркер сразу
        // addTaskMarker(task)
        // Закрываем попап
        // popupApp.value?.unmount()
        // closeCreatePopup()
        // popup.remove()
      },
      onSelectStepLocation: (data: any) => {
        selectingStepLocation.value = true
        pendingQuestData.value = data
        mapInstance.value?.closePopup()
      },
    })

    popupApp.value?.mount(popupContainer.value)

    popupInstance.value = L.popup()
      .setLatLng([lat, lng])
      .setContent(popupContainer.value)
      .openOn(mapInstance.value!)

    popupInstance.value.on('remove', () => {
      //   // ⚠️ Не размонтируем Vue-инстанс, просто скрываем popup
      //   // popupApp.value?.unmount() //← не нужно, иначе форма исчезнет
    })
  }

  function movePopup(lat: number, lng: number) {
    if (popupInstance.value) {
      popupInstance.value.setLatLng([lat, lng])
      mapInstance.value?.openPopup(popupInstance.value)
    }
  }
  function closeCreatePopup() {
    ignoreNextClick.value = true
    if (popupInstance.value && mapInstance.value) {
      mapInstance.value.closePopup(popupInstance.value)
    }
    if (popupApp.value) {
      popupApp.value.unmount()
      popupApp.value = null
    }
    popupInstance.value = undefined
    popupContainer.value = null
  }

  return {
    mapInstance,
    markers,
    initMap,
    addUserMarker,
    addTaskMarker,
    centerMap,
    createTaskButton,
  }
}
