export interface EventReward {
  xp: number
  inventoryItem?: number | string
}

export interface TaskRequirements {
  startTime: string
  startDate: string
  endTime: string
  endDate: string
  membersCount: number
  minAge: number
  maxAge: number
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
  reward: EventReward
  requirements: TaskRequirements
  participants?: TaskParticipant[]
  participantsId: []
  status: 'active' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
  type: 'event'
  location?: {
    lat: number
    lng: number
    address: string
  }
}

export interface TaskFilters {
  type?: 'event'
  status?: 'active' | 'completed' | 'cancelled'
  minReward?: number
  maxDistance?: number
  location?: {
    lat: number
    lng: number
  }
}

export interface EventTask {
  id: string
  title: string
  description: string
  author: string
  authorId: string
  reward: EventReward
  requirements: TaskRequirements
  participants?: TaskParticipant[]
  status: 'active' | 'completed' | 'cancelled'
  type: 'event'
  location?: {
    lat: number
    lng: number
    address: string
  }
  createdAt: Date
  updatedAt: Date
}
