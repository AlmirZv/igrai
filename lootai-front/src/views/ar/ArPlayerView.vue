<template>
    <div class="ar-root" ref="root"></div>
  
    <button class="start" @click="start">
      Start AR
    </button>
  </template>
  
  <script setup lang="ts">
  import { ref, onUnmounted } from "vue"
  import * as THREE from "three"
  
  import { createArEngine } from "@/ar/anchors/AnchorFactory"
  import { loadGLB } from "@/ar/assets/ModelLoader"
  import { ModelController } from "@/ar/scene/ModelController"
  
  const root = ref<HTMLDivElement | null>(null)
  
  let engine: any
  let controller: ModelController | null = null
  
  async function start() {
    if (!root.value) return
  
    engine = await createArEngine(
      "image",
      root.value,
      "/targets/store.mind"
    )
  
    const model = await loadGLB("/models/test.glb")
  
    controller = new ModelController(model)
  
    engine.addModel(model)
  
    engine.onAnchorFound(() => {
      console.log("anchor found")
    })
  
    await engine.start()
  
    engine.setTransform({
      position: new THREE.Vector3(0, -1, 0.3),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1),
    })
  }
  
  onUnmounted(() => {
    engine?.stop()
  })
  </script>
  
  <style>
  .ar-root {
    position: fixed;
    inset: 0;
  }
  </style>
  