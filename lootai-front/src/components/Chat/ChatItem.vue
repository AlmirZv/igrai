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
  padding: var(--space-xs);
  cursor: pointer;
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
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}
.badge {
  margin-left: var(--space-xs);
  padding: 2px 6px;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
  background: var(--accent-primary);
  color: var(--text-onAccent);
}
</style>
