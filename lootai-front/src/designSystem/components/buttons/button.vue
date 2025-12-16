<template>
  <button class="button" :class="`button--${variant}`" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
  },
)
</script>

<style lang="css">
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);

  background: var(--accent-primary);
  color: var(--text-onAccent);

  border: none;
  cursor: pointer;

  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  transition:
    background var(--motion-duration-fast) var(--motion-easing-standard),
    opacity var(--motion-duration-fast) var(--motion-easing-standard),
    transform var(--motion-duration-fast) var(--motion-easing-standard);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button--primary {
  background: var(--accent-primary);
  color: var(--text-onAccent);
}

.button--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.button--secondary {
  background: transparent;
  color: var(--text-accent);
  border: 1px solid var(--accent-primary);
}

.button--secondary:hover:not(:disabled) {
  background: var(--accent-primary);
  color: var(--text-onAccent);
}

.button--ghost {
  background: transparent;
  color: var(--text-secondary);
}
</style>
