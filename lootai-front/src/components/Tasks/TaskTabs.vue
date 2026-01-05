<template>
  <div class="tabs">
    <div class="indicator" :class="modelValue"></div>

    <Button
      class="tab"
      :class="{ active: modelValue === 'taken' }"
      @click="$emit('update:modelValue', 'taken')"
    >
      {{ $t(`tasks.tabs.taken`) }}
    </Button>

    <Button
      class="tab"
      :class="{ active: modelValue === 'created' }"
      @click="$emit('update:modelValue', 'created')"
    >
      {{ $t(`tasks.tabs.created`) }}
    </Button>
  </div>
</template>

<script setup>
import { Button } from '@/designSystem/components'
defineProps({
  modelValue: String,
  required: true,
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.tabs {
  position: relative;
  display: flex;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 2px;
  background: var(--bg-overlay);
  margin: var(--space-lg);
}

.indicator {
  position: absolute;
  top: 2px;
  bottom: 2px;
  width: calc(50% - 2px);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  transition: transform var(--motion-duration-slow) var(--motion-easing-standart);
  z-index: 0;
}

.indicator.taken {
  transform: translateX(0);
}

.indicator.created {
  transform: translateX(100%);
}

.tab {
  flex: 1;
  background: transparent;
  z-index: 1;
  color: var(--text-muted);
}

.tab.active {
  color: var(--text-primary);
  box-shadow: none;
  transform: none;
}
</style>
