/**
 * MindImageEngine — стандартный подход по документации MindAR
 * https://hiukim.github.io/mind-ar-js-doc/more-examples/threejs-image/
 *
 * Минимальная логика: MindARThree → addAnchor → anchor.group.add(model) → start → render
 */
import * as THREE from "three"
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js"
import type { ArEngine } from "../core/types"

export class MindImageEngine implements ArEngine {
  private container: HTMLElement
  private targetSrc: string
  private targetCount: number

  private mindar!: MindARThree
  private model: THREE.Object3D | null = null
  private mixers: THREE.AnimationMixer[] = []
  private clock = new THREE.Clock()

  private foundCb?: () => void
  private lostCb?: () => void

  constructor(container: HTMLElement, targetSrc: string, targetCount = 1) {
    this.container = container
    this.targetSrc = targetSrc
    this.targetCount = Math.max(1, Math.min(targetCount, 10))
  }

  async start() {
    this.mindar = new MindARThree({
      container: this.container,
      imageTargetSrc: this.targetSrc,
      uiScanning: "no",
    })

    const { renderer, scene, camera } = this.mindar

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
    scene.add(light)

    for (let i = 0; i < this.targetCount; i++) {
      const anchor = this.mindar.addAnchor(i)
      anchor.onTargetFound = () => this.foundCb?.()
      anchor.onTargetLost = () => this.lostCb?.()
    }

    if (this.model) {
      this.mindar.anchors[0].group.add(this.model)
      for (let i = 1; i < this.targetCount; i++) {
        const clone = this.model.clone(true)
        this.mindar.anchors[i].group.add(clone)
      }
    }

    await this.mindar.start()

    renderer.setAnimationLoop(() => {
      const delta = this.clock.getDelta()
      this.mixers.forEach((m) => m.update(delta))
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
  }

  addAnimationMixer(mixer: THREE.AnimationMixer) {
    this.mixers.push(mixer)
  }

  setTransform(t: {
    position: THREE.Vector3
    rotation: THREE.Euler
    scale: THREE.Vector3
  }) {
    if (!this.model) return
    this.model.position.set(t.position.x, t.position.y, t.position.z)
    this.model.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z)
    this.model.scale.set(t.scale.x, t.scale.y, t.scale.z)
    if (this.mindar && this.targetCount > 1) {
      for (let i = 1; i < this.mindar.anchors.length; i++) {
        const group = this.mindar.anchors[i].group
        for (const child of group.children) {
          child.position.set(t.position.x, t.position.y, t.position.z)
          child.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z)
          child.scale.set(t.scale.x, t.scale.y, t.scale.z)
        }
      }
    }
  }

  onAnchorFound(cb: () => void) {
    this.foundCb = cb
  }

  onAnchorLost(cb: () => void) {
    this.lostCb = cb
  }
}
