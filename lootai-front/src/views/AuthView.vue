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

        <button @click="handleAuth" :disabled="loading" class="auth-button primary">
          <span v-if="loading">Загрузка...</span>
          <span v-else>{{ isLogin ? 'Войти' : 'Зарегистрироваться' }}</span>
        </button>

        <button @click="toggleMode" class="auth-button secondary">
          {{ isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти' }}
        </button>
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
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  background: var(--bg-app);
  display: flex;
  align-items: center;
  justify-content: center;
  /* padding: 1rem; */
  padding: var(--space-lg);
}

.auth-card {
  /* background: rgba(255, 255, 255, 0.95); */
  /* backdrop-filter: blur(20px); */
  /* border-radius: 20px; */
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  /* padding: 1rem; */
  width: 100%;
  max-width: 400px;
  /* box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); */
  /* border: 1px solid rgba(255, 255, 255, 0.2); */
  border: 1px solid var(--border-subtle);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-lg);
  /* margin-bottom: 1.5rem; */
}

.app-title {
  font-family: cursive;
  font-size: 2.5rem;
  font-weight: 700;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0; */
  color: var(--accent-primary);
  margin-bottom: var(--space-sm);
}

.app-subtitle {
  /* color: #666;
  font-size: 1rem;
  margin: 0; */
  color: var(--text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  /* gap: 0.5rem; */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  /* gap: 0.5rem; */
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-input {
  /* padding: 0.5rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8); */
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--text-primary);
}

.form-input:focus {
  /* outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); */
  border-color: var(--accent-primary);
}

.error-message {
  /* background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid #fcc; */
  background: var(--state-error);
  color: var(--text-onAccent);
  border-radius: var(--radius-sm);
}

.auth-button {
  /* padding: 1rem; */
  padding: var(--space-lg);
  border: none;
  border-radius: var(--radius-md);
  /* border-radius: 12px; */
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 50px;
}

.auth-button.primary {
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; */
  background: var(--accent-primary);
  color: var(--text-onAccent);
}

.auth-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.auth-button.secondary {
  /* background: transparent;
  color: #667eea;
  border: 2px solid #667eea; */
  background: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
}

.auth-button.secondary:hover {
  /* background: #667eea; */
  background: var(--accent-primary);
  color: white;
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1rem;
    margin: 0.5rem;
  }

  .app-title {
    font-size: 2rem;
  }
}
</style>
