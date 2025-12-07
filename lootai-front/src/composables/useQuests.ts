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
import type { QuestTask, QuestParticipant, QuestStep } from '@/types/quest'
import { auth } from '@/config/firebase'
import userComposable from './userInfo'
import { updateUserXp } from './userInfo'
import type { TaskParticipant } from '@/types/task'

const usercomp = userComposable()

// создание задачи
export async function createQuest(task: QuestTask) {
  // const coordinates = generateNearbyCoordinates(currentUserLat, currentUserLng, 1)
  const tasksRef = collection(db, 'quests')
  const now = new Date()
  const taskData: QuestTask = {
    ...task,
    createdAt: now,
    updatedAt: now,
    id: '', // Будет сгенерирован Firestore
  }

  const docRef = await addDoc(tasksRef, taskData)
  console.log(`Quest добавлен с ID: ${task.id}`)
}

// загрузка всех задач на карту
export async function loadQuests(): Promise<QuestTask[]> {
  const snapshot = await getDocs(query(collection(db, 'quests')))
  const quests: QuestTask[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    quests.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as QuestTask)
  })

  return quests
}

// загрузка одного квеста по id (обновлённые данные после изменений)
export async function getQuest(taskId: string): Promise<QuestTask | null> {
  const taskRef = doc(db, 'quests', taskId)
  const snap = await getDoc(taskRef)

  if (!snap.exists()) {
    return null
  }

  const data = snap.data()

  return {
    ...data,
    id: snap.id,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as QuestTask
}

// загрузка задач в которых учавствует пользователь
export async function loadUserQuests(uid: string): Promise<QuestTask[]> {
  const questsRef = collection(db, 'quests')
  const userQuestsQuery = query(questsRef, where('participantsId', 'array-contains', uid))

  const snapshot = await getDocs(userQuestsQuery)
  const quests: QuestTask[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()

    quests.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as QuestTask)
  })

  return quests
}

// загрузка задач созданных пользователем
export async function loadAuthorQuests(uid: string): Promise<QuestTask[]> {
  const questsRef = collection(db, 'tasks')
  const userQuestsQuery = query(questsRef, where('authorId', '==', uid))

  const snapshot = await getDocs(userQuestsQuery)
  const quests: QuestTask[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()

    quests.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as QuestTask)
  })

  return quests
}

// заявка на участие в задаче
export async function applyForQuest(taskId: string) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')

  const uid = auth.currentUser.uid
  const taskRef = doc(db, 'quests', taskId)
  const snap = await getDoc(taskRef)

  if (!snap.exists()) {
    throw new Error('Задача не найдена')
  }

  const task = snap.data() as QuestTask

  const now = new Date().toISOString()

  const newParticipant: QuestParticipant = {
    id: uid,
    name: auth.currentUser.displayName || 'NoName',
    status: 'accepted',
    joinedAt: now,
    acceptedAt: now,
    age: usercomp.state.age.value,
    gender: usercomp.state.user.value.gender,
    progress: {
      currentStepId: task.steps[0].id,
      history: [
        {
          stepId: '',
          completedAt: '',
        },
      ],
    },
  }

  await updateDoc(taskRef, {
    participants: [...(task.participants || []), newParticipant],
  })
  console.log(`Заявка подана: ${newParticipant}`)
}

// заявка на участие в задаче
export async function updateQuestStep(taskId: string, step: QuestStep) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')

  const uid = auth.currentUser.uid
  const taskRef = doc(db, 'quests', taskId)
  const snap = await getDoc(taskRef)

  if (!snap.exists()) {
    throw new Error('Задача не найдена')
  }

  const task = snap.data() as QuestTask

  const now = new Date().toISOString()
  console.log(task.participants)
  console.log(task.participants.find((participant) => participant.id !== uid))

  if (task.participants.find((participant) => participant.id !== uid) == undefined) {
    const newParticipant: QuestParticipant = {
      id: uid,
      name: auth.currentUser.displayName || 'NoName',
      status: 'accepted',
      joinedAt: now,
      acceptedAt: now,
      age: usercomp.state.age.value,
      gender: usercomp.state.user.value.gender,
      progress: {
        currentStepId: step.nextStepId,
        history: [
          {
            stepId: step.id,
            completedAt: now,
          },
        ],
      },
    }
    await updateDoc(taskRef, {
      participants: [...(task.participants || []), newParticipant],
    })
  } else {
    console.log('here')

    const participant = task.participants.find((participant) => participant.id == uid)
    var newParticipant: QuestParticipant = participant as QuestParticipant
    newParticipant.progress.currentStepId = step.nextStepId
    newParticipant.progress.history?.push({
      stepId: step.id,
      completedAt: now,
    })
    var participants = task.participants.filter((p) => p !== participant)
    participants.push(newParticipant)
    await updateDoc(taskRef, {
      participants: participants,
    })
  }
}
