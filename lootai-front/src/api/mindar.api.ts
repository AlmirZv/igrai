import { api } from './axios'
import { API_ORIGIN, isNativeBuild } from '@/config/api'

/** Полный URL для mindar — в native build базовый axios baseURL может не сработать из-за WebView */
function getMindarUploadUrl(): string {
  if (isNativeBuild && API_ORIGIN) {
    return `${API_ORIGIN}/api/mindar/upload-multiple`
  }
  return '' // относительный путь для dev
}

function getMindarUploadAsyncUrl(): string {
  if (isNativeBuild && API_ORIGIN) {
    return `${API_ORIGIN}/api/mindar/upload-multiple-async`
  }
  return ''
}

function getMindarJobUrl(jobId: string): string {
  if (isNativeBuild && API_ORIGIN) {
    return `${API_ORIGIN}/api/mindar/job/${jobId}`
  }
  return ''
}

function getMindarUploadSingleUrl(): string {
  if (isNativeBuild && API_ORIGIN) {
    return `${API_ORIGIN}/api/mindar/upload`
  }
  return ''
}

export const mindarApi = {
  /**
   * Загрузить одно изображение
   */
  uploadImage(file: File) {
    const form = new FormData()
    form.append('image', file)
    const url = getMindarUploadSingleUrl() || 'mindar/upload'

    return api.post(url, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 4 мин — компиляция .mind может быть долгой
    })
  },

  /**
   * Загрузить несколько изображений для генерации .mind файла (синхронно).
   */
  uploadImages(files: File[]) {
    const form = new FormData()
    files.forEach((file) => {
      form.append('images', file)
    })
    const url = getMindarUploadUrl() || 'mindar/upload-multiple'

    return api.post(url, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000,
    })
  },

  /**
   * Загрузить изображения асинхронно: быстрый ответ jobId, компиляция в фоне.
   * Для медленной сети — соединение не держится открытым во время компиляции.
   */
  uploadImagesAsync(files: File[]) {
    const form = new FormData()
    files.forEach((file) => {
      form.append('images', file)
    })
    const url = getMindarUploadAsyncUrl() || 'mindar/upload-multiple-async'
    if (isNativeBuild) console.log('[MindAR API] upload async URL:', url)

    return api.post(url, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600000, // 1 мин на загрузку файлов
    })
  },

  /**
   * Загрузить готовый .mind файл (например, с официального сайта MindAR).
   */
  uploadMindFile(file: File) {
    const form = new FormData()
    form.append('mind', file)
    const url = isNativeBuild && API_ORIGIN
      ? `${API_ORIGIN}/api/mindar/upload-mind`
      : 'mindar/upload-mind'
    return api.post(url, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    })
  },

  /**
   * Опрос статуса задачи компиляции.
   */
  getJobStatus(jobId: string) {
    const url = getMindarJobUrl(jobId) || `mindar/job/${jobId}`
    if (isNativeBuild) console.log('[MindAR API] getJobStatus URL:', url)
    return api.get(url, { timeout: 120000 }) // 2 мин — на мобильной сети компиляция может долго блокировать сервер
  },

  /**
   * URL для .mind. В Capacitor — полный URL. В dev — относительный (proxy).
   */
  getMindFileUrl(id: string) {
    if (isNativeBuild) return `${API_ORIGIN}/api/mindar/file/${id}`
    return `/api/mindar/file/${id}`
  },

  /**
   * Нормализовать URL .mind.
   */
  resolveMindUrl(urlOrId: string): string {
    if (urlOrId.startsWith('http://') || urlOrId.startsWith('https://')) return urlOrId
    if (urlOrId.startsWith('/')) return isNativeBuild ? `${API_ORIGIN}${urlOrId}` : urlOrId
    return this.getMindFileUrl(urlOrId)
  },
}
