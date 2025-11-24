<template>
  <div class="chat-page">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка чатов...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>Ошибка загрузки: {{ error }}</p>
      <button @click="loadChats" class="retry-btn">Повторить</button>
    </div>

    <div v-else-if="!selectedChat" class="chat-list">
      <ChatGroup
        title="Чаты по задачам"
        :chats="chats.tasks"
        :loading="loadingStates.tasks"
        @open="openChat"
      />
      <ChatGroup
        title="Друзья"
        :chats="chats.friends"
        :loading="loadingStates.friends"
        @open="openChat"
      />
      <ChatGroup
        title="Командные чаты"
        :chats="chats.teams"
        :loading="loadingStates.teams"
        @open="openChat"
      />
      <ChatGroup
        title="Остальные"
        :chats="chats.others"
        :loading="loadingStates.others"
        @open="openChat"
      />
    </div>

    <ChatWindow v-else :chat="selectedChat" @close="selectedChat = null" @send="sendMessage" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  Timestamp,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import type { Chat, ChatMessage } from '../../types/chat'
import ChatGroup from './ChatGroup.vue'
import ChatWindow from './ChatWindow.vue'

const selectedChat = ref<Chat | null>(null)
const isLoading = ref(true)
const error = ref('')

const loadingStates = reactive({
  tasks: false,
  friends: false,
  teams: false,
  others: false,
})

const chats = reactive({
  tasks: [] as Chat[],
  friends: [] as Chat[],
  teams: [] as Chat[],
  others: [] as Chat[],
})

const loadChats = async () => {
  try {
    isLoading.value = true
    error.value = ''

    const uid = auth.currentUser?.uid
    if (!uid) {
      // Load demo data for guests
      loadDemoData()
      return
    }

    // Load user's chats
    await loadUserChats(uid)
  } catch (err) {
    console.error('Error loading chats:', err)
    error.value = 'Не удалось загрузить чаты'
    // Load demo data as fallback
    loadDemoData()
  } finally {
    isLoading.value = false
  }
}

const loadUserChats = async (uid: string) => {
  try {
    const chatsRef = collection(db, 'chats')
    // Простой запрос без дополнительных фильтров
    const userChatsQuery = query(chatsRef, where('participants', 'array-contains', uid))

    const snapshot = await getDocs(userChatsQuery)
    const userChats: Chat[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      userChats.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        messages:
          data.messages?.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp?.toDate() || new Date(),
          })) || [],
      } as Chat)
    })

    // Фильтруем и сортируем локально
    const activeChats = userChats
      .filter((chat) => chat.isActive === true)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

    // Separate by type
    chats.tasks = activeChats.filter((chat) => chat.type === 'task')
    chats.friends = activeChats.filter((chat) => chat.type === 'friend')
    chats.teams = activeChats.filter((chat) => chat.type === 'team')
    chats.others = activeChats.filter((chat) => chat.type === 'other')

    // Set up real-time listeners
    setupRealtimeListeners(uid)
  } catch (err) {
    console.error('Error loading user chats:', err)
  }
}

const setupRealtimeListeners = (uid: string) => {
  const chatsRef = collection(db, 'chats')
  // Упрощенный запрос для real-time listeners
  const userChatsQuery = query(chatsRef, where('participants', 'array-contains', uid))

  onSnapshot(
    userChatsQuery,
    (snapshot) => {
      const userChats: Chat[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        userChats.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          messages:
            data.messages?.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp?.toDate() || new Date(),
            })) || [],
        } as Chat)
      })

      // Фильтруем и сортируем локально
      const activeChats = userChats
        .filter((chat) => chat.isActive === true)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

      // Update chats by type
      chats.tasks = activeChats.filter((chat) => chat.type === 'task')
      chats.friends = activeChats.filter((chat) => chat.type === 'friend')
      chats.teams = activeChats.filter((chat) => chat.type === 'team')
      chats.others = activeChats.filter((chat) => chat.type === 'other')
    },
    (error) => {
      console.error('Real-time listener error:', error)
    },
  )
}

