<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import AuthView from './views/AuthView.vue'
import MainMapView from './views/MainView.vue'
import { getUserInfo } from '@/composables/userInfo'
import userComposable from '@/composables/userInfo'

import { socket } from '@/socket'

const user = ref(auth.currentUser)

// Remove any existing listeners
socket.off()

onMounted(async () => {
  // Listen for auth state changes
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    if (currentUser) {
      socket.connect()
    }
    if (Object.keys(userComposable().state.user.value).length == 0) {
      getUserInfo()
    }
  })

  // Connect to WebSocket if user is already logged in
  if (user.value) {
    socket.connect()
  }
})
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
  padding: 0;
  /* если нужно убрать внутренние отступы тоже */
}
</style>
