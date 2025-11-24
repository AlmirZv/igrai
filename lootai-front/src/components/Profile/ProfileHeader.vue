<template>
  <div class="profile-header">
    <div class="avatar" :style="{ backgroundImage: `url(${avatarUrl})` }"></div>
    <div>
      <h2 class="username">{{ user.name }}</h2>
      <p class="email">{{ user.email }}</p>
      <p class="email">Возраст: {{ user.age }}</p>
      <p class="email">Пол: {{ user.gender }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserProfile } from '../../types/profile'

const props = defineProps<{ user: UserProfile }>()

const avatarUrl = computed(() =>
  props.user.avatar === 'default-purple'
    ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Roundel-azure.svg/1024px-Roundel-azure.svg.png'
    : props.user.avatar,
)
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 6px;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}
.username {
  font-size: 18px;
  font-weight: bold;
  margin: 0px;
}
.email {
  font-size: 14px;
  color: #9ca3af;
}
</style>