const loadDemoData = () => {
  // Demo data for guests
  chats.tasks = [
    {
      id: 'demo-task-1',
      name: 'Задача: Убрать парк',
      avatar: '🌳',
      type: 'task',
      participants: ['demo-user-1', 'demo-user-2'],
      lastMessage: {
        id: 'msg-1',
        text: 'Спасибо за помощь!',
        fromId: 'demo-user-1',
        fromName: 'Иван',
        timestamp: new Date(),
        type: 'text',
      },
      unread: 0,
      messages: [
        {
          id: 'msg-1',
          text: 'Привет!',
          fromId: 'demo-user-2',
          fromName: 'Анна',
          timestamp: new Date(),
          type: 'text',
        },
        {
          id: 'msg-2',
          text: 'Спасибо за помощь!',
          fromId: 'demo-user-1',
          fromName: 'Иван',
          timestamp: new Date(),
          type: 'text',
        },
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  chats.friends = [
    {
      id: 'demo-friend-1',
      name: 'Алексей',
      avatar: '👤',
      type: 'friend',
      participants: ['demo-user-1', 'demo-user-3'],
      lastMessage: {
        id: 'msg-3',
        text: 'Когда встретимся?',
        fromId: 'demo-user-3',
        fromName: 'Алексей',
        timestamp: new Date(),
        type: 'text',
      },
      unread: 2,
      messages: [
        {
          id: 'msg-3',
          text: 'Завтра сможем?',
          fromId: 'demo-user-3',
          fromName: 'Алексей',
          timestamp: new Date(),
          type: 'text',
        },
        {
          id: 'msg-4',
          text: '??',
          fromId: 'demo-user-3',
          fromName: 'Алексей',
          timestamp: new Date(),
          type: 'text',
        },
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]
}

const openChat = (chat: Chat) => {
  selectedChat.value = chat

  // Mark messages as read
  if (chat.unread > 0) {
    markMessagesAsRead(chat.id)
  }
}

const sendMessage = async (text: string) => {
  if (!selectedChat.value) return

  try {
    const uid = auth.currentUser?.uid
    if (!uid) {
      // Demo mode - just add to local state
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        text,
        fromId: 'current-user',
        fromName: 'Вы',
        timestamp: new Date(),
        type: 'text',
      }

      selectedChat.value.messages.push(newMessage)
      selectedChat.value.lastMessage = newMessage
      return
    }

    // Add message to Firebase
    const chatRef = doc(db, 'chats', selectedChat.value.id)
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      text,
      fromId: uid,
      fromName: auth.currentUser?.displayName || 'User',
      timestamp: new Date(),
      type: 'text',
    }

    await updateDoc(chatRef, {
      messages: [...selectedChat.value.messages, newMessage],
      lastMessage: newMessage,
      updatedAt: serverTimestamp(),
    })

    // Update local state
    selectedChat.value.messages.push(newMessage)
    selectedChat.value.lastMessage = newMessage
  } catch (err) {
    console.error('Error sending message:', err)
    alert('Ошибка при отправке сообщения')
  }
}

const markMessagesAsRead = async (chatId: string) => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const chatRef = doc(db, 'chats', chatId)
    await updateDoc(chatRef, {
      unread: 0,
      updatedAt: serverTimestamp(),
    })

    // Update local state
    if (selectedChat.value?.id === chatId) {
      selectedChat.value.unread = 0
    }
  } catch (err) {
    console.error('Error marking messages as read:', err)
  }
}

onMounted(() => {
  loadChats()
})
</script>

<style scoped>
.chat-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  color: white;
  min-height: 400px;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  margin-top: 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #374151;
  border-top: 3px solid #25b9a0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  font-size: 16px;
  margin: 0;
  color: #e5e7eb;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #ef4444;
  text-align: center;
}

.error-state p {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #ef4444;
}

.retry-btn {
  background: linear-gradient(135deg, #25b9a0 0%, #1e9783 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(37, 185, 160, 0.3);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 185, 160, 0.4);
}

@media (max-width: 480px) {
  .chat-list {
    padding: 8px;
    gap: 8px;
    margin-top: 16px;
  }

  .loading-state,
  .error-state {
    padding: 40px 16px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border-width: 2px;
  }

  .loading-state p,
  .error-state p {
    font-size: 14px;
  }
}
</style>
