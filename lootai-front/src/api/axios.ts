import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export const api = axios.create({
  baseURL: API_BASE_URL || "/api", // Capacitor: VITE_API_URL; dev: proxy /api
  timeout: 180000, // 3 мин — загрузка файлов и генерация .mind
});

/**
 * interceptor — можно добавить токен
 */
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * обработка ошибок
 */
api.interceptors.response.use(
  res => res,
  err => {
    console.error("API error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);
