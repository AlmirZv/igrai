<template>
  <div class="profile" v-if="!isLoading && user">
    <ProfileHeader :user="user" />
    <ProfileStats :user="user" />
    <ProfileAchievements :user="user" />
    <ProfileInventory :user="user" />
  </div>
  <div v-else class="profile-loading">Загрузка профиля...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import type { UserProfile } from '../../types/profile'
import ProfileHeader from './ProfileHeader.vue'
import ProfileStats from './ProfileStats.vue'
import ProfileAchievements from './ProfileAchievements.vue'
import ProfileInventory from './ProfileInventory.vue'

const user = ref<UserProfile | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) {
      user.value = {
        name: 'Guest',
        email: 'guest@example.com',
        age: 0,
        gender: '',
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
      }
      return
    }

    const userRef = doc(db, 'users', uid)
    const snap = await getDoc(userRef)

    if (snap.exists()) {
      user.value = snap.data() as UserProfile
    } else {
      // Create initial user document if it doesn't exist
      const initialUserData: UserProfile = {
        name: auth.currentUser?.displayName || 'User',
        email: auth.currentUser?.email || '',
        age: 0,
        gender: '',
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
      }

      // Set the document in Firestore
      await setDoc(userRef, initialUserData)
      user.value = initialUserData
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
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.profile {
  padding: 30px 12px 76px;
  color: #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-top: 30px;
  font-family: cursive;
  overflow: auto;
}
.profile-loading {
  margin-top: 30px;
  padding: 24px;
  color: #9ca3af;
  text-align: center;
}

@media (max-width: 480px) {
  .profile {
    padding: 10px 12px 72px;
  }
}
</style>
