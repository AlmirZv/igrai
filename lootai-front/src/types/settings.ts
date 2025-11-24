export interface UserSettings {
  profile: {
    visibleOnMap: boolean
    showLocation: boolean
    allowTaskInvites: boolean
    notifications: {
      taskUpdates: boolean
      messages: boolean
      achievements: boolean
      pushNotifications: boolean
    }
  }
  app: {
    language: 'ru' | 'en'
    theme: 'light' | 'dark'
    fontSize: 'small' | 'medium' | 'large'
    soundEnabled: boolean
    vibrationEnabled: boolean
  }
  map: {
    showTasks: boolean
    showUsers: boolean
    defaultZoom: number
    mapType: 'default' | 'satellite' | 'terrain'
    autoRefresh: boolean
    refreshInterval: number // in minutes
  }
}

export interface AppConfig {
  version: string
  minVersion: string
  buildDate: string
  features: {
    chat: boolean
    tasks: boolean
    achievements: boolean
    inventory: boolean
  }
  limits: {
    maxTaskParticipants: number
    maxChatMessages: number
    maxFileSize: number
  }
}
