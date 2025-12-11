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
  setDoc,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { auth } from '@/config/firebase'
import { getUserInfo } from '@/composables/userInfo'

const state = reactive({})

export async function createChat(participants: string[], taskId?: string, name?: string) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')
  const uid = auth.currentUser?.uid

  const chatRef = collection(db, 'chats')
  const docRef = doc(chatRef) // заранее создаем документ, чтобы использовать его id
  const now = new Date()

  var membersNames: any = []

  const members = await Promise.all(
    participants.map(async (p) => {
      const info = await getUserInfo(p)
      console.log(info)

      return info
    }),
  )
  console.log(members)

  members.forEach((info) => {
    membersNames.push(info.name)
  })

  const chatData: Chat = {
    createdAt: now,
    updatedAt: now,
    id: docRef.id,
    participants,
    name: name ? name : membersNames.join(', '),
    type: taskId ? 'task' : participants.length == 2 ? 'private' : 'group',
    isActive: true,
    unread: 0,
    lastMessage: {
      text: `${uid} created the chat`,
      fromId: uid,
      timestamp: now,
    },
  }

  await setDoc(docRef, chatData)
  console.log(`Chat добавлен с ID: ${chatData.id}`)
}

export async function sendMessageDB(
  chatId: string,
  fromId: string,
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
      fromId,
      text,
      timestamp,
      type: 'text',
      edited: false,
    })

    // 2. Обновляем lastMessage в чате
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: {
        text,
        fromId,
        timestamp,
      },
    })

    return {
      id: messageRef.id,
      chatId,
      text,
      fromId,
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

export async function loadChatMessages(chatId: string): Promise<ChatMessage[]> {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')
  try {
    const uid = auth.currentUser?.uid
    console.log(chatId)

    const messagesRef = collection(db, 'messages')

    const userMessagesQuery = query(messagesRef, where('chatId', '==', chatId), limit(50))

    const snapshot = await getDocs(userMessagesQuery)

    const chatMessages: ChatMessage[] = []

    snapshot.forEach((doc) => {
      const data = doc.data() as ChatMessage
      chatMessages.push({
        ...data,
        id: doc.id,
        timestamp:
          (data.timestamp as any)?.toDate?.() ??
          (data.timestamp instanceof Date ? data.timestamp : new Date()),
      })
    })

    // Sort locally to avoid Firestore composite index requirement
    // chatMessages.sort((a, b) => {
    //   const getMs = (ts: any) =>
    //     ts?.toMillis ? ts.toMillis() : ts instanceof Date ? ts.getTime() : 0
    //   return getMs(b.timestamp) - getMs(a.timestamp)
    // })
    // console.log(`user's Chat: ${chatMessages}`)

    return chatMessages
  } catch (error) {
    console.log(error)
    throw error
  }
}

export function listenMessages(chatId: string, callback: any) {
  const q = query(collection(db, 'messages'), where('chatId', '==', chatId))

  return onSnapshot(q, (snapshot) => {
    const messages: any = []
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() })
    })

    messages.sort((a: any, b: any) => {
      const getMs = (ts: any) =>
        ts?.toMillis ? ts.toMillis() : ts instanceof Date ? ts.getTime() : 0
      return getMs(a.timestamp) - getMs(b.timestamp)
    })

    callback(messages)
  })
}

export default () => {
  return {
    state: toRefs(state),
  }
}
