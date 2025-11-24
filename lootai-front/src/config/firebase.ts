import { initializeApp } from 'firebase/app'
import { initializeFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAw8aViuoJ2c6bVSeiHwMj6GultYGTydkA',
  authDomain: 'lootai-ba4a1.firebaseapp.com',
  projectId: 'lootai-ba4a1',
  storageBucket: 'lootai-ba4a1.firebasestorage.app',
  messagingSenderId: '192375854301',
  appId: '1:192375854301:web:b02c4bdf7cb55ef7853734',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
})
export const auth = getAuth(app)
export const storage = getStorage(app)

export default app
