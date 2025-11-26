const PORT = parseInt(process.env.PORT as string) || 8000;
const FRONTEND_PORT = parseInt(process.env.FRONTEND_PORT as string) || 5173;
export const State = {
  PORT,
  isShuttingDown: false,
  shutdownTimeout: 1000,
  NODE_ENV: process.env.NODE_ENV,
  CORS_ORIGIN: process.env.NODE_ENV === "production"
    ? ['/']
    : [
      `http://127.0.0.1:${FRONTEND_PORT}`,
      `http://localhost:${FRONTEND_PORT}`
    ]
}
