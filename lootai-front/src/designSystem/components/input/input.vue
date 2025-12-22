<template>
  <input
    class="input"
    v-bind="$attrs"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :style="width ? `width:${width}px` : '100%'"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string | Number
  width?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<style lang="css">
.input {
  width: 100%;
  padding: var(--space-sm);
  border-radius: var(--radius-md);

  background: var(--bg-surface);
  color: var(--text-primary);

  border: 1px solid var(--input-border, var(--border-subtle));
  font-size: var(--font-size-md);

  transition:
    border-color var(--motion-duration-fast) var(--motion-easing-standard),
    background var(--motion-duration-fast) var(--motion-easing-standard);
}

.input:focus {
  outline: none;
  border-color: var(--input-border-focus, var(--accent-primary));
}

.input:disabled {
  background: var(--bg-overlay);
  color: var(--text-muted);
  cursor: not-allowed;
}
</style>
