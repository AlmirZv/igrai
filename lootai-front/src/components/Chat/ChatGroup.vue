<template>
  <section class="section">
    <header class="header" @click="open = !open">
      <span class="title">{{ title }}</span>
      <div class="actions" @click.stop>
        <!-- Стрелка -->
        <span class="arrow" :class="{ open }">▸</span>
      </div>
    </header>

    <transition name="fade">
      <div v-show="open" class="content">
        <!-- <LoadingSpinner v-if="loading">Загрузка...</LoadingSpinner> -->

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
      </div>
    </transition>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import ChatItem from './ChatItem.vue'
import { LoadingSpinner } from '@/designSystem/components'

defineProps({
  title: String,
  chats: Array,
})
defineEmits(['open'])
const open = ref(false)
</script>

<style scoped>
.section {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: var(--space-md) var(--space-lg);
  font-weight: var(--font-weight-semibold);
  user-select: none;
}
/* Правая группа кнопок */
.actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.archive-btn {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background: transparent;
  border: none;
  padding: var(--space-xxs) var(--space-xs);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background var(--motion-duration-fast);
}

.archive-btn:hover {
  background: var(--bg-overlay-hover);
  color: var(--text-primary);
}
.arrow {
  transition: transform var(--motion-duration-fast);
}
.arrow.open {
  transform: rotate(90deg);
}

.content {
  padding: var(--space-sm) var(--space-lg);
  border-top: 1px solid var(--border-subtle);
}

.task-item {
  padding: var(--space-sm) 0;
  cursor: pointer;
  transition: background var(--motion-duration-fast);
}

.task-item:hover {
  background: var(--bg-overlay-hover);
}

.empty {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  text-align: center;
  padding: var(--space-sm) 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all var(--motion-duration-slow);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
