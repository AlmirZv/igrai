// src/composables/useTasks.ts
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
import type { Task, TaskParticipant } from '@/types/task'
import { auth } from '@/config/firebase'
import userComposable from './userInfo'
import { updateUserXp } from './userInfo'

const usercomp = userComposable()

// загрузка всех задач на карту
export async function loadTasks(): Promise<Task[]> {
  const snapshot = await getDocs(query(collection(db, 'tasks')))
  const tasks: Task[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    tasks.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Task)
  })
  // console.log(tasks)

  return tasks
}

// загрузка задач в которых учавствует пользователь
export async function loadUserTasks(uid: string): Promise<Task[]> {
  const tasksRef = collection(db, 'tasks')
  const userTasksQuery = query(tasksRef, where('participantsId', 'array-contains', uid))

  const snapshot = await getDocs(userTasksQuery)
  const tasks: Task[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()

    tasks.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Task)
  })

  return tasks
}

// загрузка задач созданных пользователем
export async function loadAuthorTasks(uid: string): Promise<Task[]> {
  const tasksRef = collection(db, 'tasks')
  const userTasksQuery = query(tasksRef, where('authorId', '==', uid))

  const snapshot = await getDocs(userTasksQuery)
  const tasks: Task[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()

    tasks.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Task)
  })

  return tasks
}

// создание задачи
export async function createTask(task: Task) {
  // const coordinates = generateNearbyCoordinates(currentUserLat, currentUserLng, 1)
  const tasksRef = collection(db, 'tasks')
  const now = new Date()
  const taskData: Task = {
    ...task,
    createdAt: now,
    updatedAt: now,
    id: '', // Будет сгенерирован Firestore
  }

  const docRef = await addDoc(tasksRef, taskData)
  console.log(`Задача добавлена с ID: ${task.id}`)
}

// заявка на участие в задаче
export async function applyForTask(taskId: string, type: string) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')

  const uid = auth.currentUser.uid
  const taskRef = doc(db, 'tasks', taskId)
  const snap = await getDoc(taskRef)

  if (!snap.exists()) {
    throw new Error('Задача не найдена')
  }

  const task = snap.data() as Task

  const now = new Date().toISOString()

  const newParticipant: TaskParticipant = {
    id: uid,
    name: auth.currentUser.displayName || 'NoName',
    status: type == 'user' ? 'pending' : 'accepted',
    joinedAt: now,
    acceptedAt: '',
    age: usercomp.state.age.value,
    gender: usercomp.state.user.value.gender,
  }

  await updateDoc(taskRef, {
    participants: [...(task.participants || []), newParticipant],
    participantsId: [...(task.participantsId || []), uid],
  })
  console.log(`
    Заявка подана: ${newParticipant}`)
}

// заявка на участие в задаче
export async function acceptParticipantForTask(taskId: string, participant: TaskParticipant) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')

  try {
    const taskRef = doc(db, 'tasks', taskId)

    const snap = await getDoc(taskRef)

    if (snap.exists()) {
      const taskData = snap.data()
      const participants = taskData.participants || []

      const index = participants.findIndex((p: TaskParticipant) => p.id === participant.id)
      if (index !== -1) {
        participants[index] = {
          ...participants[index],
          status: 'accepted',
          acceptedAt: Timestamp.now(),
        }

        await updateDoc(taskRef, {
          participants, // обновляем массив целиком, но меняется только нужный объект
          updatedAt: Timestamp.now(),
        })
      }
    }

    alert(`Принят: ${participant.name}`)
  } catch (err) {
    console.error('Error accepting participant:', err)
    alert('Ошибка при принятии участника')
  }
}

// заявка на участие в задаче
export async function declineParticipantForTask(taskId: string, participant: TaskParticipant) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')

  try {
    const taskRef = doc(db, 'tasks', taskId)
    const snap = await getDoc(taskRef)

    if (snap.exists()) {
      const taskData = snap.data()
      const participants = taskData.participants || []

      const index = participants.findIndex((p: TaskParticipant) => p.id === participant.id)
      if (index !== -1) {
        participants[index] = {
          ...participants[index],
          status: 'declined',
          acceptedAt: Timestamp.now(),
        }

        await updateDoc(taskRef, {
          participants, // обновляем массив целиком, но меняется только нужный объект
          updatedAt: Timestamp.now(),
        })
      }
    }

    alert(`Отклонён: ${participant.name}`)
  } catch (err) {
    console.error('Error declining participant:', err)
    alert('Ошибка при отклонении участника')
  }
}

// Архивация задачи
export async function completeTask(taskId: string) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')
  try {
    const taskRef = doc(db, 'tasks', taskId)
    const snap = await getDoc(taskRef)

    if (snap.exists()) {
      const taskData = snap.data()
      await updateUserXp(taskData?.authorId, taskData?.reward.xp)

      const participants =
        taskData.participants.filter((p: TaskParticipant) => p.status === 'accepted') || []

      participants.forEach(async (p: TaskParticipant) => {
        await updateUserXp(p.id, taskData?.reward.xp, taskData?.reward.points)
      })
    }

    await updateDoc(taskRef, {
      status: 'completed',
    })

    alert(`Задача заархивирована, опыт получен`)
  } catch (error) {
    console.log(error)
  }
}
