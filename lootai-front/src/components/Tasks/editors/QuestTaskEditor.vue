<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <Card class="modal">
      <div class="modal-header">
        <Text variant="h3">{{ $t(`tasks.edit.questTitle`) }}</Text>
        <Button variant="secondary" @click="$emit('cancel')">x</Button>
      </div>

      <form class="form" @submit.prevent="submit">
        <label>
          {{ $t(`tasks.modal.title`) }}
          <Input v-model="form.title" type="text" required />
        </label>

        <label>
          {{ $t(`tasks.modal.description`) }}
          <Textarea v-model="form.description" rows="3" required />
        </label>

        <!-- Steps -->
        <fieldset v-for="step in form.steps" class="reward">
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
              <Button
                class="create-btn small"
                type="button"
                @click="saveQrToPhone(qrCodes[step.id])"
              >
                {{ $t(`map.buttons.download`) }}
              </Button>
            </div>
            <div v-else>{{ $t(`map.popup.generatingQRCode`) }}...</div>
          </div>

          <div v-if="step.type == 'photo'" class="field">
            <label>{{ $t(`map.popup.uploadPhoto`) }}:</label>
            <Input type="file" />
          </div>
          <div class="field">
            <label>{{ $t(`map.popup.locationChoosed`) }}:</label>
            <Input type="checkbox" :checked="!!step.location.lat" disabled />
          </div>

          <!-- <div class="field">
        <label>{{ $t(`map.popup.location`) }}:</label>
        <Button class="create-btn small" type="button" @click="chooseStepLocation(step.id)">
          {{ $t(`map.buttons.chooseOnMap`) }}
        </Button>
        <span v-if="step.location.address">{{ step.location.address }}</span>
      </div> -->
        </fieldset>

        <!-- Награда -->
        <fieldset class="reward">
          <legend>{{ $t(`map.popup.reward`) }}</legend>
          <div class="field">
            <label>XP:</label>
            <span>{{ form.reward.xp }}</span>
          </div>
          <div class="field">
            <label>{{ $t(`tasks.modal.reward.points`) }}:</label>
            <Input type="number" v-model="form.reward.points" min="0" />
          </div>
          <div class="field">
            <label>{{ $t(`tasks.modal.reward.inventory`) }}:</label>
            <Button class="create-btn small" @click.prevent="addItem">+</Button>
          </div>
        </fieldset>

        <label>
          {{ $t(`tasks.modal.finishWords`) }}
          <Textarea v-model="form.finishWords" rows="2" />
        </label>

        <div class="grid">
          <label>
            {{ $t(`tasks.modal.requirements.startDate`) }}
            <Input v-model="form.requirements.startDate" type="date" />
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.endDate`) }}
            <Input v-model="form.requirements.endDate" type="date" />
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.age`) }}
            <Input v-model.number="form.requirements.minAge" type="number" min="0" />
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.age`) }} max
            <Input v-model.number="form.requirements.maxAge" type="number" min="0" />
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.gender`) }}
            <Select v-model="form.requirements.gender">
              <option value="any">Любой</option>
              <option value="male">Мужчина</option>
              <option value="female">Женщина</option>
            </Select>
          </label>
          <label>
            {{ $t(`tasks.modal.requirements.difficulty`) }}
            <Select v-model="form.requirements.difficulty">
              <option value="easy">{{ $t(`tasks.edit.difficultyType.easy`) }}</option>
              <option value="medium">{{ $t(`tasks.edit.difficultyType.medium`) }}</option>
              <option value="hard">{{ $t(`tasks.edit.difficultyType.hard`) }}</option>
            </Select>
          </label>
        </div>

        <div class="actions">
          <Button variant="primary" type="submit">{{ $t(`tasks.buttons.save`) }}</Button>
          <Button variant="secondary" type="button" @click="$emit('cancel')">
            {{ $t(`tasks.buttons.cancel`) }}
          </Button>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import QRCode from 'qrcode'
import { Card, Text, Button, Select, Input, Textarea } from '@/designSystem/components'
import type { QuestTask } from '@/types/quest'
import { Filesystem, Directory } from '@capacitor/filesystem'

const props = defineProps<{
  task: QuestTask
}>()

const emit = defineEmits<{
  (e: 'save', payload: Partial<QuestTask>): void
  (e: 'cancel'): void
}>()

const form = reactive(JSON.parse(JSON.stringify(props.task)) as QuestTask)

const submit = () => {
  emit('save', form)
}

function addItem() {
  console.log('user adding item')
}

// Store QR codes by step ID
const qrCodes = ref<Record<string, string>>({})

const generateQR = async (id: string) => {
  return await QRCode.toDataURL(id)
}

// Watch for steps and generate QR codes for steps with type 'qr'
watch(
  () => props.task.steps,
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

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.modal {
  width: 90%;
  max-width: 720px;
  padding: var(--space-lg);
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

label {
  display: flex;
  flex-direction: column;
  gap: var(--space-xxs);
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-sm);
}

.actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
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
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-xs);
}
</style>
