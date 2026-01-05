import {
  collection,
  getDocs,
  query,
  addDoc,
  Timestamp,
  where,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { EventTask, TaskParticipant } from '@/types/event'
import { auth } from '@/config/firebase'
import userComposable from './userInfo'
import { updateUserXp } from './userInfo'

const usercomp = userComposable()

// создание задачи
export async function createPublicTask(task: EventTask) {
  // const coordinates = generateNearbyCoordinates(currentUserLat, currentUserLng, 1)
  const tasksRef = collection(db, 'eventTasks')
  const now = new Date()
  const taskData: EventTask = {
    ...task,
    createdAt: now,
    updatedAt: now,
    id: '', // Будет сгенерирован Firestore
  }

  const docRef = await addDoc(tasksRef, taskData)
  console.log(`publicTasks добавлен с ID: ${task.id}`)
}

// загрузка всех задач на карту
export async function loadEventTasks(): Promise<EventTask[]> {
  const snapshot = await getDocs(query(collection(db, 'eventTasks')))
  const quests: EventTask[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    quests.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as EventTask)
  })

  return quests
}

// загрузка задач в которых учавствует пользователь
export async function loadUserQuests(uid: string): Promise<EventTask[]> {
  const questsRef = collection(db, 'eventTasks')
  const userQuestsQuery = query(questsRef, where('participantsId', 'array-contains', uid))

  const snapshot = await getDocs(userQuestsQuery)
  const quests: EventTask[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()

    quests.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as EventTask)
  })

  return quests
}

// загрузка задач созданных пользователем
export async function loadAuthorQuests(uid: string): Promise<EventTask[]> {
  const questsRef = collection(db, 'eventTasks')
  const userQuestsQuery = query(questsRef, where('authorId', '==', uid))

  const snapshot = await getDocs(userQuestsQuery)
  const quests: EventTask[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()

    quests.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as EventTask)
  })

  return quests
}

// заявка на участие в задаче
export async function applyForQuest(taskId: string) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')

  const uid = auth.currentUser.uid
  const taskRef = doc(db, 'publicTasks', taskId)
  const snap = await getDoc(taskRef)

  if (!snap.exists()) {
    throw new Error('Задача не найдена')
  }

  const task = snap.data() as EventTask

  const now = new Date().toISOString()

  const newParticipant: TaskParticipant = {
    id: uid,
    name: auth.currentUser.displayName || 'NoName',
    status: 'accepted',
    joinedAt: now,
    acceptedAt: now,
    age: usercomp.state.age.value,
    gender: usercomp.state.user.value.gender,
  }

  await updateDoc(taskRef, {
    participants: [...(task.participants || []), newParticipant],
  })
  console.log(`Заявка подана: ${newParticipant}`)
}

// обновление события
export async function updateEventTask(taskId: string, payload: Partial<EventTask>) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')

  const taskRef = doc(db, 'eventTasks', taskId)
  await updateDoc(taskRef, { ...payload, updatedAt: Timestamp.now() })
}

// завершение события
export async function completeEventTask(taskId: string) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')

  const taskRef = doc(db, 'eventTasks', taskId)
  await updateDoc(taskRef, { status: 'completed', updatedAt: Timestamp.now() })
}