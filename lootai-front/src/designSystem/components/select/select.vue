<template>
  <div class="select-wrapper">
    <select
      class="select"
      v-bind="$attrs"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      :style="width ? `width:${width}px` : '100%'"
    >
      <slot />
    </select>

    <!-- кастомная стрелка -->
    <span class="select-arrow">▾</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string
  width?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<style lang="css">
.select-wrapper {
  position: relative;
  width: 100%;
}

.select {
  appearance: none;
  width: 100%;
  padding: var(--space-sm);
  padding-right: 2.5rem;

  border-radius: var(--radius-md);
  border: 1px solid var(--input-border, var(--border-subtle));

  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-md);

  cursor: pointer;

  transition:
    border-color var(--motion-duration-fast) var(--motion-easing-standard),
    background var(--motion-duration-fast) var(--motion-easing-standard);
}

.select:focus {
  outline: none;
  border-color: var(--input-border-focus, var(--accent-primary));
}

.select:disabled {
  background: var(--bg-overlay);
  color: var(--text-muted);
  cursor: not-allowed;
}

/* стрелка */
.select-arrow {
  position: absolute;
  right: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-muted);
  font-size: 0.75rem;
}
</style>
