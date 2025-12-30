<template>
  <Stack class="profile" v-if="!isLoading && user">
    <Avatar :user="user" :show-personal-info="true" />
    <Stats :user="user" />
    <Achievements :user="user" />
    <Inventory :user="user" />
  </Stack>
  <LoadingSpinner v-else>{{ $t(`profile.loadingProfile`) }}...</LoadingSpinner>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { LoadingSpinner, Stack } from '@/designSystem/components'
import { auth, db } from '../../config/firebase'
import type { UserProfile } from '../../types/profile'
import Avatar from './Avatar.vue'
import Stats from './Stats.vue'
import Achievements from './Achievements.vue'
import Inventory from './Inventory.vue'
const user = ref<UserProfile | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) {
      isLoading.value = false
      return
    }

    const userRef = doc(db, 'users', uid)
    const snap = await getDoc(userRef)

    if (snap.exists()) {
      user.value = snap.data() as UserProfile
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    // Fallback to default data if Firestore fails
    user.value = {
      name: auth.currentUser?.displayName || 'User',
      email: auth.currentUser?.email || '',
      age: 27,
      gender: 'male',
      avatar: 'default-purple',
      xp: 0,
      points: 0,
      tasksCompleted: { public: 0, user: 0, quest: 0, event: 0 },
      achievements: [],
      inventory: [
        { id: 1, name: 'test' },
        { id: 2, name: 'test2' },
        { id: 3, name: 'test3' },
      ],
      birthday: {
        seconds: 0,
        nanoseconds: 0,
      },
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.profile {
  padding: var(--space-lg);
  /* font-family: var(--font-family-brand); */
  overflow: auto;
  padding-bottom: 80px;
}
</style>
