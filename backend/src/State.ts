export const State = {
  PORT: parseInt(process.env.PORT as string) || 8000,
  isShuttingDown: false,
  shutdownTimeout: 30000,
  APP_URL:
    process.env.NODE_ENV === "production"
      ? `http://tut_prod_ip:${process.env.PORT}`
      : `http://127.0.0.1:${process.env.PORT}`,
  NODE_ENV: process.env.NODE_ENV,
}
