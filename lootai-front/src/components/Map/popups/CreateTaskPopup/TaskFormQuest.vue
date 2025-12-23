<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import QRCode from 'qrcode'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Input, Textarea, Select, Text, Button } from '@/designSystem/components'

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
      <Input v-model="model.title" placeholder="Название" />
    </div>

    <div class="field">
      <label>Описание:</label>
      <Textarea v-model="model.description" placeholder="Опишите задачу..." />
    </div>

    <!-- Пол -->
    <div class="field">
      <label>Пол:</label>
      <Select v-model="model.requirements.gender">
        <option value="any">Любой</option>
        <option value="male">Мужчины</option>
        <option value="female">Женщины</option>
      </Select>
    </div>

    <!-- Возраст -->
    <div class="field">
      <label>Возраст от:</label>
      <Input type="number" v-model="model.requirements.minAge" min="0" />

      <label>Возраст до:</label>
      <Input type="number" v-model="model.requirements.maxAge" min="0" />
    </div>

    <!-- Сложность -->
    <div class="field">
      <label>Сложность:</label>
      <Select v-model="model.requirements.difficulty">
        <option value="easy">Легкая</option>
        <option value="medium">Средняя</option>
        <option value="Hard">Сложная</option>
      </Select>
    </div>

    <div class="field">
      <label>Начало:</label>
      <div class="inline-inputs">
        <Input type="date" v-model="model.requirements.startDate" />
      </div>
    </div>

    <div class="field">
      <label>Конец:</label>
      <div class="inline-inputs">
        <Input type="date" v-model="model.requirements.endDate" />
      </div>
    </div>

    <!-- Steps -->
    <fieldset v-for="step in model.steps" class="reward">
      <legend>Шаг №{{ step.order }}</legend>
      <div class="field">
        <label>Название:</label>
        <Input v-model="step.title" placeholder="Название" />
      </div>

      <div class="field">
        <label>Тип:</label>
        <Select v-model="step.type">
          <option value="riddle">Загадка</option>
          <option value="qr">Найти qr код</option>
          <option value="photo" disabled>Сделайть похожее фото</option>
        </Select>
      </div>

      <div class="field">
        <label>Описание:</label>
        <Textarea v-model="step.description" placeholder="Опишите шаг..." />
      </div>

      <div v-if="step.type == 'riddle'" class="field">
        <label>Загадка:</label>
        <Textarea v-model="step.riddle" placeholder="Введите загадку..." />
      </div>

      <div v-if="step.type == 'riddle'" class="field">
        <label>Ответ:</label>
        <Input v-model="step.answer" placeholder="Ответ" />
      </div>

      <div v-if="step.type == 'qr'" class="field">
        <label>Clue:</label>
        <Input v-model="step.clue" placeholder="Clue" />
      </div>

      <div v-if="step.type == 'qr'" class="field">
        <label>QR-Code:</label>
        <div v-if="qrCodes[step.id]">
          <img :src="qrCodes[step.id]" alt="QR Code" />
          <Button class="create-btn small" type="button" @click="saveQrToPhone(qrCodes[step.id])">
            скачать
          </Button>
        </div>
        <div v-else>Generating QR code...</div>
      </div>

      <div v-if="step.type == 'photo'" class="field">
        <label>Upload photo:</label>
        <Input type="file" />
      </div>
      <div class="field">
        <label>Локация выбрана:</label>
        <Input type="checkbox" :checked="!!step.location.lat" disabled />
      </div>

      <div class="field">
        <label>Локация:</label>
        <Button class="create-btn small" type="button" @click="chooseStepLocation(step.id)">
          Выбрать на карте
        </Button>
        <span v-if="step.location.address">{{ step.location.address }}</span>
      </div>
    </fieldset>

    <Button class="create-btn" type="button" @click="addStep">Добавить шаг</Button>

    <!-- Награда -->
    <fieldset class="reward">
      <legend>Награда</legend>
      <div class="field">
        <label>XP:</label>
        <span>{{ model.reward.xp }}</span>
      </div>
      <div class="field">
        <label>Очки:</label>
        <Input type="number" v-model="model.reward.points" min="0" />
      </div>
      <div class="field">
        <label>Предмет:</label>
        <Button class="create-btn small" @click.prevent="addItem">+</Button>
      </div>
    </fieldset>

    <div class="field">
      <label>Описание:</label>
      <Textarea v-model="model.finishWords" placeholder="Слова благодарности пользователю" />
    </div>
  </div>
</template>

<style scoped>
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
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-xs);
}

.inline-inputs {
  display: grid;
  gap: var(--space-sm);
  width: 100%;
  box-sizing: border-box;
}
.inline-inputs input {
  flex: 1;
  /* width: 94%; */
  margin: 0px;
}

.reward {
  margin-top: var(--space-md);
  background: var(--bg-surface);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}

.reward legend {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.error {
  color: var(--state-error);
  font-size: var(--font-size-sm);
  text-align: center;
}

/* .create-btn {
  margin-top: 6px;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: #4caf50;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
} */
.create-btn.small {
  width: auto;
  padding: var(--space-xs) var(--space-sm);
}
</style>
