<template>
  <details class="section">
    <summary>
      <span class="title">{{ title }}</span>
      <span class="arrow">▸</span>
    </summary>

    <div class="content">
      <div v-if="loading" class="loading">Загрузка...</div>

      <ul v-else>
        <li v-for="task in tasks" :key="task.id" class="task-item" @click="$emit('open', task)">
          {{ task.title }}
        </li>
        <li v-if="!tasks || !tasks.length" class="empty">Нет задач</li>
      </ul>
    </div>
  </details>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Задачи' },
  tasks: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
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
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  background: #ffffff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px 12px;
  margin: 6px 0;
  cursor: pointer;
  transition: all 0.2s;
}
.task-item:hover {
  background: #f0faff;
  transform: translateX(4px);
}

.empty {
  color: #888;
  font-size: 13px;
  text-align: center;
  margin: 6px 0;
}

.loading {
  color: #25b9a0;
  font-size: 13px;
  font-style: italic;
  padding: 8px 0;
  text-align: center;
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
