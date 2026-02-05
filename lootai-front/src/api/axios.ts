import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 15000,
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
