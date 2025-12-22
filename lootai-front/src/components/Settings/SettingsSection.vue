<template>
  <details class="section" :open="open">
    <summary>{{ title }}</summary>
    <div class="content">
      <slot />
    </div>
  </details>
</template>

<script setup>
defineProps({
  title: String,
  open: { type: Boolean, default: false },
})
</script>

<style scoped>
.section {
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
}
summary {
  font-weight: var(--font-weight-bold);
  cursor: pointer;
}
</style>
