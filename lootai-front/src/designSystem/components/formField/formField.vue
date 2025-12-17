<template>
  <div class="form-field" :class="{ 'form-field--error': !!error }">
    <label v-if="label" class="label">
      {{ label }}
    </label>

    <slot />

    <p v-if="error" class="error">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  error?: string
}>()
</script>

<style lang="css">
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);

  /* 🎯 дефолтные переменные */
  --input-border: var(--border-subtle);
  --input-border-focus: var(--accent-primary);
}

/* 🔴 состояние ошибки */
.form-field--error {
  --input-border: var(--state-error);
  --input-border-focus: var(--state-error);
}

.label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.error {
  color: var(--state-error);
  font-size: var(--font-size-sm);
  margin-top: -2px;
  line-height: 1.2;
}
</style>
