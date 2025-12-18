<template>
  <header class="app-header">
    <!-- <h1 class="logo">igrai</h1> -->
    <h1 class="logo">
      <Text variant="h2" color="accent" letter-spacing="lg">igrai</Text>
    </h1>
  </header>
</template>

<script setup>
import { Text } from '@/designSystem/components'
</script>

<style scoped>
.app-header {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.logo {
  position: relative;
  margin: 0;
  padding: 0px var(--space-md);
  font-family: var(--font-family-brand);
  background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-overlay) 100%);
  border-bottom-left-radius: var(--radius-sm);
  border-bottom-right-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border-top-style: none;
}
</style>
