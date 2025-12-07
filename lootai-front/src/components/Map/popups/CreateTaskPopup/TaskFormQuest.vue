<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import QRCode from 'qrcode'
import { Filesystem, Directory } from '@capacitor/filesystem'

const emit = defineEmits<{
  (e: 'select-step-location', stepId: any): void
}>()

const model = defineModel({
  type: Object,
  default: () => ({
    title: '',
    description: '',
    type: 'user',
    status: 'active',
    requirements: {
      gender: 'any',
      minAge: 0,
      maxAge: 200,
      startDate: '',
      endDate: '',
      difficulty: 'easy',
    },
    reward: {
      xp: 30,
      points: 1,
      inventoryItem: '',
    },
    finishWords: '',
    steps: [
      {
        id: crypto.randomUUID(),
        order: 1,
        title: '',
        type: 'riddle',
        location: {
          lat: '',
          lng: '',
          address: '',
        },
        description: '',
        validation: {
          expectedKey: '',
        },
        nextStepId: crypto.randomUUID(),
      },
    ],
  }),
})

function addItem() {
  console.log('user adding item')
}

function addStep() {
  console.log(model.value)

  model.value.steps.push({
    id: model.value.steps[model.value.steps.length - 1].nextStepId,
    order: model.value.steps[model.value.steps.length - 1].order + 1,
    title: '',
    type: 'riddle',
    location: {
      lat: '',
      lng: '',
      address: '',
    },
    description: '',
    validation: {
      expectedKey: '',
    },
    nextStepId: crypto.randomUUID(),
  })
  console.log('user adding step')
  console.log(model.value)
}

const selectingStep = ref<null | string>(null)

function chooseStepLocation(stepId: string) {
  selectingStep.value = stepId
  emit('select-step-location', stepId) // родителю — показать карту и ждать клика
}

function setStepLocation(stepId: string, lat: string, lng: string, address: string) {
  const step = model.value.steps.find((s: any) => s.id === stepId)
  if (step) {
    step.location = { lat, lng, address }
  }
}

// Store QR codes by step ID
const qrCodes = ref<Record<string, string>>({})

const generateQR = async (id: string) => {
  return await QRCode.toDataURL(id)
}

// Watch for steps and generate QR codes for steps with type 'qr'
watch(
  () => model.value.steps,
  async (steps) => {
    for (const step of steps) {
      if (step.type === 'qr' && step.id && !qrCodes.value[step.id]) {
        try {
          qrCodes.value[step.id] = await generateQR(step.id)
        } catch (error) {
          console.error('Error generating QR code:', error)
        }
      }
    }
  },
  { immediate: true, deep: true },
)

const saveQrToPhone = async (code: string) => {
  const base64 = code.replace(/^data:image\/png;base64,/, '')

  const fileName = `qr-${Date.now()}.png`

  await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Documents, // Documents или Data или External
    recursive: true,
  })

  return fileName
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
      <textarea v-model="model.description" placeholder="Опишите задачу..." />
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

    <!-- Сложность -->
    <div class="field">
      <label>Сложность:</label>
      <select v-model="model.requirements.difficulty">
        <option value="easy">Легкая</option>
        <option value="medium">Средняя</option>
        <option value="Hard">Сложная</option>
      </select>
    </div>

    <div class="field">
      <label>Начало:</label>
      <div class="inline-inputs">
        <input type="date" v-model="model.requirements.startDate" />
      </div>
    </div>

    <div class="field">
      <label>Конец:</label>
      <div class="inline-inputs">
        <input type="date" v-model="model.requirements.endDate" />
      </div>
    </div>

    <!-- Steps -->
    <fieldset v-for="step in model.steps" class="reward">
      <legend>Шаг №{{ step.order }}</legend>
      <div class="field">
        <label>Название:</label>
        <input v-model="step.title" placeholder="Название" />
      </div>

      <div class="field">
        <label>Тип:</label>
        <select v-model="step.type">
          <option value="riddle">Загадка</option>
          <option value="qr">Найти qr код</option>
          <option value="photo" disabled>Сделайть похожее фото</option>
        </select>
      </div>

      <div class="field">
        <label>Описание:</label>
        <textarea v-model="step.description" placeholder="Опишите шаг..." />
      </div>

      <div v-if="step.type == 'riddle'" class="field">
        <label>Загадка:</label>
        <textarea v-model="step.riddle" placeholder="Введите загадку..." />
      </div>

      <div v-if="step.type == 'riddle'" class="field">
        <label>Ответ:</label>
        <input v-model="step.answer" placeholder="Ответ" />
      </div>

      <div v-if="step.type == 'qr'" class="field">
        <label>Clue:</label>
        <input v-model="step.clue" placeholder="Clue" />
      </div>

      <div v-if="step.type == 'qr'" class="field">
        <label>QR-Code:</label>
        <div v-if="qrCodes[step.id]">
          <img :src="qrCodes[step.id]" alt="QR Code" />
          <button class="create-btn small" type="button" @click="saveQrToPhone(qrCodes[step.id])">
            скачать
          </button>
        </div>
        <div v-else>Generating QR code...</div>
      </div>

      <div v-if="step.type == 'photo'" class="field">
        <label>Upload photo:</label>
        <input type="file" />
      </div>
      <div class="field">
        <label>Локация выбрана:</label>
        <input type="checkbox" :checked="!!step.location.lat" disabled />
      </div>

      <div class="field">
        <label>Локация:</label>
        <button class="create-btn small" type="button" @click="chooseStepLocation(step.id)">
          Выбрать на карте
        </button>
        <span v-if="step.location.address">{{ step.location.address }}</span>
      </div>
    </fieldset>

    <button class="create-btn" type="button" @click="addStep">Добавить шаг</button>

    <!-- Награда -->
    <fieldset class="reward">
      <legend>Награда</legend>
      <div class="field">
        <label>XP:</label>
        <span>{{ model.reward.xp }}</span>
      </div>
      <div class="field">
        <label>Очки:</label>
        <input type="number" v-model="model.reward.points" min="0" />
      </div>
      <div class="field">
        <label>Предмет:</label>
        <button class="create-btn small" @click.prevent="addItem">+</button>
      </div>
    </fieldset>

    <div class="field">
      <label>Описание:</label>
      <textarea v-model="model.finishWords" placeholder="Слова благодарности пользователю" />
    </div>
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
