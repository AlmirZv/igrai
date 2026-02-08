import path from "path";
import fs from "fs/promises";

const GENERATED_DIR = path.resolve("generated");

async function ensureDirs() {
  await fs.mkdir(GENERATED_DIR, { recursive: true });
}

/**
 * Canvas из mindar-compiler — тот же экземпляр, что использует OfflineCompiler.
 * Иначе drawImage получает Image из другого canvas и падает с "Image or Canvas expected".
 */
function getMindarCanvas(): { loadImage: (src: string) => Promise<unknown> } {
  const mindarPkg = require.resolve("mindar-compiler/package.json");
  const canvasPath = path.join(path.dirname(mindarPkg), "node_modules", "canvas");
  return require(canvasPath);
}

/**
 * Компиляция изображений в .mind через OfflineCompiler из mindar-compiler.
 * mindar-compiler — локальная зависимость (file:../mindar-compiler/mindar-compiler).
 */
export const mindarService = {
  async generateMindFile(imagePath: string | string[]) {
    await ensureDirs();

    const id = Date.now().toString();
    const outputPath = path.join(GENERATED_DIR, `${id}.mind`);

    const imagePaths = Array.isArray(imagePath) ? imagePath : [imagePath];

    for (const p of imagePaths) {
      await fs.access(p);
    }

    try {
      const { OfflineCompiler } = await import(
        "mindar-compiler/src/image-target/offline-compiler.js"
      );
      const { loadImage } = getMindarCanvas();

      const images = [];
      for (const p of imagePaths) {
        const img = await loadImage(p);
        images.push(img);
      }

      const compiler = new OfflineCompiler();
      await compiler.compileImageTargets(images, (percent: number) => {
        // progressCallback — можно подключить логирование
      });

      const buffer = compiler.exportData();
      await fs.writeFile(outputPath, Buffer.from(buffer));

      return { id, path: outputPath };
    } catch (e: any) {
      console.error("MindAR compile error:", e);
      throw new Error(e.message || "MindAR compile failed");
    }
  },
};
