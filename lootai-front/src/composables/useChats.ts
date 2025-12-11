import { reactive, toRefs, inject } from 'vue'
import type { Chat, ChatMessage } from '@/types/chat'
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
  onSnapshot,
  orderBy,
  limit,
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

export async function sendMessageDB(
  chatId: string,
  senderId: string,
  text: string,
  fromName?: string,
): Promise<ChatMessage> {
  if (!text.trim()) {
    throw new Error('Message text cannot be empty')
  }

  try {
    const timestamp = serverTimestamp()
    const now = new Date()

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
      text,
      fromId: senderId,
      fromName: fromName || 'User',
      timestamp: now,
      type: 'text',
      edited: false,
    }
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error)
    throw error
  }
}

export async function loadUserChats(id: string) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')
  const uid = auth.currentUser?.uid

  const chatsRef = collection(db, 'chats')
  const userChatsQuery = query(chatsRef, where('participants', 'array-contains', uid))
  const snapshot = await getDocs(userChatsQuery)
  const userChats: Chat[] = []

  snapshot.forEach((doc) => {
    const data = doc.data()
    userChats.push(data as Chat)
  })
  console.log(`user's Chat: ${userChats}`)

  return userChats
}

export async function loadChatMessages(chatId: string) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')
  const uid = auth.currentUser?.uid

  const messagesRef = collection(db, 'messages')

  const userMessagesQuery = query(
    messagesRef,
    where('chatId', '==', chatId),
    orderBy('timestamp', 'desc'),
    limit(50),
  )
  const snapshot = await getDocs(userMessagesQuery)
  const chatMessages: any[] = []

  snapshot.forEach((doc) => {
    const data = doc.data()
    chatMessages.push({ id: doc.id, ...data })
  })
  console.log(`user's Chat: ${chatMessages}`)

  return chatMessages
}

export function listenMessages(chatId: string, callback: any) {
  const q = query(
    collection(db, 'messages'),
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc'),
  )

  return onSnapshot(q, (snapshot) => {
    const messages: any = []
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() })
    })

    callback(messages)
  })
}

export default () => {
  return {
    state: toRefs(state),
  }
}
