<template>
  <div class="tabs">
    <button
      :class="{ active: modelValue === 'taken' }"
      class="tab left"
      @click="$emit('update:modelValue', 'taken')"
    >
      Исполнитель
    </button>
    <button
      :class="{ active: modelValue === 'created' }"
      class="tab right"
      @click="$emit('update:modelValue', 'created')"
    >
      Создатель
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.tabs {
  display: flex;
  /* width: fit-content; */
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #ccc;
  margin: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-family: cursive;
}

.tab {
  flex: 1;
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  background: #f5f5f5;
  color: #333;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.tab:hover {
  background: #e8f0ff;
}

.tab.active {
  background: linear-gradient(135deg, #6a9cff, #783ff0);
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.left {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.right {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}
</style>
