export interface TaskCounters {
  public: number
  user: number
  quest: number
  event: number
}

export interface InventoryItem {
  id: number | string
  name: string
  icon?: string
}

export interface UserProfile {
  name: string
  email: string
  age: number
  gender: string
  avatar: string
  xp: number
  points: number
  tasksCompleted: TaskCounters
  achievements: string[]
  inventory: InventoryItem[]
  birthday: {
    seconds: number
    nanoseconds: number
  }
}
