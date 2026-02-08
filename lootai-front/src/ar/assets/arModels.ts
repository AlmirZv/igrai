import { loadGLB, loadGLBWithAnimations } from "./ModelLoader";
import * as THREE from "three";

export interface ArModelResult {
  model: THREE.Object3D;
  mixer: THREE.AnimationMixer | null;
}

/**
 * Доступные модели животных для AR.
 * Файлы в public/models/ (копия из src/components/models/)
 */
// id -> filename в public/models/
const ID_TO_FILE: Record<string, string> = {
  alpaca: "Alpaca",
  bull: "Bull",
  cow: "Cow",
  deer: "Deer",
  donkey: "Donkey",
  fox: "Fox",
  horse: "Horse",
  husky: "Husky",
  "shiba-inu": "Shiba Inu",
  stag: "Stag",
  "white-horse": "White Horse",
  wolf: "Wolf",
};

export const AR_MODEL_IDS = [
  "cube",
  "alpaca",
  "bull",
  "cow",
  "deer",
  "donkey",
  "fox",
  "horse",
  "husky",
  "shiba-inu",
  "stag",
  "white-horse",
  "wolf",
] as const;

export type ArModelId = (typeof AR_MODEL_IDS)[number];

export async function loadArModel(id: string): Promise<THREE.Object3D> {
  const result = await loadArModelWithAnimations(id);
  return result.model;
}

export async function loadArModelWithAnimations(id: string): Promise<ArModelResult> {
  if (id === "cube") {
    const { createCube } = await import("./createCube");
    return { model: createCube(), mixer: null };
  }

  const filename = ID_TO_FILE[id];
  if (!filename) {
    const { createCube } = await import("./createCube");
    return { model: createCube(), mixer: null };
  }

  const encodedName = encodeURIComponent(`${filename}.glb`);
  const url = `/models/${encodedName}`;

  try {
    const { scene, mixer } = await loadGLBWithAnimations(url);
    return { model: scene, mixer };
  } catch (e) {
    console.warn("Model load failed:", id, url, e, "fallback to cube");
    const { createCube } = await import("./createCube");
    return { model: createCube(), mixer: null };
  }
}
