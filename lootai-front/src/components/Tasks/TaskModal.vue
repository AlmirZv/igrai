<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">{{ task.title }}</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-section">
        <p><strong>Автор:</strong> {{ task.author }}</p>
        <p><strong>Описание:</strong> {{ task.description }}</p>
        <p>
          <strong>Время:</strong>from {{ task.requirements.startTime }}
          {{ task.requirements.startDate }}
          to
          {{ task.requirements.endTime }} {{ task.requirements.endDate }}
        </p>
      </div>

      <div class="modal-section reward">
        <h4>💎 Награда</h4>
        <ul>
          <li><strong>Опыт:</strong> {{ task.reward.xp }}</li>
          <li><strong>Вознаграждение:</strong> {{ task.reward.points }}</li>
          <li><strong>Инвентарь:</strong> {{ task.reward.inventoryItem }}</li>
        </ul>
      </div>

      <div class="modal-section requirements">
        <h4>⚙️ Требования</h4>
        <ul>
          <li><strong>Возраст:</strong> {{ task.requirements.age }}</li>
          <li><strong>Пол:</strong> {{ gender[task.requirements.gender] }}</li>
        </ul>
      </div>

      <div v-if="aTab === 'created'" class="modal-section participants">
        <h4>👥 Участники</h4>
        <ul>
          <li
            v-for="(p, i) in task.participants"
            :key="i"
            class="participant-item"
            @click="showParticipantInfo(p)"
          >
            <span>{{ p.name }}({{ p.gender ? p.gender : '' }}, {{ p.age ? p.age : '' }})</span>
            <div class="participant-actions">
              <button class="accept" @click="$emit('accept', p)">✔</button>
              <button class="decline" @click="$emit('decline', p)">✖</button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="aTab === 'created'" class="modal-actions">
        <button v-if="task.status != 'completed'" class="cancel" @click="$emit('complete')">
          Завершить задачу
        </button>
        <button class="close" @click="$emit('close')">Закрыть</button>
      </div>
      <div v-else class="modal-actions">
        <button v-if="task.status != 'completed'" class="cancel" @click="$emit('cancel')">
          Отменить выполнение
        </button>
        <button class="close" @click="$emit('close')">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import UserPopup from './ParticipantInfo.vue'
import { ref } from 'vue'

const props = defineProps({
  task: Object,
  aTab: String,
})
defineEmits(['close', 'cancel', 'complete', 'accept', 'decline'])
console.log(props.task)

const gender = {
  male: 'мужчины',
  female: 'девушки',
  any: 'любой',
}

const showuspopup = ref(false)
const showedPart = ref()
async function showParticipantInfo(participant) {
  // console.log(participant)
  showedPart.value = participant
  showuspopup.value = true
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease;
  z-index: 1000;
}

.modal {
  background: #fff;
  color: #222;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 20px;
  width: 90%;
  max-width: 420px;
  transform: translateY(10px);
  animation: slideUp 0.3s ease forwards;
  margin: 5px;
  margin-bottom: 70px;
  height: calc(100vh - 115px);
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #000;
}

.modal-section {
  margin-bottom: 16px;
  /* border-bottom: 1px solid #eee; */
  /* padding-bottom: 10px; */

  h4 {
    margin-top: 0;
  }
}
.modal-section:last-child {
  border: none;
}

.modal-section h4 {
  margin-bottom: 6px;
  font-size: 1rem;
  color: #555;
}

.modal-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.modal-section li {
  margin: 4px 0;
}

.reward {
  background: #f8f9ff;
  border-radius: 10px;
  padding: 10px;
}

.requirements {
  background: #fff8f5;
  border-radius: 10px;
  padding: 10px;
}

.participants .participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f7f7f7;
  padding: 6px 10px;
  border-radius: 8px;
  margin-top: 6px;
}

.participant-actions button {
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
}

.accept {
  background: #d1f7c4;
  color: #227a1c;
}
.accept:hover {
  background: #bdf0a8;
}

.decline {
  background: #ffd2d2;
  color: #a91a1a;
}
.decline:hover {
  background: #ffb8b8;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
}

.modal-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition:
    background 0.2s,
    transform 0.1s;
}

.modal-actions .cancel {
  background: #ffecec;
  color: #c23a3a;
}
.modal-actions .cancel:hover {
  background: #ffd9d9;
}

.modal-actions .close {
  background: #e9f0ff;
  color: #2a4ba1;
}
.modal-actions .close:hover {
  background: #d5e4ff;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
