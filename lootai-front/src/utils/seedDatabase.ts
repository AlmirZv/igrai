import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { Task } from '../types/task'

// Функция для генерации случайных координат в радиусе 1км от заданной точки
function generateNearbyCoordinates(
  centerLat: number,
  centerLng: number,
  radiusKm: number = 1,
): { lat: number; lng: number } {
  // Конвертируем километры в градусы (примерно)
  const latKm = 111 // 1 градус широты ≈ 111 км
  const lngKm = 111 * Math.cos((centerLat * Math.PI) / 180) // 1 градус долготы зависит от широты

  // Генерируем случайные координаты в круге
  const angle = Math.random() * 2 * Math.PI
  const distance = Math.random() * radiusKm

  const latOffset = (distance * Math.cos(angle)) / latKm
  const lngOffset = (distance * Math.sin(angle)) / lngKm

  return {
    lat: centerLat + latOffset,
    lng: centerLng + lngOffset,
  }
}

// Тестовые задачи
const sampleTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Уборка парка им. Горького',
    description:
      'Помочь с уборкой листьев и мусора в центральном парке. Принести свои грабли и мешки для мусора.',
    author: 'Муниципалитет',
    authorId: 'municipality-001',
    reward: {
      xp: 50,
      points: 1000,
      inventoryItem: 'badge_cleaner',
    },
    requirements: {
      age: '16',
      gender: 'Любой',
      startTime: 'Сегодня в 10:00',
      membersCount: '10',
      custom: 'Грабли, мешки для мусора',
    },
    participants: [
      {
        id: 'user-001',
        name: 'Анна Петрова',
        avatar: '👩‍🦰',
        status: 'accepted',
      },
      {
        id: 'user-002',
        name: 'Михаил Сидоров',
        avatar: '👨‍💼',
        status: 'pending',
      },
    ],
    status: 'active',
    type: 'public',
    location: {
      lat: 55.7558,
      lng: 37.6176,
      address: 'Парк им. Горького, Москва',
    },
  },
  {
    title: 'Помощь с переездом',
    description:
      'Помочь с переносом мебели и коробок при переезде. Требуется 2-3 человека на 2-3 часа.',
    author: 'Мария Иванова',
    authorId: 'user-003',
    reward: {
      xp: 30,
      points: 2500,
    },
    requirements: {
      age: '18',
      gender: 'Любой',
      startTime: 'Завтра в 14:00',
      membersCount: '3',
      custom: 'Физическая сила',
    },
    participants: [
      {
        id: 'user-004',
        name: 'Дмитрий Козлов',
        avatar: '👨‍🔧',
        status: 'accepted',
      },
    ],
    status: 'active',
    type: 'user',
    location: {
      lat: 55.7558,
      lng: 37.6176,
      address: 'ул. Тверская, 15, Москва',
    },
  },
  {
    title: 'Обучение программированию',
    description:
      'Провести 2-часовое занятие по основам JavaScript для начинающих. Материалы предоставлю.',
    author: 'Алексей Разработчик',
    authorId: 'user-005',
    reward: {
      xp: 40,
      points: 3000,
      inventoryItem: 'book_js',
    },
    requirements: {
      age: '20',
      gender: 'Любой',
      startTime: 'Понедельник в 19:00',
      membersCount: '5',
      custom: 'Знание JavaScript, опыт преподавания',
    },
    participants: [],
    status: 'active',
    type: 'user',
    location: {
      lat: 55.7558,
      lng: 37.6176,
      address: 'IT-центр, Москва',
    },
  },
  {
    title: 'Благоустройство двора',
    description: 'Покраска скамеек, посадка цветов и уборка детской площадки во дворе.',
    author: 'ТСЖ "Солнечный"',
    authorId: 'tsj-001',
    reward: {
      xp: 35,
      points: 800,
    },
    requirements: {
      age: '14',
      gender: 'Любой',
      startTime: 'Выходные',
      membersCount: '8',
      custom: 'Жители дома',
    },
    participants: [
      {
        id: 'user-006',
        name: 'Елена Смирнова',
        avatar: '👩‍🌾',
        status: 'pending',
      },
      {
        id: 'user-007',
        name: 'Сергей Волков',
        avatar: '👨‍🎨',
        status: 'accepted',
      },
    ],
    status: 'active',
    type: 'public',
    location: {
      lat: 55.7558,
      lng: 37.6176,
      address: 'ул. Арбат, 25, Москва',
    },
  },
  {
    title: 'Квест: Поиск сокровищ',
    description:
      'Интерактивный квест по историческому центру города. Решение головоломок и поиск подсказок.',
    author: 'Квест-студия "Загадки"',
    authorId: 'quest-001',
    reward: {
      xp: 60,
      points: 1500,
      inventoryItem: 'treasure_map',
    },
    requirements: {
      age: '12',
      gender: 'Любой',
      startTime: 'Суббота в 15:00',
      membersCount: '6',
      custom: 'Логическое мышление',
    },
    participants: [
      {
        id: 'user-008',
        name: 'Ольга Квест',
        avatar: '🧩',
        status: 'accepted',
      },
      {
        id: 'user-009',
        name: 'Игорь Поиск',
        avatar: '🔍',
        status: 'accepted',
      },
    ],
    status: 'active',
    type: 'quest',
    location: {
      lat: 55.7558,
      lng: 37.6176,
      address: 'Красная площадь, Москва',
    },
  },
  {
    title: 'Волонтерство в приюте',
    description: 'Помощь с выгулом собак, кормлением и уборкой в местном приюте для животных.',
    author: 'Приют "Доброе сердце"',
    authorId: 'shelter-001',
    reward: {
      xp: 45,
      points: 1200,
    },
    requirements: {
      age: '16',
      gender: 'Любой',
      startTime: 'Воскресенье в 10:00',
      membersCount: '4',
      custom: 'Любовь к животным',
    },
    participants: [
      {
        id: 'user-010',
        name: 'Анна Зоозащитница',
        avatar: '🐕',
        status: 'pending',
      },
    ],
    status: 'active',
    type: 'public',
    location: {
      lat: 55.7558,
      lng: 37.6176,
      address: 'Приют "Доброе сердце", Москва',
    },
  },
]

export async function seedTasks(
  currentUserLat: number = 55.7558,
  currentUserLng: number = 37.6176,
) {
  try {
    console.log('Начинаем добавление тестовых задач в базу данных...')

    const tasksRef = collection(db, 'tasks')
    const now = Timestamp.now()

    for (const task of sampleTasks) {
      // Генерируем координаты в радиусе 1км от пользователя
      const coordinates = generateNearbyCoordinates(currentUserLat, currentUserLng, 1)

      const taskData: Task = {
        ...task,
        location: {
          ...task.location!,
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
        createdAt: now,
        updatedAt: now,
        id: '', // Будет сгенерирован Firestore
      }

      const docRef = await addDoc(tasksRef, taskData)
      console.log(`Задача добавлена с ID: ${docRef.id}`)
    }

    console.log('✅ Все тестовые задачи успешно добавлены в базу данных!')
    return true
  } catch (error) {
    console.error('❌ Ошибка при добавлении задач:', error)
    return false
  }
}

// Функция для очистки всех задач (для тестирования)
export async function clearAllTasks() {
  try {
    console.log('Очистка всех задач...')
    // В реальном приложении здесь был бы код для удаления
    console.log('⚠️ Функция очистки требует реализации')
    return true
  } catch (error) {
    console.error('Ошибка при очистке задач:', error)
    return false
  }
}
