import type { ArEngine } from "../core/types"
import { MindImageEngine } from "../engines/MindImageEngine"

export function createArEngine(
  type: "image",
  container: HTMLElement,
  targetSrc: string
): ArEngine {
  if (type === "image") {
    return new MindImageEngine(container, targetSrc)
  }

  throw new Error("Unsupported AR engine")
}
