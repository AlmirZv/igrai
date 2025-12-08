export interface QuestReward {
  xp: number
  points: number
  inventoryItem?: number | string
}

export interface QuestRequirements {
  startDate: string
  endDate: string
  minAge: number
  maxAge: number
  gender: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface QuestParticipant {
  id: string
  joinedAt: string
  acceptedAt?: string
  status: 'pending' | 'accepted' | 'declined' | 'completed'
  name: string
  age: number
  gender: string
  progress: stepProgress
}

export interface QuestTask {
  id: string
  author: string
  authorId: string
  title: string
  description: string
  finishWords: string
  reward: QuestReward
  requirements: QuestRequirements
  participants: QuestParticipant[]
  status: 'active' | 'completed' | 'cancelled'
  type: 'quest'
  steps: QuestStep[]
  createdAt: Date
  updatedAt: Date
  location?: {
    lat: number
    lng: number
    address: string
  }
}

export interface BaseStep {
  id: string
  order: number
  title: string
  type: 'riddle' | 'qr' | 'photo'
  icon: string
  location: {
    lat: number
    lng: number
    address: string
  }
  description: string
  nextStepId: string
}

// Шаг-загадка
export interface RiddleStep extends BaseStep {
  type: 'riddle'
  riddle: string // сама загадка
  answer: string // правильный ответ
}

// Шаг с QR-кодом
export interface QRStep extends BaseStep {
  type: 'qr'
  qrCode: string // ожидаемый QR-код (или ссылка)
  clue: string
  radius?: number
}

// Шаг с фотографией
export interface PhotoStep extends BaseStep {
  type: 'photo'
  photoExampleUrl?: string // пример нужного фото
}

// Объединяющий тип
export type QuestStep = RiddleStep | QRStep | PhotoStep

export interface stepProgress {
  currentStepId: string
  history?: [
    {
      stepId: string
      completedAt: string
    },
  ]
}
