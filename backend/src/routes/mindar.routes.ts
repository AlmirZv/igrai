import { Router } from "express";
import multer from "multer";
import path from "path";
import { uploadMindarImage, getMindFile } from "../controllers/mindar.controller";

const router = Router();

/**
 * Настройка multer для загрузки изображений
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("uploads"));
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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * POST /api/mindar/upload
 * загрузка изображения → генерация .mind
 */
router.post(
  "/upload",
  upload.single("image"),
  uploadMindarImage
);

/**
 * GET /api/mindar/file/:id
 * получить сгенерированный mind файл
 */
router.get(
  "/file/:id",
  getMindFile
);

export default router;
