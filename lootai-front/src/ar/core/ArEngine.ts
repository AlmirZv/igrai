// общий интерфейс AR
import * as THREE from 'three'
// import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js'

export interface ArEngine {
    start(): Promise<void>
    stop(): void
  
    addModel(model: THREE.Object3D): void
  
    onAnchorFound(cb: () => void): void
    onAnchorLost(cb: () => void): void
  }
  