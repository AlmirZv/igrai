<template>
  <nav class="bottom-nav">
    <div class="bottom-nav__items">
      <button
        v-for="item in items"
        :key="item.id"
        class="bottom-nav__item"
        :class="{ 'is-active': modelValue === item.id }"
        @click="onSelect(item.id)"
        :aria-current="modelValue === item.id ? 'page' : undefined"
      >
        <span class="bottom-nav__icon">
          <component v-if="isComponent(item.icon)" :is="item.icon" />
          <span v-else>{{ item.icon }}</span>
        </span>

        <span class="bottom-nav__label">
          {{ item.label }}
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface BottomNavItem {
  id: string
  label: string
  icon: string | Component
}

const props = defineProps<{
  items: BottomNavItem[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const onSelect = (id: string) => {
  emit('update:modelValue', id)
}

const isComponent = (icon: unknown): icon is Component =>
  typeof icon === 'object' || typeof icon === 'function'
</script>

<style lang="css">
.bottom-nav {
  position: fixed;
  bottom: 0;
  inset-inline: 0;

  /* background: var(--bg-surface); */
  background: linear-gradient(135deg, var(--bg-surface), var(--bg-overlay));

  border-top: 1px solid var(--border-subtle);
  backdrop-filter: blur(16px);

  padding: var(--space-sm);
}

.bottom-nav__items {
  display: flex;
  justify-content: space-around;
  gap: var(--space-xs);
  max-width: 640px;
  margin: 0 auto;
}

.bottom-nav__item {
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xxs);

  padding: var(--space-xs);
  border-radius: var(--radius-md);

  background: transparent;
  border: none;
  cursor: pointer;

  color: var(--text-secondary);
  transition: all var(--motion-duration-fast) var(--motion-easing-standard);
}
.bottom-nav__item.is-active {
  background: var(--accent-primary);
  color: var(--text-onAccent);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
.bottom-nav__icon {
  font-size: clamp(1rem, 4vw, 1.4rem);
}

.bottom-nav__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}
</style>
