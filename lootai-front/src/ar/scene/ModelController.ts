// move/rotate/scale
import * as THREE from "three"

export class ModelController {
  constructor(private model: THREE.Object3D) {}

  move(dx: number, dy: number, dz: number) {
    this.model.position.x += dx
    this.model.position.y += dy
    this.model.position.z += dz
  }

  rotateY(rad: number) {
    this.model.rotation.y += rad
  }

  scale(f: number) {
    this.model.scale.multiplyScalar(f)
  }

  getTransform() {
    return {
      position: this.model.position.clone(),
      rotation: this.model.rotation.clone(),
      scale: this.model.scale.clone(),
    }
  }
}
