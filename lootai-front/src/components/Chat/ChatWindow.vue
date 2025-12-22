<template>
  <div class="chat-window">
    <header>
      <Text variant="h3">{{ chat.name }}</Text>
      <Button @click="$emit('close')">←</Button>
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
import { Button, Text } from '@/designSystem/components'

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
  justify-content: space-between;
  background: linear-gradient(135deg, var(--bg-surface), var(--bg-overlay));
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: blur(16px);
  padding: var(--space-sm);
}
</style>
