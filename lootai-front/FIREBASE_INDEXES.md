# 🔥 Firebase Firestore Индексы

## Текущее состояние

Приложение теперь работает **без индексов**, используя простые запросы и локальную фильтрацию. Это решение подходит для разработки и небольших объемов данных.

## Когда создавать индексы

Создавайте индексы, если:

- У вас много данных (1000+ документов)
- Запросы работают медленно
- Планируете использовать сложные фильтры

## Необходимые индексы

### 1. Для коллекции `tasks`

#### Индекс для задач пользователя:

```
Коллекция: tasks
Поля:
- participants (Array-contains)
- status (Ascending)
- createdAt (Descending)
```

#### Индекс для созданных задач:

```
Коллекция: tasks
Поля:
- authorId (Ascending)
- createdAt (Descending)
```

#### Индекс для истории задач:

```
Коллекция: tasks
Поля:
- participants (Array-contains)
- status (Ascending)
- updatedAt (Descending)
```

### 2. Для коллекции `chats`

#### Индекс для чатов пользователя:

```
Коллекция: chats
Поля:
- participants (Array-contains)
- isActive (Ascending)
- updatedAt (Descending)
```

## Как создать индексы

### Способ 1: Через Firebase Console (Рекомендуется)

1. Откройте [Firebase Console](https://console.firebase.google.com)
2. Выберите проект `lootai-ba4a1`
3. Перейдите в **Firestore Database** → **Indexes**
4. Нажмите **Create Index**
5. Добавьте поля в указанном порядке
6. Дождитесь создания индекса (может занять несколько минут)

### Способ 2: Через firestore.indexes.json

Создайте файл `firestore.indexes.json` в корне проекта:

```json
{
  "indexes": [
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "participants",
          "arrayConfig": "CONTAINS"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "authorId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "participants",
          "arrayConfig": "CONTAINS"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "chats",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "participants",
          "arrayConfig": "CONTAINS"
        },
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Затем выполните:

```bash
firebase deploy --only firestore:indexes
```

## После создания индексов

После создания индексов можно вернуть сложные запросы в код:

### Tasks.vue

```typescript
// Вместо простого запроса
const userTasksQuery = query(tasksRef, where('participants', 'array-contains', uid))

// Можно использовать сложный запрос
const userTasksQuery = query(
  tasksRef,
  where('participants', 'array-contains', uid),
  where('status', '==', 'active'),
  orderBy('createdAt', 'desc'),
)
```

### ChatPage.vue

```typescript
// Вместо простого запроса
const userChatsQuery = query(chatsRef, where('participants', 'array-contains', uid))

// Можно использовать сложный запрос
const userChatsQuery = query(
  chatsRef,
  where('participants', 'array-contains', uid),
  where('isActive', '==', true),
  orderBy('updatedAt', 'desc'),
)
```

## Мониторинг производительности

### Firebase Console

- **Firestore** → **Usage** - показывает количество операций чтения/записи
- **Performance** - мониторинг производительности запросов

### В коде

```typescript
// Добавьте логирование времени выполнения
const startTime = performance.now()
const snapshot = await getDocs(query)
const endTime = performance.now()
console.log(`Query took ${endTime - startTime} milliseconds`)
```

## Стоимость индексов

- **Создание индексов**: Бесплатно
- **Хранение индексов**: ~$0.18 за ГБ в месяц
- **Операции записи**: Увеличиваются при изменении индексированных полей

## Рекомендации

1. **Для разработки**: Используйте текущее решение без индексов
2. **Для тестирования**: Создайте индексы для проверки производительности
3. **Для продакшена**: Обязательно создайте индексы при большом количестве данных
4. **Мониторинг**: Следите за производительностью и стоимостью

---

**Текущее решение работает отлично для разработки!** 🚀
Индексы нужны только при масштабировании приложения.
