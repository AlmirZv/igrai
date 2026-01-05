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
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* allow cards (e.g. modals) to shrink on small screens */
  min-width: 0;
}
.card--elevated {
  box-shadow: var(--shadow-lg);
}
</style>
