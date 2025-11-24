<script setup lang="ts">
import { ref } from 'vue'
import { auth } from '@/config/firebase'

interface UserData {
  id: string
  name: string
  avatar: string // emoji или url
  status?: string
}

const props = defineProps<{
  user: UserData
}>()

const emit = defineEmits<{
  (e: 'message', userId: string): void
}>()

const isSending = ref(false)

// временные данные
const rating = ref(4.5)
const reviews = ref([
  { id: 1, text: 'Отличный человек 👌', author: 'Алиса' },
  { id: 2, text: 'Всегда помогает 👍', author: 'Макс' },
])

function sendMessage() {
  isSending.value = true
  emit('message', props.user.id)
  setTimeout(() => (isSending.value = false), 800) // имитация
}
</script>

<template>
  <div class="popup">
    <!-- Аватар -->
    <div class="avatar">
      <!-- <img v-if="user.avatar.startsWith('http')" :src="user.avatar" alt="avatar" /> -->
      <!-- <span v-else class="emoji">{{ user.avatar }}</span> -->
    </div>

    <!-- Инфо -->
    <div class="info">
      <h3 class="name">{{ user.name }}</h3>
      <p v-if="user.status" class="status">{{ user.status }}</p>

      <!-- Рейтинг -->
      <div class="rating">
        <span v-for="n in 5" :key="n" class="star">
          {{ n <= Math.floor(rating) ? '⭐' : '☆' }}
        </span>
        <span class="rating-value">({{ rating.toFixed(1) }})</span>
      </div>

      <!-- Кнопка -->
      <button
        v-if="user.id !== auth.currentUser?.uid"
        class="msg-btn"
        @click="sendMessage"
        :disabled="isSending"
      >
        {{ isSending ? '⏳...' : 'Сообщение 💬' }}
      </button>
    </div>
  </div>

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
</template>

<style scoped>
.popup {
  font-family: sans-serif;
  /* width: 260px; */
  padding: 14px;
  border-radius: 14px;
  background: white;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: row;
  align-items: center;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  font-size: 32px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.emoji {
  font-size: 32px;
}

.info {
  margin-left: 12px;
  flex: 1;
  text-align: left;
}

.name {
  margin: 0;
  font-size: 17px;
  font-weight: bold;
  color: #333;
}

.status {
  margin: 2px 0 4px;
  font-size: 13px;
  color: #666;
}

.rating {
  display: flex;
  align-items: center;
  font-size: 15px;
  margin-bottom: 6px;
}

.star {
  margin-right: 2px;
}

.rating-value {
  margin-left: 4px;
  font-size: 13px;
  color: #666;
}

.msg-btn {
  width: 100%;
  padding: 6px;
  border: none;
  border-radius: 8px;
  background: #2196f3;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}
.msg-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.msg-btn:hover:not(:disabled) {
  background: #1976d2;
}

.reviews {
  margin-top: 10px;
  font-size: 13px;
  color: #444;
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
  color: #777;
}
</style>
