# LootAI - Мобильное приложение с картами

Мобильное приложение, построенное на Vue 3, Capacitor, Leaflet с Express.js backend и Firebase интеграцией.

## 🚀 Технологический стек

### Frontend

- **Vue 3** - Прогрессивный JavaScript фреймворк
- **Capacitor** - Нативная мобильная разработка
- **Leaflet** - Интерактивные карты
- **TypeScript** - Типизированный JavaScript
- **Pinia** - Управление состоянием

### Backend

- **Express.js** - Веб-фреймворк для Node.js
- **Socket.IO** - WebSocket соединения в реальном времени
- **Firebase Admin SDK** - Backend интеграция с Firebase
- **TypeScript** - Типизированный JavaScript

### Мобильные платформы

- **Android** - Нативная Android разработка
- **iOS** - Нативная iOS разработка

## 📁 Структура проекта

```
lootai/
├── lootai-front/          # Vue 3 Frontend
│   ├── src/
│   │   ├── components/    # Vue компоненты
│   │   ├── config/        # Конфигурация (Firebase)
│   │   ├── services/      # Сервисы (WebSocket)
│   │   └── stores/        # Pinia stores
│   ├── android/           # Android проект
│   └── ios/               # iOS проект
├── backend/               # Express.js Backend
│   ├── src/
│   │   ├── config/        # Конфигурация (Firebase)
│   │   ├── socket/        # WebSocket обработчики
│   │   └── server.ts      # Основной сервер
└── README.md
```

## 🛠 Установка и запуск

### Предварительные требования

- Node.js 20+
- npm или yarn
- Android Studio (для Android разработки)
- Xcode (для iOS разработки, только на macOS)

### 1. Клонирование и установка зависимостей

```bash
# Установка зависимостей для frontend
cd lootai-front
npm install

# Установка зависимостей для backend
cd ../backend
npm install
```

### 2. Настройка Firebase

1. Создайте проект в [Firebase Console](https://console.firebase.google.com/)
2. Скопируйте `env.example` в `.env` в обеих папках
3. Заполните Firebase конфигурацию в `.env` файлах

### 3. Запуск в режиме разработки

```bash
# Запуск backend сервера
cd backend
npm run dev

# Запуск frontend (в новом терминале)
cd lootai-front
npm run dev
```

### 4. Сборка для мобильных устройств

```bash
# Сборка frontend
cd lootai-front
npm run build

# Синхронизация с Capacitor
npx cap sync

# Открытие в Android Studio
npx cap open android

# Открытие в Xcode (только на macOS)
npx cap open ios
```

## 📱 Функциональность

### Карты и геолокация

- Интерактивные карты с Leaflet
- Автоматическое определение местоположения
- Отображение маркеров на карте
- Адаптивный дизайн для мобильных устройств

### WebSocket соединения

- Реальное время обновления местоположения
- Чат в реальном времени
- Отслеживание пользователей
- Уведомления о подключении/отключении

### Firebase интеграция

- Аутентификация пользователей
- Cloud Firestore для данных
- Cloud Storage для файлов
- Аналитика

## 🔧 Конфигурация

### Переменные окружения

#### Frontend (.env)

```env
VITE_WS_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

#### Backend (.env)

```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

## 📦 Сборка и развертывание

### Frontend

```bash
npm run build
npx cap sync
npx cap build
```

### Backend

```bash
npm run build
npm start
```

## 🧪 Тестирование

```bash
# Frontend тесты
cd lootai-front
npm run test:unit

# Backend тесты (когда будут добавлены)
cd backend
npm test
```

## 📄 Лицензия

ISC License

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы, создайте issue в репозитории.
