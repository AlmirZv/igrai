<template>
  <div class="messages">
    <div v-for="(msg, i) in messages" :key="i">
      <div :class="['message', fromMe(msg.fromId) ? 'me' : 'other']">
        <!-- <div class="messageSender">
          <Text color="accent">
            {{ members[msg.fromId].name }}
          </Text>
          <Text color="muted">
            {{ new Date(msg.timestamp).toLocaleString(undefined, options) }}
          </Text>
        </div> -->
        <Text v-if="members[msg.fromId]" color="accent">
          {{ members[msg.fromId].name }}
        </Text>
        <div>
          {{ msg.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { auth } from '@/config/firebase'
import { Text } from '@/designSystem/components'

const props = defineProps({
  messages: Array,
  members: Object,
})
console.log(props)

function fromMe(id) {
  const uid = auth.currentUser.uid
  if (uid == id) return true
  else false
}

const options = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false, // Use AM/PM
  // timeZoneName: 'short', // e.g., PST
}
</script>

<style scoped>
.messages {
  flex: 1;
  padding: var(--space-sm);
  overflow-y: auto;
}
.message {
  max-width: 70%;
  margin: var(--space-xs) 0;
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}
.me {
  background: var(--bg-surface);
  color: var(--text-secondary);
  margin-left: auto;
  text-align: right;
}
.other {
  background: var(--bg-surface);
  color: var(--text-secondary);
  margin-right: auto;
}
.messageSender {
  /* color: var(--text-accent); */
  display: flex;
}
</style>
