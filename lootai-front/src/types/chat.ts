export interface ChatMessage {
  id: string
  chatId: string
  text: string
  fromId: string
  fromName: string
  timestamp: Date
  edited?: boolean
  type: 'text' | 'image' | 'location' | 'task'
  metadata?: any
}

export interface LastMessage {
  text: string
  fromId: string
  timestamp: Date
}

export interface Chat {
  id: string
  name?: string
  avatar?: string
  type: 'task' | 'private' | 'group'
  participants: string[] // User IDs
  lastMessage?: LastMessage
  unread: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  taskId?: string // If it's a task-related chat
}

export interface ChatGroup {
  title: string
  chats: Chat[]
}

export interface ChatFilters {
  type?: 'task' | 'private' | 'group'
  hasUnread?: boolean
  isActive?: boolean
}
