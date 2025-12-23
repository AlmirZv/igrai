<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { auth, db } from '@/config/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { findOrCreatePrivateChat } from '@/composables/useChats'
import { useNavigation } from '@/composables/useNavigation'
import Avatar from '../../Profile/Avatar.vue'
import type { UserProfile } from '@/types/profile'
import { Button } from '@/designSystem/components'

interface UserData {
  id: string
  name: string
  avatar: string // emoji или url
  status?: string
}

const props = defineProps<{
  user: UserData
}>()

const userInfo = ref<UserProfile | null>(null)
onMounted(async () => {
  const uid = props.user.id
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)

  if (snap.exists()) {
    userInfo.value = snap.data() as UserProfile
  }
})
console.log(props.user)

const emit = defineEmits<{
  (e: 'message', userId: string): void
}>()

const isSending = ref(false)
const { openChat } = useNavigation()

// временные данные
const rating = ref(4.5)
const reviews = ref([
  { id: 1, text: 'Отличный человек 👌', author: 'Алиса' },
  { id: 2, text: 'Всегда помогает 👍', author: 'Макс' },
])

async function sendMessage() {
  if (isSending.value) return

  try {
    isSending.value = true

    // Находим или создаем приватный чат с пользователем
    const chat = await findOrCreatePrivateChat(props.user.id)

    // Открываем чат через навигацию
    openChat(chat.id)

    // Эмитим событие для обратной совместимости (если нужно)
    emit('message', props.user.id)
  } catch (error) {
    console.error('Ошибка при открытии чата:', error)
    // Можно показать уведомление об ошибке
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <Avatar v-if="userInfo" :user="userInfo" :show-personal-info="false" />
  <!-- Отзывы -->
  <div class="reviews">
    <h4>Отзывы:</h4>
    <ul>
      <li v-for="r in reviews" :key="r.id">
        <span class="review-text">"{{ r.text }}"</span>
        <span class="review-author">— {{ r.author }}</span>
      </li>
    </ul>
  </div>
  <!-- Кнопка  v-if="user.id !== auth.currentUser?.uid" -->
  <Button @click="sendMessage" :disabled="isSending">
    {{ isSending ? '⏳...' : 'Сообщение 💬' }}
  </Button>
</template>

<style scoped>
.popup {
  width: max-content;
}
.reviews {
  margin-top: var(--space-sm);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}
.reviews h4 {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: bold;
}
.reviews ul {
  padding: 0;
  margin: 0;
  list-style: none;
}
.reviews li {
  margin-bottom: 4px;
}
.review-text {
  font-style: italic;
}
.review-author {
  margin-left: 4px;
  color: var(--text-accent);
}
</style>
