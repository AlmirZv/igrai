<template>
  <div class="achievements">
    <h3 class="sectionName">Достижения</h3>
    <ul>
      <li v-for="(ach, index) in user.achievements" :key="index">
        {{ ach }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '../../types/profile'
defineProps<{ user: UserProfile }>()
</script>

<style scoped>
.achievements {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 6px;
}

.sectionName {
  margin: 0px;
}
.achievements h3 {
  margin-bottom: 8px;
}
.achievements ul {
  list-style: disc;
  padding-left: 20px;
}
.achievements li {
  margin-bottom: 4px;
}
</style>
