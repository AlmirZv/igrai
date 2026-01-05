import { ref, createApp } from 'vue'
import L from 'leaflet'
import { i18n } from '@/locales/i18n'

type OnRemoveCallback = (wasProgrammatic: boolean) => void

export function useMapPopups(mapRef: { value?: L.Map }) {
  const popupInstance = ref<L.Popup | null>()
  const popupApp = ref<ReturnType<typeof createApp> | null>(null)
  const popupContainer = ref<HTMLElement | null>(null)

  const ignoreNextClick = ref(false)

  // Флаг — мы скрыли попап программно (hide), чтобы handler 'remove' не размонтировал app
  let isHidingProgrammatically = false

  // Текущий onRemove callback (передаётся при open)
  let currentOnRemove: OnRemoveCallback | null = null

  function open(
    component: any,
    props: Record<string, any>,
    lat: number,
    lng: number,
    options?: { onRemove?: OnRemoveCallback; popupOptions?: L.PopupOptions },
  ) {
    // если уже есть popup + смонтированный app -> просто переместить / снова открыть
    if (popupInstance.value && popupApp.value) {
      // Если у Leaflet удалил старый DOM, мы просто создаём новый контейнер и переносим app._container в него
      const realAppContainer: Node | null = (popupApp.value as any)?._container ?? null

      const newContainer = document.createElement('div')

      if (realAppContainer && realAppContainer instanceof Node) {
        newContainer.appendChild(realAppContainer)
      } else if (popupContainer.value) {
        // fallback — перемещаем содержимое старого popupContainer
        while (popupContainer.value.firstChild) {
          newContainer.appendChild(popupContainer.value.firstChild)
        }
      }

      popupContainer.value = newContainer
      popupInstance.value.setLatLng([lat, lng])
      popupInstance.value.setContent(popupContainer.value)
      mapRef.value?.openPopup(popupInstance.value)

      // обновим callback
      currentOnRemove = options?.onRemove ?? null
      return
    }

    // иначе — создаём новый Vue app + popup
    // если был старый — точно разрушим (во избежание утечек)
    destroyInternal()

    popupContainer.value = document.createElement('div')
    popupApp.value = createApp(component, props)
    // Подключаем i18n ДО монтирования (критично для legacy: false)
    if (popupApp.value) {
      popupApp.value.use(i18n)
      popupApp.value.mount(popupContainer.value)
    }

    popupInstance.value = L.popup(options?.popupOptions ?? {})
      .setLatLng([lat, lng])
      .setContent(popupContainer.value)
      .openOn(mapRef.value!)

    currentOnRemove = options?.onRemove ?? null
    isHidingProgrammatically = false

    // Подписываемся на remove (вызовется при крестике и при programmatic close)
    popupInstance.value.on('remove', () => {
      // Если мы скрывали программно — хотим сохранить Vue-инстанс (не размонтируем)
      if (isHidingProgrammatically) {
        // Пометка — скрыли программно; сбросим флаг и вызовем колбэк с true
        isHidingProgrammatically = false
        currentOnRemove?.(true)
        return
      }

      // Иначе — это закрытие пользователем (крестик) — размонтируем и уведомить с false
      destroyInternal()
      currentOnRemove?.(false)
    })
  }

  // Программно скрыть, но НЕ размонтировать (для режима выбора локации)
  function hide() {
    if (!popupInstance.value || !mapRef.value) return
    isHidingProgrammatically = true
    mapRef.value.closePopup(popupInstance.value)
    // 'remove' вызовется — в нём мы увидим isHidingProgrammatically и не размонтируем
  }

  // Полностью закрыть и размонтировать (например, пользователь нажал крестик или необходимо сбросить форму)
  function close(setIgnore = false) {
    if (!popupInstance.value || !mapRef.value) return
    if (setIgnore) ignoreNextClick.value = true

    // здесь мы не ставим isHidingProgrammatically, чтобы remove размонтировал
    mapRef.value.closePopup(popupInstance.value)
    // если popup уже удалил DOM — обработчик remove выполнит destroyInternal()
  }

  // Переместить попап (и открыть), не создавая нового Vue-инстанса
  function move(lat: number, lng: number) {
    if (!popupInstance.value) return

    // Если у нас есть сохранённый real container (app._container) — поместим его в новый контейнер
    const realAppContainer: Node | null = (popupApp.value as any)?._container ?? null

    if (realAppContainer && !(realAppContainer.parentNode === popupContainer.value)) {
      // перенести mounted контейнер в новый wrapper
      const newContainer = document.createElement('div')
      newContainer.appendChild(realAppContainer)
      popupContainer.value = newContainer
    }

    if (popupContainer.value) {
      popupInstance.value.setContent(popupContainer.value)
    }
    popupInstance.value.setLatLng([lat, lng])
    mapRef.value?.openPopup(popupInstance.value)
  }

  // Внутренняя функция для полного уничтожения app/popup
  function destroyInternal() {
    try {
      if (popupApp.value) {
        popupApp.value.unmount()
        popupApp.value = null
      }
    } finally {
      if (popupInstance.value && mapRef.value) {
        try {
          mapRef.value.closePopup(popupInstance.value)
        } catch {}
      }
      popupInstance.value = null
      popupContainer.value = null
      isHidingProgrammatically = false
      currentOnRemove = null
    }
  }

  return {
    open,
    hide,
    close,
    move,
    popupInstance,
    popupApp,
    ignoreNextClick,
  }
}
