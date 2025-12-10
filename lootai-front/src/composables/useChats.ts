import { reactive, toRefs, inject } from 'vue'
import type { Chat } from '@/types/chat'
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
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { auth } from '@/config/firebase'

const state = reactive({})

export async function createChat(participants: string[], taskId?: string, name?: string) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')
  const uid = auth.currentUser?.uid

  const chatRef = collection(db, 'chats')
  const now = new Date()
  const chatData: Chat = {
    createdAt: now,
    updatedAt: now,
    id: crypto.randomUUID(),
    participants,
    name: name ? name : participants.join(', '),
    type: taskId ? 'task' : participants.length == 2 ? 'private' : 'group',
    isActive: true,
    unread: 0,
  }

  const docRef = await addDoc(chatRef, chatData)
  console.log(`Chat добавлен с ID: ${chatData.id}`)
}

export async function sendMessage(chatId: string, senderId: string, text: string) {
  if (!text.trim()) return

  try {
    const timestamp = serverTimestamp()

    // 1. Добавляем сообщение в коллекцию messages
    const messageRef = await addDoc(collection(db, 'messages'), {
      chatId,
      senderId,
      text,
      timestamp,
      type: 'text',
      edited: false,
    })

    // 2. Обновляем lastMessage в чате
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: {
        text,
        senderId,
        timestamp,
      },
    })

    return {
      id: messageRef.id,
      chatId,
      senderId,
      text,
      timestamp,
      type: 'text',
      edited: false,
    }
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error)
    throw error
  }
}

export default () => {
  return {
    state: toRefs(state),
  }
}
