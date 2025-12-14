import { reactive, toRefs, inject } from 'vue'
import type { UserProfile } from '@/types/profile'
import {
  collection,
  getDocs,
  query,
  addDoc,
  Timestamp,
  where,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore'
import { db, auth } from '@/config/firebase'

const state = reactive({
  authorized: false,

  user: {} as UserProfile,
  age: 0,
})
export async function getUserInfo(id?: string) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')
  const uid = auth.currentUser?.uid

  const tasksRef = doc(db, 'users', id ? id : uid)

  const snap = await getDoc(tasksRef)
  const user = snap.data() as UserProfile
  state.user = user

  const age = calculateAge(user.birthday)
  state.age = age
  return user
}

export async function updateUserXp(uid: string, newxp: number, newpoints?: number) {
  if (!auth.currentUser) throw new Error('Необходимо войти в систему')

  const userRef = doc(db, 'users', uid)

  const snap = await getDoc(userRef)
  const userData = snap.data()

  const xp = userData?.xp + newxp
  const points = userData?.points + (newpoints ?? 0)

  await updateDoc(userRef, {
    xp, // обновляем массив целиком, но меняется только нужный объект
    points, // обновляем массив целиком, но меняется только нужный объект
    updatedAt: Timestamp.now(),
  })
}

function calculateAge(timestamp: UserProfile['birthday']) {
  const birthDate = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6)
  // Создаем объект Date из timestamp
  const today = new Date() // Получаем текущую дату

  let age = today.getFullYear() - birthDate.getFullYear() // Вычисляем разницу в годах
  const monthDiff = today.getMonth() - birthDate.getMonth() // Разница в месяцах
  const dayDiff = today.getDate() - birthDate.getDate() // Разница в днях

  // Корректируем возраст, если день рождения еще не наступил в этом году
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--
  }
  return age
}

export default () => {
  const saveUserInfo = async (uInfo: UserProfile) => {
    state.user = uInfo
  }

  return {
    state: toRefs(state),
  }
}
