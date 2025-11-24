<template>
  <div class="messages">
    <div v-for="(msg, i) in messages" :key="i" :class="['message', msg.fromMe ? 'me' : 'other']">
      {{ msg.text }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  messages: Array,
})
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
}
.other {
  background: #eee;
  color: black;
  margin-right: auto;
}
</style>
