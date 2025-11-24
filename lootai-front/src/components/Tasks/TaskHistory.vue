<template>
  <details class="section">
    <summary>
      <span class="title">{{ title }}</span>
      <span class="arrow">▸</span>
    </summary>

    <div class="content">
      <TaskGroup title="Задачи" :tasks="history.user" @open="$emit('open', $event)" />
      <TaskGroup title="Общественные" :tasks="history.public" @open="$emit('open', $event)" />
      <TaskGroup title="Квесты" :tasks="history.quest" @open="$emit('open', $event)" />
      <TaskGroup title="События" :tasks="history.event" @open="$emit('open', $event)" />
    </div>
  </details>
</template>

<script setup>
import TaskGroup from './TaskGroup.vue'

const props = defineProps({
  title: { type: String, default: 'История' },
  history: { type: Object, default: () => ({ user: [], public: [], quest: [], event: [] }) },
})

defineEmits(['open'])
</script>

<style scoped>
.section {
  border: 1px solid #ddd;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  background: #fdfdfd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
}
.section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 12px 16px;
  font-weight: 600;
  background: #f0f4f8;
  user-select: none;
  transition: background 0.2s;
  border-bottom: 1px solid #ddd;
}
summary:hover {
  background: #e0e7ef;
}

.arrow {
  transition: transform 0.3s ease;
}
details[open] .arrow {
  transform: rotate(90deg);
}

.content {
  padding: 8px 16px;
  animation: fadeIn 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
