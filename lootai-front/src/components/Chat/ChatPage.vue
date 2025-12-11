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
        :chats="chats.taskChats"
        :loading="loadingStates.taskChats"
        @open="openChat"
      />
      <ChatGroup
        title="Друзья"
        :chats="chats.private"
        :loading="loadingStates.private"
        @open="openChat"
      />
      <ChatGroup
        title="Командные чаты"
        :chats="chats.group"
        :loading="loadingStates.group"
        @open="openChat"
      />
    </div>

    <ChatWindow v-else :chat="selectedChat" @close="selectedChat = null" @send="sendMessage" />
    <div>
      <button class="create-btn" type="button" @click="createTestChat">Создать chat</button>
    </div>
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
import { loadUserChats, loadChatMessages, sendMessageDB, createChat } from '@/composables/useChats'

const selectedChat = ref<Chat | null>(null)
const selectedChatMessages = ref<ChatMessage[] | null>(null)
const isLoading = ref(true)
const error = ref('')

const loadingStates = reactive({
  private: false,
  group: false,
  taskChats: false,
})

const chats = reactive({
  private: [] as Chat[],
  group: [] as Chat[],
  taskChats: [] as Chat[],
})

const loadChats = async () => {
  try {
    isLoading.value = true
    error.value = ''

    const uid = auth.currentUser?.uid
    if (!uid) {
      return
    }

    // Load user's chats
    const userChats = await loadUserChats(uid)
    // Фильтруем и сортируем локально
    const activeChats = userChats
      .filter((chat) => chat.isActive === true)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

    // Separate by type
    chats.private = activeChats.filter((chat) => chat.type === 'private')
    chats.group = activeChats.filter((chat) => chat.type === 'group')
    chats.taskChats = activeChats.filter((chat) => chat.type === 'task')

    // Set up real-time listeners
    setupRealtimeListeners(uid)
  } catch (err) {
    console.error('Error loading chats:', err)
    error.value = 'Не удалось загрузить чаты'
  } finally {
    isLoading.value = false
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
        userChats.push(data as Chat)
      })

      // Фильтруем и сортируем локально
      const activeChats = userChats
        .filter((chat) => chat.isActive === true)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

      // Update chats by type
      chats.private = activeChats.filter((chat) => chat.type === 'private')
      chats.group = activeChats.filter((chat) => chat.type === 'group')
      chats.taskChats = activeChats.filter((chat) => chat.type === 'task')
    },
    (error) => {
      console.error('Real-time listener error:', error)
    },
  )
}

const openChat = async (chat: Chat) => {
  selectedChat.value = chat
  selectedChatMessages.value = await loadChatMessages(chat.id)

  // Mark messages as read
  if (chat.unread > 0) {
    markMessagesAsRead(chat.id)
  }
}

const sendMessage = async (text: string) => {
  if (!selectedChat.value || !text.trim()) return

  try {
    const uid = auth.currentUser?.uid
    if (!uid) {
      return
    }

    // Add message to Firebase
    const newMessage: ChatMessage = await sendMessageDB(
      selectedChat.value.id,
      uid,
      text,
      auth.currentUser?.displayName || 'User',
    )

    // Update local state
    selectedChatMessages.value?.push(newMessage)
    selectedChat.value.lastMessage = newMessage
  } catch (err) {
    console.error('Error sending message:', err)
    // alert('Ошибка при отправке сообщения')
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

const createTestChat = () => {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')
  console.log('test', auth.currentUser?.uid)
  createChat(['8EKmf9xT9AZA1T2H2Trn5Njrc1Q2', auth.currentUser?.uid])
}
</script>

<style scoped>
.chat-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #f1f1f1;
  min-height: 400px;
  background: #121417;
}

/* Список чатов */
.chat-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  margin-top: 20px;
}

/* Состояние загрузки */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

/* Новый спиннер */
.spinner {
  width: 46px;
  height: 46px;
  border: 4px solid rgba(255, 255, 255, 0.08);
  border-top: 4px solid #25b9a0;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
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
  font-size: 15px;
  color: #d1d5db;
  margin: 0;
}

/* Ошибки */
.error-state p {
  font-size: 15px;
  margin: 0 0 16px 0;
  color: #ef4444;
}

.error-state {
  color: #ef4444;
}

/* Кнопка повтора */
.retry-btn {
  background: linear-gradient(135deg, #25b9a0, #1e9783);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 26px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s ease;
  box-shadow: 0 2px 8px rgba(37, 185, 160, 0.25);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 185, 160, 0.4);
}

/* Мобильная адаптация */
@media (max-width: 480px) {
  .chat-list {
    padding: 12px;
    gap: 10px;
    margin-top: 16px;
  }

  .loading-state,
  .error-state {
    padding: 40px 16px;
  }

  .spinner {
    width: 34px;
    height: 34px;
    border-width: 3px;
  }

  .loading-state p,
  .error-state p {
    font-size: 14px;
  }
}
</style>
