import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

import App from './App.vue'
import router from './router'
import { auth, db } from './config/firebase'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Ensure user profile exists on first registration/sign-in
onAuthStateChanged(auth, async (fbUser) => {
  try {
    if (!fbUser) return
    const userRef = doc(db, 'users', fbUser.uid)
    const snap = await getDoc(userRef)
    if (!snap.exists()) {
      await setDoc(userRef, {
        name: fbUser.displayName || 'User',
        email: fbUser.email || '',
        avatar: 'default-purple',
        xp: 0,
        points: 0,
        tasksCompleted: { public: 0, user: 0, quest: 0 },
        achievements: [],
        inventory: [],
        createdAt: new Date().toISOString(),
      })
    }
  } catch (e) {
    console.error('Failed to ensure user profile:', e)
  }
})
