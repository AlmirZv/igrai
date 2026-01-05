<template>
  <component
    :is="tag"
    class="text"
    :class="[
      `text--${variant}`,
      color && `text--color-${color}`,
      letterSpacing && `text--letterSpacing-${letterSpacing}`,
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?:
      | 'app-title'
      | 'app-subtitle'
      | 'h1'
      | 'h2'
      | 'h3'
      | 'h4'
      | 'body'
      | 'body-muted'
      | 'caption'
      | 'p'
    color?: 'primary' | 'secondary' | 'accent' | 'muted'
    as?: string
    letterSpacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
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
  h3: 'h4',
  h4: 'h4',
  body: 'p',
  'body-muted': 'p',
  caption: 'span',
}

const tag = props.as || tagMap[props.variant] || 'p'
</script>

<style lang="css">
.text {
  margin: 0;
  max-width: 100%;
  min-width: 0;

  /* allow long strings (e.g. URLs) to wrap on small screens */
  white-space: normal;
  overflow-wrap: anywhere;

  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  display: block;
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

.text--h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.text--h4 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
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
  color: var(--text-accent);
}

.text--color-muted {
  color: var(--text-muted);
}

/* letter spacing */

.text--letterSpacing-xs {
  letter-spacing: var(--font-letterSpacing-xs);
}

.text--letterSpacing-sm {
  letter-spacing: var(--font-letterSpacing-sm);
}

.text--letterSpacing-md {
  letter-spacing: var(--font-letterSpacing-md);
}

.text--letterSpacing-lg {
  letter-spacing: var(--font-letterSpacing-lg);
}

.text--letterSpacing-xl {
  letter-spacing: var(--font-letterSpacing-xl);
}

.text--letterSpacing-xxl {
  letter-spacing: var(--font-letterSpacing-xxl);
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

.text--app-p {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  color: var(--text-primary);
}
</style>
