<template>
  <!-- Bottom Menu -->
  <div class="bottom-menu">
    <div class="menu-items">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="selectMenu(item.id)"
        :class="['menu-item', { active: selectedMenu === item.id }]"
        :title="item.label"
      >
        <div class="menu-icon">{{ item.icon }}</div>
        <div class="menu-label">{{ item.label }}</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const selectedMenu = ref('map')
const emit = defineEmits(['changePage'])

// Menu items
const menuItems = [
  { id: 'map', icon: '🗺️', label: 'Карта' },
  { id: 'user', icon: '👤', label: 'Профиль' },
  { id: 'tasks', icon: '📋', label: 'Задачи' },
  { id: 'chats', icon: '💬', label: 'Чаты' },
  { id: 'settings', icon: '⚙️', label: 'Настройки' },
]

const selectMenu = (menuId: string) => {
  selectedMenu.value = menuId
  emit('changePage', menuId)
  // Здесь будет логика переключения между разделами
}
</script>

<style scoped>
.bottom-menu {
  background: linear-gradient(180deg, rgba(37, 185, 160, 0.1) 0%, rgb(29 28 28 / 0%) 100%);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(37, 185, 160, 0.2);
  padding: 0.75rem 0.5rem;
  z-index: 1000;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
}

.menu-items {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  gap: 0.5rem;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
  min-width: 0;
  max-width: 90px;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(37, 185, 160, 0.1) 0%, rgba(30, 151, 131, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.menu-item:hover::before {
  opacity: 1;
}

.menu-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 185, 160, 0.2);
}

.menu-item.active {
  background: linear-gradient(135deg, #25b9a0 0%, #1e9783 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(37, 185, 160, 0.4);
}

.menu-item.active::before {
  opacity: 0;
}

.menu-icon {
  font-size: 1.4rem;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.menu-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-align: center;
  position: relative;
  z-index: 1;
  color: #e5e7eb;
  letter-spacing: 0.3px;
}

.menu-item.active .menu-label {
  color: white;
  font-weight: 700;
}

/* Планшеты */
@media (max-width: 768px) {
  .menu-items {
    gap: 0.25rem;
  }

  .menu-item {
    padding: 0.4rem 0.2rem;
    max-width: 80px;
  }

  .menu-icon {
    font-size: 1.2rem;
  }

  .menu-label {
    font-size: 0.65rem;
  }
}

/* Мобильные устройства */
@media (max-width: 480px) {
  .bottom-menu {
    padding: 0.5rem 0.25rem;
  }

  .menu-items {
    gap: 0.1rem;
  }

  .menu-item {
    padding: 0.35rem 0.15rem;
    max-width: 65px;
  }

  .menu-icon {
    font-size: 1.1rem;
  }

  .menu-label {
    font-size: 0.6rem;
    line-height: 1.1;
  }
}

/* Маленькие экраны */
@media (max-width: 360px) {
  .menu-item {
    padding: 0.3rem 0.1rem;
    max-width: 55px;
  }

  .menu-icon {
    font-size: 1rem;
  }

  .menu-label {
    font-size: 0.55rem;
  }

  .bottom-menu {
    padding: 0.4rem 0.2rem;
  }
}

/* Очень маленькие экраны */
@media (max-width: 320px) {
  .menu-item {
    padding: 0.25rem 0.05rem;
    max-width: 50px;
  }

  .menu-icon {
    font-size: 0.9rem;
  }

  .menu-label {
    font-size: 0.5rem;
  }

  .bottom-menu {
    padding: 0.3rem 0.15rem;
  }
}

/* Скрываем лейблы на очень маленьких экранах */
@media (max-width: 280px) {
  .menu-label {
    display: none;
  }

  .menu-item {
    padding: 0.4rem 0.1rem;
    max-width: 45px;
  }

  .menu-icon {
    font-size: 1rem;
  }
}
</style>
