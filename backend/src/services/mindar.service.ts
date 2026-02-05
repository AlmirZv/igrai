import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);

const GENERATED_DIR = path.resolve("generated");

async function ensureDirs() {
  await fs.mkdir(GENERATED_DIR, { recursive: true });
}

export const mindarService = {

  /**
   * Генерация .mind файла из изображения
   */
  async generateMindFile(imagePath: string) {
    await ensureDirs();

    const id = Date.now().toString();
    const outputPath = path.join(GENERATED_DIR, `${id}.mind`);

    const command = `npx mindar-image-target-compiler "${imagePath}" "${outputPath}"`;

    try {
      console.log("MindAR compile start:", command);

      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        console.warn("MindAR stderr:", stderr);
      }

      // Проверяем что файл реально создан
      await fs.access(outputPath);

      console.log("MindAR compile success:", outputPath);

      return {
        id,
        path: outputPath,
      };

    } catch (error: any) {
      console.error("MindAR compile failed:", error);

      throw new Error("MindAR compilation failed");
    }
  },

};
