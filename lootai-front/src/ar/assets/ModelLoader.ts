import { GLTFLoader } from "three-stdlib"
import * as THREE from "three"

export async function loadGLB(url: string): Promise<THREE.Object3D> {
  const { scene } = await loadGLBWithAnimations(url)
  return scene
}

export interface LoadedModel {
  scene: THREE.Object3D
  mixer: THREE.AnimationMixer | null
}

export async function loadGLBWithAnimations(url: string): Promise<LoadedModel> {
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(url)

  let mixer: THREE.AnimationMixer | null = null
  if (gltf.animations?.length) {
    mixer = new THREE.AnimationMixer(gltf.scene)
    const action = mixer.clipAction(gltf.animations[0])
    action.setLoop(THREE.LoopRepeat)
    action.play()
  }

  return { scene: gltf.scene, mixer }
}
