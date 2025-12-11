<template>
  <li class="chat-item" @click="$emit('open', chat)">
    <div class="avatar">{{ chat.avatar || '👤' }}</div>
    <div class="info">
      <div class="top">
        <div class="name">{{ chat.name }}</div>
        <span v-if="chat.unread > 0" class="badge">{{ chat.unread }}</span>
      </div>
      <div class="last-message">{{ chat.lastMessage.text }}</div>
    </div>
  </li>
</template>

<script setup>
defineProps({
  chat: {
    type: Object,
    required: true,
    // структура:
    // { id, name, avatar, lastMessage, messages, unread }
  },
})
defineEmits(['open'])
</script>

<style scoped>
.chat-item {
  display: flex;
  align-items: center;
  padding: 6px;
  cursor: pointer;
}
.chat-item:hover {
  background: #f0f0f0;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #8000ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.name {
  font-weight: bold;
}
.last-message {
  font-size: 12px;
  color: #666;
}
.badge {
  background: red;
  color: white;
  font-size: 11px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 12px;
  min-width: 18px;
  text-align: center;
}
</style>
