export interface ChatMessage {
  id: string
  text: string
  fromId: string
  fromName: string
  timestamp: Date
  type: 'text' | 'image' | 'location' | 'task'
  metadata?: any
}

export interface Chat {
  id: string
  name: string
  avatar: string
  type: 'task' | 'friend' | 'team' | 'other'
  participants: string[] // User IDs
  lastMessage?: ChatMessage
  unread: number
  messages: ChatMessage[]
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
  type?: 'task' | 'friend' | 'team' | 'other'
  hasUnread?: boolean
  isActive?: boolean
}
