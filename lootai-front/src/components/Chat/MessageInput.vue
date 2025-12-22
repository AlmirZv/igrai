<template>
  <div class="input-bar">
    <Input type="text" v-model="text" placeholder="Напишите сообщение..." @keyup.enter="send" />
    <Button @click="send">➤</Button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Input, Button } from '@/designSystem/components'

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
  padding: var(--space-sm);
  margin-bottom: 60px;
  gap: var(--space-md);
}
</style>
