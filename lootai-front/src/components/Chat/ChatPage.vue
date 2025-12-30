<template>
  <div class="chat-page">
    <LoadingSpinner v-if="isLoading">{{ $t(`chat.chatsLoading`) }}...</LoadingSpinner>
    <ErrorState v-else-if="error">
      <p>{{ $t(`chat.loadingError`) }}: {{ error }}</p>
      <Button @click="loadChats">{{ $t(`chat.reload`) }}</Button>
    </ErrorState>

    <div v-else-if="!selectedChat" class="chat-list">
      <ChatGroup
        :title="$t(`chat.taskChatsTitle`)"
        :chats="chats.taskChats"
        :loading="loadingStates.taskChats"
        @open="openChat"
      />
      <ChatGroup
        :title="$t(`chat.friendsChatsTitle`)"
        :chats="chats.private"
        :loading="loadingStates.private"
        @open="openChat"
      />
      <ChatGroup
        :title="$t(`chat.teamChatsTitle`)"
        :chats="chats.group"
        :loading="loadingStates.group"
        @open="openChat"
      />
    </div>

    <ChatWindow v-else :chat="selectedChat" @close="selectedChat = null" @send="sendMessage" />
    <!-- <div>
      <button class="create-btn" type="button" @click="createTestChat">Создать chat</button>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
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
  getDoc,
} from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import type { Chat, ChatMessage } from '../../types/chat'
import ChatGroup from './ChatGroup.vue'
import ChatWindow from './ChatWindow.vue'
import { LoadingSpinner, ErrorState, Button } from '@/designSystem/components'
import { loadUserChats, loadChatMessages, sendMessageDB, createChat } from '@/composables/useChats'
import { useNavigation } from '@/composables/useNavigation'

const selectedChat = ref<Chat | null>(null)
const selectedChatMessages = ref<ChatMessage[] | null>(null)
const isLoading = ref(true)
const error = ref('')
const { pendingChatId, clearPendingChat } = useNavigation()

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

// Функция для открытия чата по ID
const openChatById = async (chatId: string) => {
  try {
    const chatDoc = await getDoc(doc(db, 'chats', chatId))
    if (!chatDoc.exists()) {
      console.error('Чат не найден:', chatId)
      return
    }

    const chatData = chatDoc.data() as Chat
    const createdAt =
      (chatData.createdAt as any)?.toDate?.() ??
      (chatData.createdAt instanceof Date ? chatData.createdAt : new Date())
    const updatedAt =
      (chatData.updatedAt as any)?.toDate?.() ??
      (chatData.updatedAt instanceof Date ? chatData.updatedAt : new Date())

    const chat: Chat = {
      ...chatData,
      id: chatDoc.id,
      createdAt,
      updatedAt,
    }

    await openChat(chat)
  } catch (err) {
    console.error('Ошибка при открытии чата по ID:', err)
  }
}

// Отслеживаем pendingChatId и открываем чат при его установке
watch(
  () => pendingChatId.value,
  async (newChatId) => {
    if (newChatId && !isLoading.value) {
      await openChatById(newChatId)
      clearPendingChat()
    }
  },
  { immediate: true },
)

// Также проверяем при загрузке чатов
watch(isLoading, async (isLoadingValue) => {
  if (!isLoadingValue && pendingChatId.value) {
    await openChatById(pendingChatId.value)
    clearPendingChat()
  }
})

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

onMounted(async () => {
  await loadChats()
  // Если есть pendingChatId после загрузки, открываем чат
  if (pendingChatId.value) {
    await openChatById(pendingChatId.value)
    clearPendingChat()
  }
})

const createTestChat = async () => {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')
  console.log('test', auth.currentUser?.uid)
  const chatId = await createChat(['8EKmf9xT9AZA1T2H2Trn5Njrc1Q2', auth.currentUser?.uid])
  console.log('Created chat with ID:', chatId)
}
</script>

<style scoped>
.chat-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Список чатов */
.chat-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
}
</style>
