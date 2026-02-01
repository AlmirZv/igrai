// image anchors
import * as THREE from "three"
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js"
import type { ArEngine } from "../core/types"

export class MindImageEngine implements ArEngine {
  private container: HTMLElement
  private targetSrc: string

  private mindar!: MindARThree
  private anchor: any
  private model: THREE.Object3D | null = null

  private foundCb?: () => void
  private lostCb?: () => void

  constructor(container: HTMLElement, targetSrc: string) {
    this.container = container
    this.targetSrc = targetSrc
  }

  async start() {
    this.mindar = new MindARThree({
      container: this.container,
      imageTargetSrc: this.targetSrc,
    })

    const { renderer, scene, camera } = this.mindar

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
    scene.add(light)

    this.anchor = this.mindar.addAnchor(0)

    this.anchor.onTargetFound = () => {
      this.foundCb?.()
    }

    this.anchor.onTargetLost = () => {
      this.lostCb?.()
    }

    if (this.model) {
      this.anchor.group.add(this.model)
    }

    await this.mindar.start()

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera)
    })
  }

  stop() {
    if (!this.mindar) return
    this.mindar.stop()
    this.mindar.renderer.setAnimationLoop(null)
  }

  addModel(model: THREE.Object3D) {
    this.model = model
    if (this.anchor) {
      this.anchor.group.add(model)
    }
  }

  setTransform(t: {
    position: THREE.Vector3
    rotation: THREE.Euler
    scale: THREE.Vector3
  }) {
    if (!this.model) return

    this.model.position.copy(t.position)
    this.model.rotation.copy(t.rotation)
    this.model.scale.copy(t.scale)
  }

  onAnchorFound(cb: () => void) {
    this.foundCb = cb
  }

  onAnchorLost(cb: () => void) {
    this.lostCb = cb
  }
}
