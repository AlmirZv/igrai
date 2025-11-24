<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import AuthView from './views/AuthView.vue'
import MainMapView from './views/MainView.vue'
import { websocketService } from './services/websocket'
import { getUserInfo } from '@/composables/userInfo'
import userComposable from '@/composables/userInfo'

const user = ref(auth.currentUser)
const isConnected = ref(false)
const connectionStatus = ref('Disconnected')

onMounted(async () => {
  // Listen for auth state changes
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    if (currentUser) {
      connectWebSocket()
    }
    if (Object.keys(userComposable().state.user.value).length == 0) {
      getUserInfo()
    }
  })

  // Connect to WebSocket if user is already logged in
  if (user.value) {
    connectWebSocket()
  }
})

const connectWebSocket = async () => {
  try {
    await websocketService.connect()
    isConnected.value = true
    connectionStatus.value = 'Connected'

    // Listen for real-time updates
    websocketService.on('locationUpdate', (data) => {
      // console.log('Location update received:', data)
    })

    websocketService.on('message', (data) => {
      console.log('Message received:', data)
    })

    // Listen for bot events
    websocketService.on('botCreated', (data) => {
      console.log('Bot created:', data)
    })

    websocketService.on('botRemoved', (data) => {
      console.log('Bot removed:', data)
    })
  } catch (error) {
    console.error('Failed to connect to WebSocket:', error)
    connectionStatus.value = 'Connection failed'
  }
}
</script>

<template>
  <div class="app">
    <AuthView v-if="!user" />
    <MainMapView v-else />
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>

<style>
body {
  margin: 0;
  padding: 0; /* если нужно убрать внутренние отступы тоже */
}
</style>
