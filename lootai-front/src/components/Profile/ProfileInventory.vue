<template>
  <div class="inventory">
    <h3 class="sectionName">Инвентарь</h3>
    <div class="grid">
      <div v-for="item in pagedInventory" :key="item.id" class="cell">
        <img v-if="item.icon" :src="item.icon" alt="" />
        <span v-else>{{ item.name }}</span>
      </div>
    </div>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="prevPage">◀</button>
      <span>Стр. {{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="nextPage">▶</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserProfile } from '../../types/profile'

const props = defineProps<{ user: UserProfile }>()

const currentPage = ref(1)
const itemsPerPage = 16

const totalPages = computed(() => Math.ceil(props.user.inventory.length / itemsPerPage))

const pagedInventory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return props.user.inventory.slice(start, start + itemsPerPage)
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>

<style scoped>
.inventory {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 6px;
}
.sectionName {
  margin: 0px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
.cell {
  height: 70px;
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  text-align: center;
  color: #e5e7eb;
}
.cell img {
  max-width: 60%;
  max-height: 60%;
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.pagination button {
  border: 1px solid #374151;
  padding: 4px 8px;
  border-radius: 6px;
  background: #0b0b0b;
  color: #e5e7eb;
}
.pagination button:disabled {
  opacity: 0.5;
}
</style>
