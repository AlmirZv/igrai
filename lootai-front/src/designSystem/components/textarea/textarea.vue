<template>
  <textarea
    class="textarea"
    v-bind="$attrs"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<style lang="css">
.textarea {
  width: 100%;
  min-height: 80px;
  padding: var(--space-sm);

  border-radius: var(--radius-md);
  border: 1px solid var(--input-border, var(--border-subtle));

  background: var(--bg-surface);
  color: var(--text-primary);

  font-size: var(--font-size-md);
  font-family: var(--font-family-base);
  line-height: 1.5;

  resize: vertical;

  transition:
    border-color var(--motion-duration-fast) var(--motion-easing-standard),
    background var(--motion-duration-fast) var(--motion-easing-standard);
}

.textarea:focus {
  outline: none;
  border-color: var(--input-border-focus, var(--accent-primary));
}

.textarea:disabled {
  background: var(--bg-overlay);
  color: var(--text-muted);
  cursor: not-allowed;
}

.textarea::placeholder {
  color: var(--text-muted);
}
</style>
