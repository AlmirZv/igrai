<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="app-title">igrai</h1>
        <!-- <h1 class="app-title">LootAI</h1> -->
        <p class="app-subtitle">Герой в реальном времени</p>
      </div>

      <div class="auth-form">
        <div v-if="!isLogin" class="form-group">
          <label for="displayName">Имя пользователя</label>
          <input
            id="displayName"
            v-model="displayName"
            type="text"
            placeholder="Введите ваше имя"
            class="form-input"
          />
        </div>

        <div v-if="!isLogin" class="form-group">
          <label>Пол:</label>
          <select v-model="gender" class="form-input">
            <option value="male">Мужчина</option>
            <option value="female">Женщина</option>
          </select>
        </div>

        <div v-if="!isLogin" class="form-group">
          <label>Дата рождения:</label>
          <input type="date" v-model="birthday" class="form-input" />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Введите email"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Введите пароль"
            class="form-input"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <Button @click="handleAuth" variant="primary">
          <span v-if="loading">Загрузка...</span>
          <span v-else>{{ isLogin ? 'Войти' : 'Зарегистрироваться' }}</span>
        </Button>

        <Button @click="toggleMode" variant="secondary">
          {{ isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти' }}
        </Button>
      </div>
    </div>
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
import { Button } from '@/designSystem/components'

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

.auth-card {
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--border-subtle);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.app-title {
  font-family: cursive;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin-bottom: var(--space-sm);
}

.app-subtitle {
  color: var(--text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-input {
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--text-primary);
}

.form-input:focus {
  border-color: var(--accent-primary);
}

.error-message {
  background: var(--state-error);
  color: var(--text-onAccent);
  border-radius: var(--radius-sm);
}

.auth-button {
  padding: var(--space-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 50px;
}

.auth-button.primary {
  background: var(--accent-primary);
  color: var(--text-onAccent);
}

.auth-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.auth-button.secondary {
  background: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
}

.auth-button.secondary:hover {
  background: var(--accent-primary);
  color: var(--text-onAccent);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
