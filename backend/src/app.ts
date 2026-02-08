import express from "express";
import cors from "cors";
import { socketServer } from "./server";
import { State } from "./State";
import apiRoutes from "./routes";

export const app = express();

// Middleware
app.use(
  cors({
    origin: State.CORS_ORIGIN,
    credentials: true,
  }),
);

// Сервер запускается из server.ts (http.createServer(app) + Socket.IO).

// Debug: логируем все запросы (до парсинга тела)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`, req.headers["content-type"]);
  next();
});

// Парсинг JSON только для не-multipart запросов
app.use((req, res, next) => {
  if (req.headers["content-type"]?.includes("multipart/form-data")) {
    return next(); // Пропускаем парсинг JSON для multipart
  }
  express.json({ limit: "50mb" })(req, res, next);
});

app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    message: "LootAI Backend Server",
    version: "1.0.0",
    connectedClients: socketServer.engine.clientsCount,
  });
});

// API Routes - должны быть до error handlers
app.use("/api", apiRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  },
);

// Debug: логируем 404 для диагностики
app.use((req, res, next) => {
  console.log(`[404] ${req.method} ${req.path}`);
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});
