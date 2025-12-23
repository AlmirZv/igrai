<!-- src/designSystem/components/Card/Card.vue -->
<template>
  <div class="card">
    <slot />
  </div>
</template>

<style lang="css">
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  width: 100%;
  /* max-height: calc(100vh - var(--space-xl) * 2); */
  display: flex;
  flex-direction: column;
  min-width: max-content;
}
.card--elevated {
  box-shadow: var(--shadow-lg);
}
</style>
