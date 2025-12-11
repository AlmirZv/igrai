<template>
  <div class="chat-window">
    <header>
      <button @click="$emit('close')">←</button>
      <h3>{{ chat.name }}</h3>
    </header>

    <MessageList :messages="messages" :members="chatMembers" />

    <MessageInput @send="$emit('send', $event)" />
  </div>
</template>

<script setup lang="ts">
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
import { listenMessages } from '@/composables/useChats'
import type { Chat, ChatMessage } from '@/types/chat'
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import { getUserInfo } from '@/composables/userInfo'

const props = defineProps<{
  chat: Chat
}>()

const messages = ref<ChatMessage[]>([])
const chatMembers: any = reactive({})
let unsubscribe: null | (() => void) = null

onMounted(() => {
  unsubscribe = listenMessages(props.chat.id, (msgs: any[]) => {
    messages.value = msgs.map((m) => ({
      ...m,
      timestamp: m.timestamp?.toDate ? m.timestamp.toDate() : m.timestamp,
    }))
  })

  props.chat.participants.forEach(async (p) => {
    const member = await getUserInfo(p)
    chatMembers[p] = member
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
})

defineEmits(['close', 'send'])
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}
header {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #8000ff;
  color: white;
}
header h3 {
  margin-left: 8px;
  font-size: 16px;
}
</style>
