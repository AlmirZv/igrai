<template>
  <div
    class="stack"
    :class="[align && `stack--align-${align}`]"
    :style="{
      gap: gapVar,
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    align?: 'start' | 'center' | 'end' | 'stretch'
  }>(),
  {
    gap: 'md',
    align: 'stretch',
  },
)

const gapVar = computed(() => `var(--space-${props.gap})`)
</script>

<style lang="css">
.stack {
  display: flex;
  flex-direction: column;
}

.stack--align-start {
  align-items: flex-start;
}

.stack--align-center {
  align-items: center;
}

.stack--align-end {
  align-items: flex-end;
}

.stack--align-stretch {
  align-items: stretch;
}
</style>
