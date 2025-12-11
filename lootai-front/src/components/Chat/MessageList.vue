<template>
  <div class="messages">
    <div v-for="(msg, i) in messages" :key="i">
      <div :style="[fromMe(msg.fromId) ? 'text-align:right' : '']">
        {{ members[msg.fromId].name }}
      </div>
      <div :class="['message', fromMe(msg.fromId) ? 'me' : 'other']">{{ msg.text }}</div>
    </div>
  </div>
</template>

<script setup>
import { auth } from '@/config/firebase'

defineProps({
  messages: Array,
  members: Object,
})

function fromMe(id) {
  const uid = auth.currentUser.uid
  if (uid == id) return true
  else false
}
</script>

<style scoped>
.messages {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}
.message {
  max-width: 70%;
  margin: 6px 0;
  padding: 8px;
  border-radius: 10px;
}
.me {
  background: #8000ff;
  color: white;
  margin-left: auto;
  text-align: right;
}
.other {
  background: #eee;
  color: black;
  margin-right: auto;
}
</style>
