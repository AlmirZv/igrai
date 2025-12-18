<template>
  <div class="error-state">
    <slot />
  </div>
</template>

<style lang="css">
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  font-family: var(--font-family-brand);
  color: var(--state-error);
  text-align: center;
}
</style>
