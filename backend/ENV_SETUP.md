# Настройка переменных окружения для Backend

## Расположение файла .env

Файл `.env` должен находиться в **корне проекта** (`d:\lootai\.env`), а не в папке `backend/`.

## Формат FIREBASE_SERVICE_ACCOUNT_KEY

Переменная `FIREBASE_SERVICE_ACCOUNT_KEY` должна содержать **весь JSON объект в одной строке**.

### ❌ НЕПРАВИЛЬНО (многострочный формат):

```env
FIREBASE_SERVICE_ACCOUNT_KEY={
  "type": "service_account",
  "project_id": "your-project",
  ...
}
```

### ✅ ПРАВИЛЬНО (одна строка):

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

### Альтернативный способ (с экранированием):

Если вы хотите использовать многострочный формат, используйте кавычки и экранирование:

```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'
```

## Как получить Service Account Key

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Выберите ваш проект
3. Перейдите в **Project Settings** → **Service Accounts**
4. Нажмите **Generate New Private Key**
5. Скачайте JSON файл
6. Откройте JSON файл и скопируйте **весь его содержимое в одну строку**
7. Вставьте в `.env` файл как значение `FIREBASE_SERVICE_ACCOUNT_KEY`

## Пример полного .env файла

```env
PORT=8000
NODE_ENV=development
FIREBASE_PROJECT_ID=lootai-ba4a1
FIREBASE_STORAGE_BUCKET=lootai-ba4a1.appspot.com
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"lootai-ba4a1","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@lootai-ba4a1.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40lootai-ba4a1.iam.gserviceaccount.com"}
```

## Проверка

После настройки `.env` файла, запустите:

```bash
cd backend
npm run build
npm start
```

Вы должны увидеть:

- ✅ Environment variables loaded from: D:\lootai\.env
- ✅ FIREBASE_SERVICE_ACCOUNT_KEY is set (length: XXXX chars)
- ✅ Using Firebase service account from FIREBASE_SERVICE_ACCOUNT_KEY
- 🔥 Firebase Admin SDK initialized successfully

Если вы видите ошибки, проверьте:

1. Файл `.env` находится в корне проекта (`d:\lootai\.env`)
2. `FIREBASE_SERVICE_ACCOUNT_KEY` записан в одну строку
3. JSON валидный (можно проверить на jsonlint.com)



















