import { io, Socket } from 'socket.io-client'

class WebSocketService {
  private socket: Socket | null = null
  private serverUrl: string

  constructor() {
    this.serverUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000'
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
      })

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server')
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        reject(error)
      })

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason)
      })
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const websocketService = new WebSocketService()
export default websocketService
