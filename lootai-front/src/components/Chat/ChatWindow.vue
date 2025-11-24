<template>
  <div class="chat-window">
    <header>
      <button @click="$emit('close')">←</button>
      <h3>{{ chat.name }}</h3>
    </header>

    <MessageList :messages="chat.messages" />

    <MessageInput @send="$emit('send', $event)" />
  </div>
</template>

<script setup>
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'

defineProps({
  chat: Object,
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
