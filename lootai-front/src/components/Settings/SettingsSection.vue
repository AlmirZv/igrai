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
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 6px;
}
summary {
  font-weight: bold;
  cursor: pointer;
  padding: 4px;
}
.content {
  margin-top: 8px;
  padding-left: 6px;
}
</style>
