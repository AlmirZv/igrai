import { reactive } from 'vue'
import { io } from 'socket.io-client'

export const state = reactive({
  connected: false,
})

// Capacitor: VITE_WS_URL. Dev: localhost. Production web: undefined (same origin)
const URL =
  import.meta.env.VITE_WS_URL ||
  (import.meta.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000')

console.log('🔧 Initializing socket with URL:', URL)

export const socket = io(URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
})

socket.on('connect', () => {
  state.connected = true
  console.log('🔌 Socket connected:', socket.id)
  console.log('🔌 Socket state:', {
    connected: socket.connected,
    disconnected: socket.disconnected,
    id: socket.id,
  })

  // Регистрируем пользователя при подключении, если он авторизован
  if (typeof window !== 'undefined') {
    import('@/config/firebase').then(({ auth }) => {
      const currentUser = auth.currentUser
      if (currentUser) {
        console.log('👤 Registering user:', currentUser.uid)
        socket.emit(
          'UserEvent:register',
          {
            id: currentUser.uid,
            name: currentUser.displayName || undefined,
          },
          (response: any) => {
            console.log('📨 Registration response:', response)
            if (response && response.status === 'ok') {
              console.log('✅ User registered successfully:', response.data)
            } else if (response && response.status === 'error') {
              console.error('❌ Registration failed:', response.error)
            } else {
              console.warn('⚠️ Unexpected registration response:', response)
            }
          },
        )
      } else {
        console.log('⚠️ No current user, skipping registration')
      }
    })
  }
})

socket.on('disconnect', (reason) => {
  state.connected = false
  console.log('🔌 Socket disconnected:', reason)
})

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error)
  console.error('❌ Attempting to connect to:', URL)
})

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`🔄 Reconnection attempt ${attemptNumber}`)
})

socket.on('reconnect', (attemptNumber) => {
  console.log(`✅ Reconnected after ${attemptNumber} attempts`)
  state.connected = true
})

socket.on('reconnect_error', (error) => {
  console.error('❌ Reconnection error:', error)
})

socket.on('reconnect_failed', () => {
  console.error('❌ Reconnection failed after all attempts')
})

export async function emitPromise(event: string, data: any) {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject('No socket connection.')
    } else {
      socket.emit(event, data, (response: any) => {
        if (response.error) {
          console.error(response)
          reject(response.error)
        } else {
          resolve(response)
        }
      })
    }
  })
}
