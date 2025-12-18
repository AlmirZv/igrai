<template>
  <div class="stat">
    <Text class="stat__value" variant="h3" color="primary">
      {{ value }}
    </Text>

    <Text class="stat__label" variant="caption" color="secondary">
      {{ label }}
    </Text>
  </div>
</template>

<script setup lang="ts">
import { Text } from '@/designSystem/components'

defineProps<{
  label: string
  value: string | number
}>()
</script>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xxs);

  padding: var(--space-sm);
  border-radius: var(--radius-md);

  background: var(--bg-overlay);
}

.stat__value {
  line-height: 1;
}

.stat__label {
  text-align: center;
}
</style>
