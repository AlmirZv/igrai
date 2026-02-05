<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// @ts-ignore - no types installed for qrcode
import QRCode from 'qrcode'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Input, Textarea, Select, Text, Button } from '@/designSystem/components'
import ArEditor from './ArEditor.vue'

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

// AR Editor state
const arEditorOpen = ref(false)
const editingStepId = ref<string | null>(null)
const arEditorRef = ref<InstanceType<typeof ArEditor> | null>(null)

// Временный URL бэкенда для генерации .mind (можно вынести в env)
const AR_TARGET_API = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/ar/targets`
  : 'http://localhost:8000/ar/targets'

async function generateMindTargetForStep(step: any) {
  try {
    // Отправляем base64-изображения якоря на бэкенд
    const res = await fetch(AR_TARGET_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: step.imageTargetUrls,
      }),
    })

    if (!res.ok) {
      console.error('Failed to generate .mind file', await res.text())
      return
    }

    const data = await res.json()
    // Ожидаем, что бэкенд вернёт что-то типа { mindUrl: '/targets/xxx.mind' }
    if (data?.mindUrl) {
      step.imageTargetFile = data.mindUrl
    }
  } catch (e) {
    console.error('Error calling AR target API', e)
  }
}

// AR image upload
const handleArImageUpload = async (stepId: string, event: Event) => {
  const step = model.value.steps.find((s: any) => s.id === stepId)
  if (!step) return

  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const files = Array.from(input.files)
  
  // Инициализируем AR поля если их нет
  if (!step.imageTargetUrls) {
    step.imageTargetUrls = []
    step.modelType = 'cube'
    step.transform = {
      position: { x: 0, y: 0, z: 0.3 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    }
  }

  // Конвертируем файлы в data URLs (временно, потом нужно будет загружать на сервер)
  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (dataUrl && !step.imageTargetUrls.includes(dataUrl)) {
        step.imageTargetUrls.push(dataUrl)
      }
    }
    reader.readAsDataURL(file)
  })

  // После загрузки картинок — генерируем .mind на бэкенде
  await generateMindTargetForStep(step)
}

function openArEditor(stepId: string) {
  const step = model.value.steps.find((s: any) => s.id === stepId)
  if (!step || !step.imageTargetFile) {
    alert('Пожалуйста, сначала загрузите изображения для якоря')
    return
  }
  
  editingStepId.value = stepId
  arEditorOpen.value = true

  // IMPORTANT: open camera from user gesture (this click), otherwise mobile browsers may block it.
  arEditorRef.value?.openFromGesture({
    imageTargetUrl: step.imageTargetFile,
    initialTransform: step.transform,
  })
}

function closeArEditor() {
  arEditorOpen.value = false
  editingStepId.value = null
  arEditorRef.value?.close()
}

function saveArTransform(transform: {
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
}) {
  if (!editingStepId.value) return
  
  const step = model.value.steps.find((s: any) => s.id === editingStepId.value)
  if (step) {
    step.transform = transform
  }
}

// Watch for step type changes to initialize AR fields
watch(
  () => model.value.steps,
  (steps) => {
    steps.forEach((step: any) => {
      if (step.type === 'ar' && !step.imageTargetUrls) {
        step.imageTargetUrls = []
        step.modelType = 'cube'
        step.transform = {
          position: { x: 0, y: 0, z: 0.3 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 }
        }
        step.answer = ''
      }
    })
  },
  { deep: true, immediate: true }
)
</script>

<template>
  <div class="form">
    <div class="field">
      <label>{{ $t(`map.popup.headline`) }}:</label>
      <Input v-model="model.title" :placeholder="$t(`map.popup.placeholders.title`)" />
    </div>

    <div class="field">
      <label>{{ $t(`map.popup.description`) }}:</label>
      <Textarea
        v-model="model.description"
        :placeholder="$t(`map.popup.placeholders.describeTask`) + '...'"
      />
    </div>

    <!-- Пол -->
    <div class="field">
      <label>{{ $t(`map.popup.gender`) }}:</label>
      <Select v-model="model.requirements.gender">
        <option value="any">{{ $t(`map.popup.genderType.any`) }}</option>
        <option value="male">{{ $t(`map.popup.genderType.male`) }}</option>
        <option value="female">{{ $t(`map.popup.genderType.female`) }}</option>
      </Select>
    </div>

    <!-- Возраст -->
    <div class="field">
      <label>{{ $t(`map.popup.ageStart`) }}:</label>
      <Input type="number" v-model="model.requirements.minAge" min="0" />

      <label>{{ $t(`map.popup.ageEnd`) }}:</label>
      <Input type="number" v-model="model.requirements.maxAge" min="0" />
    </div>

    <!-- Сложность -->
    <div class="field">
      <label>{{ $t(`map.popup.difficulty`) }}:</label>
      <Select v-model="model.requirements.difficulty">
        <option value="easy">{{ $t(`map.popup.difficultyType.easy`) }}</option>
        <option value="medium">{{ $t(`map.popup.difficultyType.medium`) }}</option>
        <option value="Hard">{{ $t(`map.popup.difficultyType.hard`) }}</option>
      </Select>
    </div>

    <div class="field">
      <label>{{ $t(`map.popup.start`) }}:</label>
      <div class="inline-inputs">
        <Input type="date" v-model="model.requirements.startDate" />
      </div>
    </div>

    <div class="field">
      <label>{{ $t(`map.popup.end`) }}:</label>
      <div class="inline-inputs">
        <Input type="date" v-model="model.requirements.endDate" />
      </div>
    </div>

    <!-- Steps -->
    <fieldset v-for="step in model.steps" class="reward">
      <legend>{{ $t(`map.popup.step`) }} №{{ step.order }}</legend>
      <div class="field">
        <label>{{ $t(`map.popup.title`) }}:</label>
        <Input v-model="step.title" :placeholder="$t(`map.popup.placeholders.title`)" />
      </div>

      <div class="field">
        <label>{{ $t(`map.popup.type`) }}:</label>
        <Select v-model="step.type">
          <option value="riddle">{{ $t(`map.popup.stepType.riddle`) }}</option>
          <option value="qr">{{ $t(`map.popup.stepType.qr`) }}</option>
          <option value="photo" disabled>{{ $t(`map.popup.stepType.photo`) }}</option>
          <option value="ar">{{ $t(`map.popup.stepType.ar`) || 'AR' }}</option>
        </Select>
      </div>

      <div class="field">
        <label>{{ $t(`map.popup.description`) }}:</label>
        <Textarea
          v-model="step.description"
          :placeholder="$t(`map.popup.placeholders.describeTask`) + '...'"
        />
      </div>

      <div v-if="step.type == 'riddle'" class="field">
        <label>{{ $t(`map.popup.riddle`) }}:</label>
        <Textarea
          v-model="step.riddle"
          :placeholder="$t(`map.popup.placeholders.describeRiddle`) + '...'"
        />
      </div>

      <div v-if="step.type == 'riddle'" class="field">
        <label>{{ $t(`map.popup.answer`) }}:</label>
        <Input v-model="step.answer" placeholder="Ответ" />
      </div>

      <div v-if="step.type == 'qr'" class="field">
        <label>{{ $t(`map.popup.clue`) }}:</label>
        <Input v-model="step.clue" :placeholder="$t(`map.popup.enterClue`)" />
      </div>

      <div v-if="step.type == 'qr'" class="field">
        <label>{{ $t(`map.popup.qrcode`) }}:</label>
        <div v-if="qrCodes[step.id]">
          <img :src="qrCodes[step.id]" alt="QR Code" />
          <Button class="create-btn small" type="button" @click="saveQrToPhone(qrCodes[step.id])">
            {{ $t(`map.buttons.download`) }}
          </Button>
        </div>
        <div v-else>{{ $t(`map.popup.generatingQRCode`) }}...</div>
      </div>

      <div v-if="step.type == 'photo'" class="field">
        <label>{{ $t(`map.popup.uploadPhoto`) }}:</label>
        <Input type="file" />
      </div>

      <!-- AR Step Fields -->
      <div v-if="step.type == 'ar'" class="field">
        <label>{{ $t(`map.popup.ar.uploadImages`) || 'Загрузить изображения (якорь)' }}:</label>
        <Input 
          type="file" 
          accept="image/*" 
          multiple 
          @change="handleArImageUpload(step.id, $event)"
        />
        <div v-if="step.imageTargetUrls && step.imageTargetUrls.length > 0" class="ar-images-preview">
          <div v-for="(url, idx) in step.imageTargetUrls" :key="idx" class="ar-image-item">
            <img :src="url" alt="Anchor image" />
          </div>
        </div>
      </div>

      <div v-if="step.type == 'ar'" class="field">
        <label>{{ $t(`map.popup.ar.modelType`) || 'Тип модели' }}:</label>
        <Select v-model="step.modelType">
          <option value="cube">{{ $t(`map.popup.ar.modelType.cube`) || 'Куб' }}</option>
          <option value="custom" disabled>{{ $t(`map.popup.ar.modelType.custom`) || 'Загрузить модель' }}</option>
        </Select>
      </div>

      <div v-if="step.type == 'ar' && step.imageTargetFile" class="field">
        <label>{{ $t(`map.popup.ar.editor`) || 'AR Редактор' }}:</label>
        <Button class="create-btn small" type="button" @click="openArEditor(step.id)">
          {{ $t(`map.buttons.openArEditor`) || 'Открыть AR редактор' }}
        </Button>
        <span v-if="step.transform" class="ar-transform-status">
          {{ $t(`map.popup.ar.transformSaved`) || 'Transform сохранен' }}
        </span>
      </div>

      <div v-if="step.type == 'ar'" class="field">
        <label>{{ $t(`map.popup.answer`) }}:</label>
        <Input v-model="step.answer" :placeholder="$t(`map.popup.placeholders.answer`) || 'Ответ после просмотра AR модели'" />
      </div>

      <div class="field">
        <label>{{ $t(`map.popup.locationChoosed`) }}:</label>
        <Input type="checkbox" :checked="!!step.location.lat" disabled />
      </div>

      <div class="field">
        <label>{{ $t(`map.popup.location`) }}:</label>
        <Button class="create-btn small" type="button" @click="chooseStepLocation(step.id)">
          {{ $t(`map.buttons.chooseOnMap`) }}
        </Button>
        <span v-if="step.location.address">{{ step.location.address }}</span>
      </div>
    </fieldset>

    <Button class="create-btn" type="button" @click="addStep">{{
      $t(`map.buttons.addStep`)
    }}</Button>

    <!-- Награда -->
    <fieldset class="reward">
      <legend>{{ $t(`map.popup.reward`) }}</legend>
      <div class="field">
        <label>XP:</label>
        <span>{{ model.reward.xp }}</span>
      </div>
      <div class="field">
        <label>{{ $t(`map.popup.points`) }}:</label>
        <Input type="number" v-model="model.reward.points" min="0" />
      </div>
      <div class="field">
        <label>{{ $t(`map.popup.inventoryItem`) }}:</label>
        <Button class="create-btn small" @click.prevent="addItem">+</Button>
      </div>
    </fieldset>

    <div class="field">
      <label>{{ $t(`map.popup.description`) }}:</label>
      <Textarea
        v-model="model.finishWords"
        :placeholder="$t(`map.popup.placeholders.wordsOfGratitude`)"
      />
    </div>

    <!-- AR Editor Modal -->
    <ArEditor
      ref="arEditorRef"
      @close="closeArEditor"
      @save="saveArTransform"
    />
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

.ar-images-preview {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
}

.ar-image-item {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}

.ar-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ar-transform-status {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-left: var(--space-xs);
}
</style>
