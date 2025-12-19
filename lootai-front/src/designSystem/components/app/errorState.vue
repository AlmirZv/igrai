<template>
  <div class="error-state">
    <slot />
  </div>
</template>

<style lang="css">
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xxl) var(--space-xl);
  color: var(--state-error);
  text-align: center;
}
</style>
