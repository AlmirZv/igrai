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
import type { PublicTask, TaskParticipant } from '@/types/publicTask'
import { auth } from '@/config/firebase'
import userComposable from './userInfo'
import { updateUserXp } from './userInfo'

const usercomp = userComposable()

// создание задачи
export async function createPublicTask(task: PublicTask) {
  // const coordinates = generateNearbyCoordinates(currentUserLat, currentUserLng, 1)
  const tasksRef = collection(db, 'publicTasks')
  const now = new Date()
  const taskData: PublicTask = {
    ...task,
    createdAt: now,
    updatedAt: now,
    id: '', // Будет сгенерирован Firestore
  }

  const docRef = await addDoc(tasksRef, taskData)
  console.log(`publicTasks добавлен с ID: ${task.id}`)
}

// загрузка всех задач на карту
export async function loadPublicTasks(): Promise<PublicTask[]> {
  const snapshot = await getDocs(query(collection(db, 'publicTasks')))
  const quests: PublicTask[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    quests.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as PublicTask)
  })

  return quests
}

// загрузка задач в которых учавствует пользователь
export async function loadUserQuests(uid: string): Promise<PublicTask[]> {
  const questsRef = collection(db, 'publicTasks')
  const userQuestsQuery = query(questsRef, where('participantsId', 'array-contains', uid))

  const snapshot = await getDocs(userQuestsQuery)
  const quests: PublicTask[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()

    quests.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as PublicTask)
  })

  return quests
}

// загрузка задач созданных пользователем
export async function loadAuthorQuests(uid: string): Promise<PublicTask[]> {
  const questsRef = collection(db, 'publicTasks')
  const userQuestsQuery = query(questsRef, where('authorId', '==', uid))

  const snapshot = await getDocs(userQuestsQuery)
  const quests: PublicTask[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()

    quests.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as PublicTask)
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

  const task = snap.data() as PublicTask

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

// обновление публичной задачи
export async function updatePublicTask(taskId: string, payload: Partial<PublicTask>) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')

  const taskRef = doc(db, 'publicTasks', taskId)
  await updateDoc(taskRef, { ...payload, updatedAt: Timestamp.now() })
}

// завершение публичной задачи
export async function completePublicTask(taskId: string) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')

  const taskRef = doc(db, 'publicTasks', taskId)
  await updateDoc(taskRef, { status: 'completed', updatedAt: Timestamp.now() })
}