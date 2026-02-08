/**
 * API конфиг для dev и Capacitor/APK.
 *
 * Dev: VITE_API_URL не задан — используется proxy (относительные /api).
 * Capacitor/APK: задайте VITE_API_URL и VITE_WS_URL с IP ПК в локальной сети:
 *   VITE_API_URL=http://192.168.1.100:8000/api
 *   VITE_WS_URL=http://192.168.1.100:8000
 */
const apiUrl = import.meta.env.VITE_API_URL || ""
const wsUrl = import.meta.env.VITE_WS_URL || ""

/** URL для REST API. Пустой = относительные пути (dev proxy) */
export const API_BASE_URL = apiUrl

/** Origin бэкенда (без /api) — для mindar fetch, полных URL */
export const API_ORIGIN = apiUrl ? apiUrl.replace(/\/api\/?$/, "") : ""

/** WebSocket URL */
export const WS_URL = wsUrl || API_ORIGIN

/** В native build нужны полные URL */
export const isNativeBuild = !!apiUrl
