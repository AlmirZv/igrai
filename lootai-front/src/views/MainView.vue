<template>
  <div class="main-container">
    <!-- <Header /> -->

    <component :is="currentView" />

    <BottomNav :items="navItems" v-model="activeMenu" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { auth } from '../config/firebase'

import Header from '../components/Header.vue'
import Map from '../components/Map/Map.vue'
import Tasks from '../components/Tasks/Tasks.vue'
import Settings from '../components/Settings/SettingsPage.vue'
import Chats from '../components/Chat/ChatPage.vue'
import Profile from '../components/Profile/Profile.vue'

import { BottomNav } from '@/designSystem/components'
import { useNavigation } from '@/composables/useNavigation'

import type { PageName } from '@/composables/useNavigation'
import type { Component } from 'vue'

const { currentPage, navigateToPage } = useNavigation()

const currentView = computed(() => {
  return pageToComponentMap[currentPage.value]
})
const userName = ref('Герой')
const userLevel = ref(1)

const navItems: { id: MenuId; icon: string; label: string }[] = [
  { id: 'map', icon: '🗺️', label: 'Карта' },
  { id: 'user', icon: '👤', label: 'Профиль' },
  { id: 'tasks', icon: '📋', label: 'Задачи' },
  { id: 'chats', icon: '💬', label: 'Чаты' },
  { id: 'settings', icon: '⚙️', label: 'Настройки' },
]

const menuToPageMap = {
  map: 'Map',
  user: 'Profile',
  tasks: 'Tasks',
  chats: 'Chats',
  settings: 'Settings',
} as const
type MenuId = keyof typeof menuToPageMap

const activeMenu = computed<MenuId>({
  get: () => {
    const entry = Object.entries(menuToPageMap).find(([, page]) => page === currentPage.value)

    return (entry?.[0] as MenuId) ?? 'map'
  },
  set: (menuId) => {
    navigateToPage(menuToPageMap[menuId])
  },
})

const pageToComponentMap: Record<PageName, Component> = {
  Map,
  Chats,
  Profile,
  Tasks,
  Settings,
}

onMounted(() => {
  if (auth.currentUser) {
    userName.value = auth.currentUser.displayName || 'Герой'
  }
})
</script>

<style scoped>
.main-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--bg-app) 0%, var(--bg-surface) 100%);
  overflow: hidden;
  width: 100vw;
  max-width: 100vw;
}
</style>
