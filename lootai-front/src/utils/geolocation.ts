// Утилиты для работы с геолокацией

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface GeolocationError {
  code: number
  message: string
}

// Получение текущего местоположения пользователя
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: -1,
        message: 'Геолокация не поддерживается браузером',
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject({
          code: error.code,
          message: getGeolocationErrorMessage(error.code),
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 минут
      },
    )
  })
}

// Получение сообщения об ошибке геолокации
function getGeolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Доступ к геолокации запрещен пользователем'
    case 2:
      return 'Не удалось определить местоположение'
    case 3:
      return 'Превышено время ожидания'
    default:
      return 'Неизвестная ошибка геолокации'
  }
}

// Вычисление расстояния между двумя точками (в километрах)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Радиус Земли в километрах
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Проверка, находится ли точка в радиусе от центра
export function isWithinRadius(
  centerLat: number,
  centerLon: number,
  pointLat: number,
  pointLon: number,
  radiusKm: number,
): boolean {
  const distance = calculateDistance(centerLat, centerLon, pointLat, pointLon)
  return distance <= radiusKm
}

// Координаты по умолчанию (Москва)
export const DEFAULT_COORDINATES: Coordinates = {
  latitude: 55.7558,
  longitude: 37.6176,
}

// Популярные города России
export const RUSSIAN_CITIES: Record<string, Coordinates> = {
  moscow: { latitude: 55.7558, longitude: 37.6176 },
  spb: { latitude: 59.9311, longitude: 30.3609 },
  novosibirsk: { latitude: 55.0084, longitude: 82.9357 },
  yekaterinburg: { latitude: 56.8431, longitude: 60.6454 },
  kazan: { latitude: 55.8304, longitude: 49.0661 },
  nizhny_novgorod: { latitude: 56.3269, longitude: 44.0075 },
  chelyabinsk: { latitude: 55.1644, longitude: 61.4368 },
  omsk: { latitude: 54.9885, longitude: 73.3242 },
  samara: { latitude: 53.2001, longitude: 50.15 },
  rostov_on_don: { latitude: 47.2357, longitude: 39.7015 },
}
