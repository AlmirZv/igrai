import * as THREE from "three"

export type AnchorEvents = {
  onFound?: () => void
  onLost?: () => void
}

export interface ArEngine {
  start(): Promise<void>
  stop(): void

  addModel(model: THREE.Object3D): void

  setTransform(t: {
    position: THREE.Vector3
    rotation: THREE.Euler
    scale: THREE.Vector3
  }): void

  onAnchorFound(cb: () => void): void
  onAnchorLost(cb: () => void): void
}
