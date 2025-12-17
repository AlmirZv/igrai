<template>
  <div
    class="inline"
    :class="[align && `inline--align-${align}`]"
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
    gap?: 'xs' | 'sm' | 'md' | 'lg'
    align?: 'start' | 'center' | 'end' | 'stretch'
  }>(),
  {
    gap: 'sm',
    align: 'center',
  },
)

const gapVar = computed(() => `var(--space-${props.gap})`)
</script>

<style lang="css">
.inline {
  display: flex;
  flex-direction: row;
}

.inline--align-start {
  align-items: flex-start;
}

.inline--align-center {
  align-items: center;
}

.inline--align-end {
  align-items: flex-end;
}

.inline--align-stretch {
  align-items: stretch;
}
</style>
