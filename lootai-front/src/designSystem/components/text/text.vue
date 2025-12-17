<template>
  <component :is="tag" class="text" :class="[`text--${variant}`, color && `text--color-${color}`]">
    <slot />
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'app-title' | 'app-subtitle' | 'h1' | 'h2' | 'body' | 'body-muted' | 'caption'
    color?: 'primary' | 'secondary' | 'accent' | 'muted'
    as?: string
  }>(),
  {
    variant: 'body',
  },
)

const tagMap: Record<string, string> = {
  'app-title': 'h1',
  'app-subtitle': 'p',
  h1: 'h1',
  h2: 'h2',
  body: 'p',
  'body-muted': 'p',
  caption: 'span',
}

const tag = props.as || tagMap[props.variant] || 'p'
</script>

<style lang="css">
.text {
  margin: 0;
}

/* variants */

.text--h1 {
  font-family: var(--font-family-brand);
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  line-height: var(--font-lineHeight-tight);
}

.text--h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.text--body {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);
}

.text--body-muted {
  font-size: var(--font-size-md);
  color: var(--text-muted);
}

.text--caption {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

/* colors */

.text--color-primary {
  color: var(--text-primary);
}

.text--color-secondary {
  color: var(--text-secondary);
}

.text--color-accent {
  color: var(--accent-primary);
}

.text--color-muted {
  color: var(--text-muted);
}

.text--app-title {
  font-family: var(--font-family-brand);
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--accent-primary);
  margin-bottom: var(--space-sm);
}

.text--app-subtitle {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);
  color: var(--text-primary);
}
</style>
