export interface TaskReward {
  xp: number
  points: number
  inventoryItem?: number | string
}

export interface TaskRequirements {
  startTime: string
  startDate: string
  endTime: string
  endDate: string
  membersCount: number
  age: number
  gender: string
}

export interface TaskParticipant {
  id: string
  joinedAt: string
  acceptedAt?: string
  status: 'pending' | 'accepted' | 'declined'
  name: string
  age: number
  gender: string
}

export interface Task {
  id: string
  title: string
  description: string
  author: string
  authorId: string
  reward: TaskReward
  requirements: TaskRequirements
  participants?: TaskParticipant[]
  participantsId: []
  status: 'active' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
  type: 'user'
  location?: {
    lat: number
    lng: number
    address: string
  }
}

export interface TaskFilters {
  type?: 'user' | 'public' | 'quest' | 'event'
  status?: 'active' | 'completed' | 'cancelled'
  minReward?: number
  maxDistance?: number
  location?: {
    lat: number
    lng: number
  }
}

export interface UserTask {
  title: string
  description: string
  reward: TaskReward
  requirements: TaskRequirements
  status: 'active' | 'completed' | 'cancelled'
  type: 'user'
}
