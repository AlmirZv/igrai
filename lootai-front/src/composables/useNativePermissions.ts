/**
 * Запрос разрешений при запуске на Capacitor/Android.
 * Вызов getCurrentPosition и getUserMedia один раз триггерит системный диалог.
 */
import { Capacitor } from '@capacitor/core'

export async function requestNativePermissions() {
  if (!Capacitor.isNativePlatform()) return

  // Геолокация — один запрос покажет диалог «Разрешить доступ к местоположению»
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      () => {},
      () => {},
      { timeout: 3000, enableHighAccuracy: false }
    )
  }

  // Камера — запрос через 1.5 с, чтобы не перекрывать диалог геолокации
  if (navigator.mediaDevices?.getUserMedia) {
    setTimeout(() => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach((t) => t.stop())
        })
        .catch(() => {})
    }, 1500)
  }
}
