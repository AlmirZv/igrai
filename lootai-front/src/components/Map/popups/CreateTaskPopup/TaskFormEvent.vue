<script setup lang="ts">
import { ref, computed } from 'vue'

const model = defineModel({
  type: Object,
  default: () => ({
    title: '',
    description: '',
    type: 'event',
    status: 'active',
    requirements: {
      gender: 'any',
      minAge: 18,
      maxAge: 60,
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      membersCount: 1,
    },
    reward: {
      xp: 30,
      inventoryItem: '',
    },
  }),
})

function addItem() {
  console.log('user adding item')
}
</script>

<template>
  <div class="form">
    <div class="field">
      <label>Заголовок:</label>
      <input v-model="model.title" placeholder="Название" />
    </div>

    <div class="field">
      <label>Описание:</label>
      <textarea v-model="model.description" placeholder="Опишите event..." />
    </div>

    <!-- Пол -->
    <div class="field">
      <label>Пол:</label>
      <select v-model="model.requirements.gender">
        <option value="any">Любой</option>
        <option value="male">Мужчины</option>
        <option value="female">Женщины</option>
      </select>
    </div>

    <!-- Возраст -->
    <div class="field">
      <label>Возраст от:</label>
      <input type="number" v-model="model.requirements.minAge" min="0" />

      <label>Возраст до:</label>
      <input type="number" v-model="model.requirements.maxAge" min="0" />
    </div>

    <div class="field">
      <label>Начало:</label>
      <div class="inline-inputs">
        <input type="date" v-model="model.requirements.startDate" />
        <input type="time" v-model="model.requirements.startTime" />
      </div>
    </div>

    <div class="field">
      <label>Конец:</label>
      <div class="inline-inputs">
        <input type="date" v-model="model.requirements.endDate" />
        <input type="time" v-model="model.requirements.endTime" />
      </div>
    </div>

    <!-- Награда -->
    <fieldset class="reward">
      <legend>Награда</legend>
      <div class="field">
        <label>XP:</label>
        <span>{{ model.reward.xp }}</span>
      </div>
      <div class="field">
        <label>Предмет:</label>
        <button class="create-btn small" @click.prevent="addItem">+</button>
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.popup {
  font-family: sans-serif;
  width: 300px;
  padding: 10px;
  border-radius: 12px;
  background: white;
}

.title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 100%;
  overflow: auto;
  overflow-x: hidden;
}

.field {
  display: grid;
  grid-template-columns: 100px 1fr; /* подпись фикс, поле тянется */
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.inline-inputs {
  display: grid;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
}
.inline-inputs input {
  flex: 1;
  /* width: 94%; */
  margin: 0px;
}

input,
select,
textarea {
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 13px;
  flex: 1; /* поле растягивается по колонке */
  min-width: 0; /* предотвращает переполнение */
}

textarea {
  min-height: 50px;
  resize: vertical;
}

.reward {
  margin-top: 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reward legend {
  font-size: 13px;
  font-weight: bold;
}

.error {
  color: red;
  font-size: 13px;
  text-align: center;
}

.create-btn {
  margin-top: 6px;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: #4caf50;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}
.create-btn:hover {
  background: #45a049;
}
.create-btn.small {
  width: auto;
  padding: 4px 10px;
}
</style>
