# Сборка APK через Capacitor

## 0. Предварительные требования

- **Android Studio** или **Android SDK** (cmdline-tools) установлены
- Файл `android/local.properties` — Gradle ищет SDK по переменной `ANDROID_HOME` или по `sdk.dir` в этом файле

Если билд падает с `JdkImageTransform` / `jlink.exe` / `core-for-system-modules.jar`:
- Исправлено в AGP 8.7.2. Проект использует Android Gradle Plugin 8.7.2.
- Альтернатива: установите JDK 17 и укажите `org.gradle.java.home` на него в `gradle.properties`.

Если билд падает с `Cannot find a Java installation... languageVersion=21`:
- Gradle требует Java 21. Убедитесь, что установлен JDK 21 (Android Studio ставит его в `AppData\Local\Android\cmdline-tools\jdk-21`).
- В `android/gradle.properties` добавьте: `org.gradle.java.home=C:/Users/YOUR_USERNAME/AppData/Local/Android/cmdline-tools/jdk-21`

Если билд падает с `SDK location not found`:
1. Установите [Android Studio](https://developer.android.com/studio) (он установит SDK)
2. Создайте `android/local.properties`:
   ```
   sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android
   ```
   Или укажите путь к папке SDK (обычно `AppData\\Local\\Android` или `AppData\\Local\\Android\\Sdk`).

## 1. Подготовка

Убедитесь, что бэкенд и фронт на одном ПК в локальной сети. Узнайте IP ПК:

- **Windows**: `ipconfig` → IPv4 (например 192.168.1.100)
- **macOS/Linux**: `ifconfig` или `ip addr`

## 2. Настройка .env для APK

Создайте `.env` в `lootai-front/` с URL бэкенда:

```env
VITE_API_URL=http://192.168.1.100:3000/api
VITE_WS_URL=http://192.168.1.100:3000
```

Замените `192.168.1.100` на IP вашего ПК.

## 3. Сборка фронта и APK

```bash
cd lootai-front

# Установка зависимостей (если ещё не сделано)
npm install

# Сборка APK (использует build-only, без type-check)
npm run android:apk
```

APK появится в `android/app/build/outputs/apk/debug/app-debug.apk`.

**Windows:** если `gradlew` не запускается, выполните вручную:
```cmd
cd lootai-front
npm run build-only
npx cap sync android
cd android
gradlew.bat assembleDebug
```

## 4. Запуск бэкенда

На ПК в той же сети:

```bash
cd backend
npm run dev
```

Бэкенд должен слушать на `0.0.0.0` (все интерфейсы). В корневом `.env` (или `backend/.env`):

```env
PORT=3000
# Обязательно для APK — иначе CORS блокирует запросы с телефона
CORS_ORIGIN=*
```

**Если APK не подключается к бэку:**
1. Узнайте IP ПК: `ipconfig` → IPv4 (напр. 192.168.1.2). Если IP поменялся — обновите `lootai-front/.env` и **пересоберите** APK.
2. Добавьте `CORS_ORIGIN=*` в `.env` бэкенда (корень проекта).
3. Windows Firewall: разрешите входящие подключения для Node.js.
4. Проверьте: на ПК откройте `http://192.168.1.2:3000/api/status` в браузере — должен вернуть JSON.

## 5. Установка APK на устройство

Скопируйте `app-debug.apk` на телефон и установите. Убедитесь, что телефон и ПК в одной Wi‑Fi сети.

## Релизный APK (для продакшена)

```bash
cd lootai-front
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

Подписанный APK будет в `android/app/build/outputs/apk/release/`.
