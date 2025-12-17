<template>
  <div class="main-container">
    <Header />

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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  width: 100vw;
  max-width: 100vw;
}

.map-container {
  flex: 1;
  position: relative;
  background: #000;
  min-height: 0;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
}

.control-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}

.control-btn.bot-btn {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
}

.control-btn.bot-btn:hover {
  background: linear-gradient(135deg, #f57c00 0%, #e65100 100%);
}
</style>
