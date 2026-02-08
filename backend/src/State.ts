const PORT = parseInt(process.env.PORT as string) || 8000;
const FRONTEND_PORT = parseInt(process.env.FRONTEND_PORT as string) || 5173;

// CORS: для Capacitor APK в локальной сети разрешаем capacitor://localhost и всё
const corsOrigin =
  process.env.CORS_ORIGIN === "*"
    ? true
    : process.env.NODE_ENV === "production"
      ? true // production: все origins (Capacitor)
      : [
          `http://127.0.0.1:${FRONTEND_PORT}`,
          `http://localhost:${FRONTEND_PORT}`,
          "capacitor://localhost",
          "http://localhost",
        ];

export const State = {
  PORT,
  isShuttingDown: false,
  shutdownTimeout: 1000,
  NODE_ENV: process.env.NODE_ENV,
  CORS_ORIGIN: corsOrigin,
}
