import { ref, reactive, computed } from 'vue'
import type { Chat } from '@/types/chat'

// Глобальное состояние для навигации
const navigationState = reactive({
  currentPage: 'Map',
  pendingChatId: null as string | null,
})

/**
 * Composable для управления навигацией и открытием чатов
 */
export function useNavigation() {
  const navigateToPage = (page: string) => {
    navigationState.currentPage = page
  }

  const openChat = (chatId: string) => {
    navigationState.pendingChatId = chatId
    navigationState.currentPage = 'Chats'
  }

  const clearPendingChat = () => {
    navigationState.pendingChatId = null
  }

  return {
    currentPage: computed(() => navigationState.currentPage),
    pendingChatId: computed(() => navigationState.pendingChatId),
    navigateToPage,
    openChat,
    clearPendingChat,
  }
}
