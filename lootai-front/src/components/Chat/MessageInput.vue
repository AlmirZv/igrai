<template>
  <div class="input-bar">
    <input type="text" v-model="text" placeholder="Напишите сообщение..." @keyup.enter="send" />
    <button @click="send">➤</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const text = ref('')
const emit = defineEmits(['send'])

function send() {
  if (!text.value.trim()) return
  emit('send', text.value)
  text.value = ''
}
</script>

<style scoped>
.input-bar {
  display: flex;
  padding: 8px;
  border-top: 1px solid #ccc;
  margin-bottom: 50px;
}
input {
  flex: 1;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
button {
  margin-left: 6px;
  padding: 6px 10px;
  border: none;
  background: #8000ff;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}
</style>
