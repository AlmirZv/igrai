<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PublicTask, TaskParticipant, TaskRequirements } from '@/types/publicTask'
import { auth } from '@/config/firebase'
import uInfoComposable from '@/composables/userInfo'
import { Button } from '@/designSystem/components'
// import { useI18n } from 'vue-i18n'

// const { t } = useI18n()
import { i18n } from '@/locales/i18n'

const t = i18n.global.t

type PopupType = 'public'

const props = defineProps<{
  type: PopupType
  data: PublicTask
}>()

const emit = defineEmits<{
  (e: 'action', payload: { type: PopupType; id: string }): void
}>()

const isLoading = ref(false)
const uicomposable = uInfoComposable()

function doAction() {
  isLoading.value = true

  emit('action', { type: props.type, id: props.data.id })

  // setTimeout(() => (isLoading.value = false), 1000)
}

const actionDone = computed(() => {
  const userAge = uicomposable.state.age.value
  const userGender = uicomposable.state.user.value.gender

  const requiredAge = props.data.requirements.age
  const requiredGender = props.data.requirements.gender

  const userId = auth.currentUser?.uid

  if (props.data.authorId == userId) {
    return t('map.popup.requirements.youCreatedTask')
  }

  if (userAge < requiredAge) {
    return `${t('map.popup.requirements.ageMoreThan')} ${requiredAge}`
  }

  if (requiredGender != 'any' && userGender != requiredGender) {
    return `${t('map.popup.requirements.required')} ${requiredGender == 'female' ? t('map.popup.genderType.female') : t('map.popup.genderType.male')}`
  }

  console.log(props.data.participants)

  if (hasParticipants(props.data.participants)) {
    const participants = Array.isArray(props.data.participants)
      ? props.data.participants
      : props.data.participants
        ? [props.data.participants]
        : []

    const isParticipant = participants?.some((p) => p.id === userId)

    if (isParticipant) {
      const isParticipantAccepted = participants?.some(
        (p) => p.id === userId && p.status == 'accepted',
      )
      console.log(isParticipantAccepted)

      if (isParticipantAccepted) {
        return t('map.buttons.alreadyMember')
      } else {
        return t('map.buttons.appUnderCons')
      }
    } else {
      console.log('Пользователь ещё не в списке')
    }
    return true
  } else {
    return false
  }
})
function hasParticipants(participants: TaskParticipant | TaskParticipant[] | undefined): boolean {
  const arr = Array.isArray(participants) ? participants : participants ? [participants] : []
  return arr.length > 0
}
</script>

<template>
  <div class="popup">
    <!-- Заголовок -->
    <h3 class="title">{{ data.title }}</h3>

    <!-- Автор -->
    <p v-if="data.author" class="author">👤 {{ data.author }}</p>

    <!-- Описание -->
    <p class="description">{{ data.description }}</p>

    <!-- Task -->
    <div class="task">
      <div class="reward">
        🎁 <b>{{ t('map.popup.reward') }}:</b> XP: {{ (data as PublicTask).reward.xp }}
        {{ (data as PublicTask).reward.inventoryItem ? ',' : '' }}
        {{ (data as PublicTask).reward.inventoryItem }}
      </div>

      <div class="participants">
        <b>{{ t('map.popup.participants') }}:</b>
        <div class="list">
          <div
            v-for="p in (data as PublicTask).participants"
            :key="p.name"
            class="participant"
            :class="p.status"
          >
            {{ p.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопка действия -->
    <button v-if="!actionDone" class="action-btn" @click="doAction" :disabled="isLoading">
      {{
        isLoading
          ? isLoading
            ? t('map.buttons.appUnderCons')
            : t('map.buttons.alreadyMember')
          : t('map.buttons.registerForEvent')
      }}
    </button>
    <Button v-if="actionDone && actionDone != true" class="action-done-btn" :disabled="true">
      {{ actionDone }}
    </Button>
  </div>
</template>

<style scoped>
.title {
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.author {
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}
.description {
  margin: 0 0 var(--space-md) 0;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}
.reward {
  margin-bottom: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--space-sm);
  background: var(--bg-surface);
  font-size: var(--font-size-xs);
}
.requirements {
  font-size: var(--font-size-xs);
  margin-bottom: var(--space-sm);
}
.participants .list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  /* margin-top: var(--space-xs); */
  margin: var(--space-xs) 0;
}
.participant {
  font-size: var(--font-size-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--space-sm);
}
.participant.accepted {
  background: var(--state-success);
  color: var(--text-accent);
}
.participant.pending {
  background: var(--state-error);
  color: var(--text-accent);
}
.location {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}
</style>
