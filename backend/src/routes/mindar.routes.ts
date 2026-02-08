import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadMindarImage, uploadMindarImageAsync, uploadMindFile, getJobStatus, getMindFile } from "../controllers/mindar.controller";

const router = Router();

// Тестовый роут для проверки подключения
router.get("/test", (req, res) => {
  res.json({ message: "MindAR routes are working!" });
});

/**
 * Настройка multer для загрузки изображений
 */
// Убеждаемся что папка uploads существует
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const mindFileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const ok = file.originalname?.toLowerCase().endsWith(".mind");
  cb(null, !!ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * POST /api/mindar/upload
 * загрузка одного изображения → генерация .mind
 */
router.post(
  "/upload",
  upload.single("image"),
  uploadMindarImage
);

/**
 * POST /api/mindar/upload-multiple
 * загрузка нескольких изображений → генерация .mind (синхронно, долгий ответ)
 */
router.post(
  "/upload-multiple",
  (req, res, next) => {
    console.log("📤 Upload-multiple route hit");
    console.log("Content-Type:", req.headers["content-type"]);
    next();
  },
  upload.array("images", 10), // максимум 10 изображений
  uploadMindarImage
);

/**
 * GET /api/mindar/upload-multiple-async — проверка доступности роута
 */
router.get("/upload-multiple-async", (req, res) => {
  res.json({ ok: true, message: "Use POST to upload images" });
});

/**
 * POST /api/mindar/upload-multiple-async
 * загрузка → быстрый ответ jobId → компиляция в фоне. Клиент опрашивает GET /job/:jobId
 */
router.post(
  "/upload-multiple-async",
  (req, res, next) => {
    console.log("📤 Upload-multiple-async route hit");
    next();
  },
  upload.array("images", 10),
  uploadMindarImageAsync
);

/**
 * POST /api/mindar/upload-mind
 * Загрузить готовый .mind файл (например, скомпилированный на официальном сайте).
 */
router.post(
  "/upload-mind",
  multer({
    storage,
    fileFilter: mindFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }).single("mind"),
  uploadMindFile
);

/**
 * GET /api/mindar/job/:jobId
 * статус задачи компиляции
 */
router.get("/job/:jobId", getJobStatus);

/**
 * GET /api/mindar/file/:id
 * получить сгенерированный mind файл
 */
router.get(
  "/file/:id",
  getMindFile
);

export default router;
