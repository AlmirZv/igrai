import { GLTFLoader } from "three-stdlib"
import * as THREE from "three"

export async function loadGLB(url: string): Promise<THREE.Object3D> {
  const loader = new GLTFLoader()

  const gltf = await loader.loadAsync(url)
  return gltf.scene
}
