<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  finishWords: string
  reward: any
}>()
</script>

<template>
  <div class="popup">test</div>
</template>

<style scoped>
.popup {
  position: absolute;
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
