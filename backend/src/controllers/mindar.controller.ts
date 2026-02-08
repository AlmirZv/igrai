import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { mindarService } from "../services/mindar.service";
import { mindarJobs } from "../services/mindar-jobs";

/**
 * POST /api/mindar/upload-multiple-async
 * Загрузка изображений → быстрый ответ с jobId → компиляция в фоне.
 * Клиент опрашивает GET /api/mindar/job/:jobId пока status !== 'done'.
 */
export const uploadMindarImageAsync = async (req: Request, res: Response) => {
  try {
    const files: any[] = (req as any).files
      ? (Array.isArray((req as any).files) ? (req as any).files : [(req as any).files]).flat()
      : [];

    if (files.length === 0) {
      return res.status(400).json({ error: "At least one image file is required" });
    }

    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    mindarJobs.create(jobId);

    const imagePaths = files
      .map((f: any) => f.path || (f.destination && f.filename ? path.join(f.destination, f.filename) : null))
      .filter(Boolean);

    console.log("[MindAR] Async upload OK, jobId:", jobId);
    res.json({ success: true, jobId });

    // Откладываем старт компиляции — даём event loop обработать первый poll от клиента.
    // TensorFlow.js блокирует event loop, иначе poll таймаутит.
    setImmediate(() => {
      mindarService
        .generateMindFile(imagePaths.length === 1 ? imagePaths[0] : imagePaths)
        .then((result) => {
          mindarJobs.setDone(jobId, result.id);
          for (const p of imagePaths) {
            fs.unlink(p).catch(() => {});
          }
        })
        .catch((err) => {
          mindarJobs.setError(jobId, err.message || "Compilation failed");
        });
    });
  } catch (error: any) {
    console.error("❌ MindAR async upload error:", error);
    res.status(500).json({ error: error.message || "Upload failed" });
  }
};

/**
 * GET /api/mindar/job/:jobId
 * Статус задачи компиляции.
 */
export const getJobStatus = (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = mindarJobs.get(jobId);
  if (!job) {
    console.log("[MindAR] Job not found:", jobId);
    return res.status(404).json({ error: "Job not found" });
  }
  res.json(job);
};

/**
 * POST /api/mindar/upload
 * загрузка изображения → генерация .mind
 */
export const uploadMindarImage = async (req: Request, res: Response) => {
  try {
    console.log("📥 uploadMindarImage called");
    console.log("req.file:", (req as any).file);
    console.log("req.files:", (req as any).files);
    
    // Поддержка как одного файла, так и массива файлов
    const files: any[] = (req as any).files 
      ? (Array.isArray((req as any).files) ? (req as any).files : [(req as any).files]).flat()
      : (req as any).file 
        ? [(req as any).file]
        : [];

    console.log(`📁 Found ${files.length} file(s)`);

    if (files.length === 0) {
      return res.status(400).json({
        error: "At least one image file is required",
      });
    }

    const imagePaths = files.map((f: any) => {
      // multer diskStorage: path = полный путь, иначе destination + filename
      const p = f.path || (f.destination && f.filename ? path.join(f.destination, f.filename) : null);
      return p;
    }).filter(Boolean);

    const result = await mindarService.generateMindFile(
      imagePaths.length === 1 ? imagePaths[0] : imagePaths
    );

    // Удаляем загруженные изображения после успешной компиляции, чтобы не засорять uploads
    for (const p of imagePaths) {
      try {
        await fs.unlink(p);
        console.log("🗑️ Deleted uploaded image:", p);
      } catch (err) {
        console.warn("Could not delete uploaded image after compilation:", p, err);
      }
    }

    return res.json({
      success: true,
      mindId: result.id,
      mindUrl: `/api/mindar/file/${result.id}`,
    });

  } catch (error: any) {
    console.error("❌ MindAR upload error:", error);
    console.error("   Stack:", error.stack);

    return res.status(500).json({
      error: "Mind file generation failed",
      message: error.message || "Unknown error",
    });
  }
};


/**
 * POST /api/mindar/upload-mind
 * Загрузить готовый .mind файл (например, скомпилированный на официальном сайте MindAR).
 */
export const uploadMindFile = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file || !file.path) {
      return res.status(400).json({ error: "No .mind file uploaded" });
    }

    const id = Date.now().toString();
    const generatedDir = path.resolve("generated");
    await fs.mkdir(generatedDir, { recursive: true });
    const destPath = path.join(generatedDir, `${id}.mind`);
    await fs.copyFile(file.path, destPath);
    await fs.unlink(file.path).catch(() => {});

    console.log("[MindAR] Uploaded .mind file, id:", id);
    return res.json({
      success: true,
      mindId: id,
      mindUrl: `/api/mindar/file/${id}`,
    });
  } catch (error: any) {
    console.error("❌ MindAR upload .mind error:", error);
    return res.status(500).json({ error: error.message || "Upload failed" });
  }
};

/**
 * GET /api/mindar/file/:id
 * отдать mind файл клиенту
 */
export const getMindFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const filePath = path.resolve("generated", `${id}.mind`);

    await fs.access(filePath);

    return res.sendFile(filePath);

  } catch {
    return res.status(404).json({
      error: "Mind file not found",
    });
  }
};
