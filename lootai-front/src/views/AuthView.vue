<template>
  <div class="auth-container">
    <Card>
      <Stack align="center" gap="sm">
        <Text variant="app-title" color="accent">igrai</Text>
        <Text variant="app-subtitle">Герой в реальном времени</Text>
      </Stack>

      <Stack gap="md">
        <FormField v-if="!isLogin" label="Имя пользователя" :error="error">
          <Input v-model="displayName" type="text" placeholder="Введите ваше имя" />
        </FormField>

        <FormField v-if="!isLogin" label="Пол" :error="error">
          <Select v-model="gender">
            <option value="">Выберите пол</option>
            <option value="male">Мужчина</option>
            <option value="female">Женщина</option>
          </Select>
        </FormField>

        <FormField v-if="!isLogin" label="Дата рождения" :error="error">
          <Input v-model="birthday" type="date" />
        </FormField>

        <FormField label="Email" :error="error">
          <Input v-model="email" type="email" placeholder="Введите email" />
        </FormField>

        <FormField label="Пароль" :error="error">
          <Input v-model="password" type="password" placeholder="Введите пароль" />
        </FormField>

        <Button @click="handleAuth" variant="primary">
          <span v-if="loading">Загрузка...</span>
          <span v-else>{{ isLogin ? 'Войти' : 'Зарегистрироваться' }}</span>
        </Button>

        <Button @click="toggleMode" variant="secondary">
          {{ isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти' }}
        </Button>
      </Stack>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { auth } from '../config/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { Button, Card, FormField, Input, Select, Text, Stack } from '@/designSystem/components'

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const displayName = ref('')
const birthday = ref()
const gender = ref('')
const loading = ref(false)
const error = ref('')

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
}

const handleAuth = async () => {
  if (!email.value || !password.value) {
    error.value = 'Заполните все поля'
    return
  }

  if (!isLogin.value && !displayName.value) {
    error.value = 'Введите имя пользователя'
    return
  }

  if (!isLogin.value && !birthday.value) {
    error.value = 'Введите ваш день рождения'
    return
  }

  if (!isLogin.value && !gender.value) {
    error.value = 'Выберите пол'
    return
  }

  loading.value = true
  error.value = ''

  try {
    if (isLogin.value) {
      // Вход
      await signInWithEmailAndPassword(auth, email.value, password.value)
    } else {
      // Регистрация
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)

      // Обновляем профиль с именем
      if (displayName.value) {
        await updateProfile(userCredential.user, {
          displayName: displayName.value,
          gender: gender.value,
          birthday: birthday.value,
        })
      }
    }
  } catch (err: any) {
    console.error('Auth error:', err)
    error.value = getErrorMessage(err.code)
  } finally {
    loading.value = false
  }
}

const getErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/user-not-found':
      return 'Пользователь не найден'
    case 'auth/wrong-password':
      return 'Неверный пароль'
    case 'auth/email-already-in-use':
      return 'Email уже используется'
    case 'auth/weak-password':
      return 'Пароль слишком слабый'
    case 'auth/invalid-email':
      return 'Неверный email'
    default:
      return 'Произошла ошибка. Попробуйте снова'
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  background: var(--bg-app);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}
</style>
