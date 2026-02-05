import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { mindarService } from "../services/mindar.service";

/**
 * POST /api/mindar/upload
 * загрузка изображения → генерация .mind
 */
export const uploadMindarImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Image file is required",
      });
    }

    const imagePath = req.file.path;

    const result = await mindarService.generateMindFile(imagePath);

    return res.json({
      success: true,
      mindId: result.id,
      mindUrl: `/api/mindar/file/${result.id}`,
    });

  } catch (error: any) {
    console.error("MindAR upload error:", error);

    return res.status(500).json({
      error: "Mind file generation failed",
      message: error.message,
    });
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
