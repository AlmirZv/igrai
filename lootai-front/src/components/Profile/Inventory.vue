<template>
  <Card>
    <Stack gap="md">
      <Text variant="h2">Инвентарь</Text>

      <div class="grid" ref="gridRef">
        <Text
          v-for="(item, index) in visibleInventory"
          :key="item.id"
          class="cell"
          @click.stop="selectItem(item)"
        >
          <span class="icon">{{ item.icon }}</span>

          <!-- Tooltip -->
          <Card
            v-if="selectedItem?.id === item.id"
            class="tooltip"
            :class="`tooltip--${tooltipAlign(index)}`"
          >
            <Stack gap="xs">
              <Text variant="h2">{{ item.title }}</Text>
              <Text color="muted">{{ item.from }}</Text>
              <Text variant="app-subtitle">{{ item.description }}</Text>
            </Stack>
          </Card>
        </Text>
      </div>

      <Button
        v-if="inventory.length > DEFAULT_VISIBLE"
        variant="ghost"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Свернуть' : 'Показать все' }}
      </Button>
    </Stack>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { UserProfile } from '../../types/profile'
import { Card, Stack, Text, Button } from '@/designSystem/components'

const props = defineProps<{ user: UserProfile }>()

type InventoryItem = {
  id: string
  icon: string
  title: string
  description: string
  from: string
}

const inventory: InventoryItem[] = [
  {
    id: 'glasses',
    icon: '🕶️',
    title: 'Темные очки',
    description: 'Повышают стиль и скрывают эмоции',
    from: 'admin',
  },
  {
    id: 'gun',
    icon: '🔫',
    title: 'Пистолет',
    description: 'Базовое оружие ближнего боя',
    from: 'admin',
  },
  {
    id: 'glasses2',
    icon: '🕶️',
    title: 'Темные очки',
    description: 'Повышают стиль и скрывают эмоции',
    from: 'admin',
  },
  {
    id: 'gun2',
    icon: '🔫',
    title: 'Пистолет',
    description: 'Базовое оружие ближнего боя',
    from: 'admin',
  },
  {
    id: 'glasses3',
    icon: '🕶️',
    title: 'Темные очки',
    description: 'Повышают стиль и скрывают эмоции',
    from: 'admin',
  },
  {
    id: 'gun3',
    icon: '🔫',
    title: 'Пистолет',
    description: 'Базовое оружие ближнего боя',
    from: 'admin',
  },
]

const DEFAULT_VISIBLE = 4

const expanded = ref(false)

const visibleInventory = computed(() =>
  expanded.value ? inventory : inventory.slice(0, DEFAULT_VISIBLE),
)

const selectedItem = ref<InventoryItem | null>(null)
const gridRef = ref<HTMLElement | null>(null)

const selectItem = (item: InventoryItem) => {
  selectedItem.value = selectedItem.value?.id === item.id ? null : item
}

const onClickOutside = (e: MouseEvent) => {
  if (!gridRef.value) return
  if (!gridRef.value.contains(e.target as Node)) {
    selectedItem.value = null
  }
}

const tooltipAlign = (index: number) => {
  const columns = 4
  const col = index % columns

  if (col === 0) return 'left'
  if (col === columns - 1) return 'right'
  return 'center'
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.cell {
  position: relative;
  height: 70px;
  background: var(--bg-overlay);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.cell:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.tooltip {
  position: absolute;
  bottom: calc(100% + var(--space-xs));
  z-index: 20;
  min-width: 180px;
  padding: var(--space-md);
  max-width: min(240px, 90vw);
  opacity: 0;
  transform: translateY(4px);
  animation: tooltip-in 0.15s ease-out forwards;
}

@keyframes tooltip-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* центр */
.tooltip--center {
  /* left: 50%; */
  transform: translateX(-50%);
}

/* слева */
.tooltip--left {
  min-width: 200px;
  left: 0;
  transform: translateX(0);
}

/* справа */
.tooltip--right {
  right: 0;
  left: auto;
  transform: translateX(0);
}
</style>
