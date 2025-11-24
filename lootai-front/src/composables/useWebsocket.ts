// src/composables/useWebsocket.ts
import { onUnmounted } from 'vue'
import { websocketService } from '@/services/websocket'

type LocationPayload = {
  userId: string
  latitude: number
  longitude: number
  isBot?: boolean
  name?: string
}

export function useWebsocket() {
  const sendLocationUpdate = (payload: LocationPayload) => {
    websocketService.emit('locationUpdate', payload)
  }

  const sendCreateBot = (payload: {
    userId: string
    radius: number
    userLocation?: { lat: number; lng: number }
  }) => {
    websocketService.emit('createBot', payload)
  }

  const onLocationUpdate = (handler: (data: any) => void) => {
    websocketService.on('locationUpdate', handler)

    // очистка подписки при уничтожении компонента
    onUnmounted(() => {
      websocketService.off('locationUpdate', handler)
    })
  }

  return { sendLocationUpdate, sendCreateBot, onLocationUpdate }
}
