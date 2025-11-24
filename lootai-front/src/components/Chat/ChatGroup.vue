<template>
  <details class="section">
    <summary>{{ title }}</summary>
    <ul>
      <ChatItem
        v-for="chat in chats"
        class="item"
        :key="chat.id"
        :chat="chat"
        @open="$emit('open', chat)"
      />
      <li v-if="!chats.length" class="empty">Нет чатов</li>
    </ul>
  </details>
</template>

<script setup>
import ChatItem from './ChatItem.vue'

defineProps({
  title: String,
  chats: Array,
})
defineEmits(['open'])
</script>

<style scoped>
.section {
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 6px;
}
summary {
  font-weight: bold;
  cursor: pointer;
  padding: 4px;
}
ul {
  padding-left: 10px;
}
.item {
  padding-left: 10px;
}
.empty {
  color: #888;
  font-size: 13px;
}
</style>
