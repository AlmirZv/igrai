import type { ArEngine } from "../core/types"

export async function createArEngine(
  type: "image",
  container: HTMLElement,
  targetSrc: string,
  options?: { targetCount?: number }
): Promise<ArEngine> {
  if (type === "image") {
    const { MindImageEngine } = await import("../engines/MindImageEngine")
    return new MindImageEngine(container, targetSrc, options?.targetCount ?? 1)
  }

  throw new Error("Unsupported AR engine")
}
