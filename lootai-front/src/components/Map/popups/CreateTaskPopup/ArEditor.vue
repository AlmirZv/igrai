<template>
  <Teleport to="body">
    <div class="ar-editor-overlay" v-if="isOpen">
      <div class="ar-editor-container">
      <div class="ar-editor-header">
        <h3>{{ $t('map.popup.arEditor.title') || 'AR Editor' }}</h3>
        <Button variant="secondary" @click="close">
          {{ $t('map.buttons.close') || 'Close' }}
        </Button>
      </div>

      <div class="ar-editor-content">
        <div class="ar-viewport" ref="arContainer"></div>
        
        <div class="ar-warning" v-if="mode === 'fallback'">
          {{ $t('map.popup.arEditor.noTargetYet') || 'Image target ещё не сгенерирован (.mind). Сейчас: камера + модель без трекинга якоря.' }}
        </div>

        <div class="ar-controls-panel">
          <div class="ar-controls-row ar-controls-row--label">
            {{ $t('map.popup.arEditor.controls') || 'Настройте положение модели относительно якоря' }}
          </div>

          <div class="ar-controls-row">
            <Button class="ar-control-button" @click="moveUp">↑</Button>
          </div>

          <div class="ar-controls-row">
            <Button class="ar-control-button" @click="moveLeft">←</Button>
            <Button class="ar-control-button" @click="moveDown">↓</Button>
            <Button class="ar-control-button" @click="moveRight">→</Button>
          </div>

          <div class="ar-controls-row">
            <Button class="ar-control-button" @click="moveCloser">
              {{ $t('map.popup.arEditor.closer') || 'Ближе' }}
            </Button>
            <Button class="ar-control-button" @click="moveFarther">
              {{ $t('map.popup.arEditor.farther') || 'Дальше' }}
            </Button>
          </div>

          <div class="ar-controls-row">
            <Button class="ar-control-button" @click="rotateLeft">
              {{ $t('map.popup.arEditor.rotateLeft') || 'Повернуть ⟲' }}
            </Button>
            <Button class="ar-control-button" @click="rotateRight">
              {{ $t('map.popup.arEditor.rotateRight') || 'Повернуть ⟳' }}
            </Button>
          </div>

          <div class="ar-controls-row">
            <Button class="ar-control-button" @click="scaleDown">-</Button>
            <span class="ar-scale-label">
              {{ $t('map.popup.arEditor.scale') || 'Масштаб' }}
            </span>
            <Button class="ar-control-button" @click="scaleUp">+</Button>
          </div>

          <div class="ar-controls-row ar-controls-row--actions">
            <Button class="ar-control-button secondary" @click="resetTransform">
              {{ $t('map.buttons.reset') || 'Сбросить' }}
            </Button>
            <Button class="ar-control-button primary" @click="saveTransform">
              {{ $t('map.buttons.save') || 'Сохранить' }}
            </Button>
          </div>
        </div>
      </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
// @ts-ignore - three.js types are included in the package
import * as THREE from 'three'
import { createArEngine } from '@/ar/anchors/AnchorFactory'
import { createCube } from '@/ar/assets/createCube'
import { Input, Button } from '@/designSystem/components'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', transform: {
    position: { x: number; y: number; z: number }
    rotation: { x: number; y: number; z: number }
    scale: { x: number; y: number; z: number }
  }): void
}>()

type Mode = 'mindar' | 'fallback'

const isOpen = ref(false)
const mode = ref<Mode>('mindar')

const arContainer = ref<HTMLElement | null>(null)
let engine: any = null

// fallback mode internals
let fallbackVideo: HTMLVideoElement | null = null
let fallbackStream: MediaStream | null = null
let fallbackRenderer: THREE.WebGLRenderer | null = null
let fallbackScene: THREE.Scene | null = null
let fallbackCamera: THREE.PerspectiveCamera | null = null
let fallbackModel: THREE.Object3D | null = null
let fallbackLoopHandle: number | null = null

const transform = ref({
  position: { x: 0, y: 0, z: 0.3 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 }
})

const MOVE_STEP = 0.05
const DEPTH_STEP = 0.05
const ROTATE_STEP = 0.2
const SCALE_STEP = 0.1

function isMindFile(url: string) {
  return url.toLowerCase().includes('.mind')
}

async function startMindAr(targetUrl: string, initial?: typeof transform.value) {
  // Wait for DOM to be ready
  await nextTick()
  
  if (!arContainer.value) {
    console.error('AR container not available')
    return
  }

  try {
    mode.value = 'mindar'
    console.log('Starting MindAR with target:', targetUrl)
    
    // Clear container first
    arContainer.value.innerHTML = ''
    
    // Создаем AR engine
    engine = createArEngine(
      'image',
      arContainer.value,
      targetUrl
    )

    // Создаем простой куб (временно)
    const cube = createCube()
    engine.addModel(cube)

    // Применяем начальный transform (если есть)
    if (initial) transform.value = { ...initial }
    updateTransform()
    
    // Запускаем AR
    console.log('Starting AR engine...')
    await engine.start()
    console.log('AR engine started successfully')
    
    engine.onAnchorFound(() => {
      console.log('Anchor found in editor')
    })
    
    engine.onAnchorLost(() => {
      console.log('Anchor lost in editor')
    })
  } catch (error) {
    console.error('Error starting AR editor:', error)
    // Fallback to camera mode if MindAR fails
    console.log('Falling back to camera mode')
    await startFallbackCamera(initial)
  }
}

async function startFallbackCamera(initial?: typeof transform.value) {
  // Wait for DOM to be ready
  await nextTick()
  
  if (!arContainer.value) {
    console.error('AR container not available')
    return
  }

  mode.value = 'fallback'
  console.log('Starting fallback camera mode')
  
  if (initial) transform.value = { ...initial }

  // Clear container
  arContainer.value.innerHTML = ''

  try {
    // Video
    fallbackVideo = document.createElement('video')
    fallbackVideo.setAttribute('playsinline', 'true')
    fallbackVideo.muted = true
    fallbackVideo.autoplay = true
    fallbackVideo.style.position = 'absolute'
    fallbackVideo.style.top = '0'
    fallbackVideo.style.left = '0'
    fallbackVideo.style.width = '100%'
    fallbackVideo.style.height = '100%'
    fallbackVideo.style.objectFit = 'cover'
    fallbackVideo.style.zIndex = '1'
    arContainer.value.appendChild(fallbackVideo)

    console.log('Requesting camera access...')
    fallbackStream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false,
    })
    console.log('Camera access granted')
    
    fallbackVideo.srcObject = fallbackStream
    await fallbackVideo.play()
    console.log('Video playing')
  } catch (error) {
    console.error('Failed to start camera:', error)
    return
  }

  // Three overlay
  fallbackRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  fallbackRenderer.setPixelRatio(window.devicePixelRatio || 1)
  fallbackRenderer.domElement.style.position = 'absolute'
  fallbackRenderer.domElement.style.top = '0'
  fallbackRenderer.domElement.style.left = '0'
  fallbackRenderer.domElement.style.width = '100%'
  fallbackRenderer.domElement.style.height = '100%'
  fallbackRenderer.domElement.style.pointerEvents = 'none'
  fallbackRenderer.domElement.style.zIndex = '2'
  arContainer.value.appendChild(fallbackRenderer.domElement)

  const w = arContainer.value.clientWidth || window.innerWidth
  const h = arContainer.value.clientHeight || window.innerHeight
  fallbackRenderer.setSize(w, h, false)

  fallbackScene = new THREE.Scene()
  fallbackCamera = new THREE.PerspectiveCamera(60, w / h, 0.01, 100)
  fallbackCamera.position.set(0, 0, 1)

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
  fallbackScene.add(light)

  fallbackModel = createCube()
  fallbackScene.add(fallbackModel)
  applyTransformToFallbackModel()

  const loop = () => {
    if (!fallbackRenderer || !fallbackScene || !fallbackCamera) return
    fallbackRenderer.render(fallbackScene, fallbackCamera)
    fallbackLoopHandle = requestAnimationFrame(loop)
  }
  loop()
}

function stopAll() {
  if (engine) {
    engine.stop()
    engine = null
  }

  if (fallbackLoopHandle != null) {
    cancelAnimationFrame(fallbackLoopHandle)
    fallbackLoopHandle = null
  }

  if (fallbackRenderer) {
    fallbackRenderer.dispose()
    fallbackRenderer.domElement.remove()
    fallbackRenderer = null
  }

  if (fallbackStream) {
    fallbackStream.getTracks().forEach((t) => t.stop())
    fallbackStream = null
  }

  if (fallbackVideo) {
    fallbackVideo.pause()
    fallbackVideo.srcObject = null
    fallbackVideo.remove()
    fallbackVideo = null
  }

  fallbackScene = null
  fallbackCamera = null
  fallbackModel = null
}

function updateTransform() {
  if (!engine) return
  
  const t = {
    position: new THREE.Vector3(
      transform.value.position.x,
      transform.value.position.y,
      transform.value.position.z
    ),
    rotation: new THREE.Euler(
      transform.value.rotation.x,
      transform.value.rotation.y,
      transform.value.rotation.z
    ),
    scale: new THREE.Vector3(
      transform.value.scale.x,
      transform.value.scale.y,
      transform.value.scale.z
    )
  }
  
  engine.setTransform(t)
}

function applyTransformToFallbackModel() {
  if (!fallbackModel) return
  fallbackModel.position.set(
    transform.value.position.x,
    transform.value.position.y,
    transform.value.position.z,
  )
  fallbackModel.rotation.set(
    transform.value.rotation.x,
    transform.value.rotation.y,
    transform.value.rotation.z,
  )
  fallbackModel.scale.set(transform.value.scale.x, transform.value.scale.y, transform.value.scale.z)
}

function move(dx: number, dy: number, dz: number) {
  transform.value.position.x += dx
  transform.value.position.y += dy
  transform.value.position.z += dz
  updateTransform()
  applyTransformToFallbackModel()
}

function moveUp() {
  move(0, MOVE_STEP, 0)
}

function moveDown() {
  move(0, -MOVE_STEP, 0)
}

function moveLeft() {
  move(-MOVE_STEP, 0, 0)
}

function moveRight() {
  move(MOVE_STEP, 0, 0)
}

function moveCloser() {
  move(0, 0, -DEPTH_STEP)
}

function moveFarther() {
  move(0, 0, DEPTH_STEP)
}

function rotateY(delta: number) {
  transform.value.rotation.y += delta
  updateTransform()
  applyTransformToFallbackModel()
}

function rotateLeft() {
  rotateY(-ROTATE_STEP)
}

function rotateRight() {
  rotateY(ROTATE_STEP)
}

function scaleUniform(delta: number) {
  const next = Math.max(0.1, transform.value.scale.x + delta)
  transform.value.scale.x = next
  transform.value.scale.y = next
  transform.value.scale.z = next
  updateTransform()
  applyTransformToFallbackModel()
}

function scaleUp() {
  scaleUniform(SCALE_STEP)
}

function scaleDown() {
  scaleUniform(-SCALE_STEP)
}

function resetTransform() {
  transform.value = {
    position: { x: 0, y: 0, z: 0.3 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  }
  updateTransform()
  applyTransformToFallbackModel()
}

function saveTransform() {
  emit('save', { ...transform.value })
  close()
}

function close() {
  stopAll()
  isOpen.value = false
  emit('close')
}

/**
 * IMPORTANT: call this from a user gesture (click/tap). Camera can fail to open otherwise on mobile.
 */
async function openFromGesture(params: {
  imageTargetUrl?: string
  initialTransform?: typeof transform.value
}) {
  stopAll()
  isOpen.value = true

  const targetUrl = params.imageTargetUrl
  const initial = params.initialTransform

  // If we don't have a generated .mind yet, use fallback camera so user can still set transform.
  if (!targetUrl || !isMindFile(targetUrl)) {
    await startFallbackCamera(initial)
    return
  }

  await startMindAr(targetUrl, initial)
}

defineExpose({ openFromGesture, close })

onUnmounted(() => {
  stopAll()
})
</script>

<style scoped>
.ar-editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
  display: block;
}

.ar-editor-container {
  width: 100vw;
  height: 100vh;
  background: #000;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ar-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(0, 0, 0, 0.8);
  z-index: 20;
  position: relative;
}

.ar-editor-content {
  flex: 1;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.ar-viewport {
  background: #000;
  border-radius: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.ar-viewport :deep(canvas),
.ar-viewport :deep(video) {
  position: absolute;
  top: 0;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  /* MindAR иногда центрирует видео/канвас через left:-Xpx или transform.
     Держим видео и канвас выровненными одинаково внутри нашего viewport. */
  transform: none !important;
  margin-left: 0 !important;
  margin-top: 0 !important;
}

.ar-controls-panel {
  position: absolute;
  left: 50%;
  bottom: var(--space-md);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: rgba(0, 0, 0, 0.8);
  border-radius: var(--radius-md);
  color: #fff;
  width: min(420px, 100% - 32px);
  z-index: 10;
  pointer-events: auto;
}

.ar-warning {
  position: absolute;
  top: var(--space-md);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  width: min(420px, 100% - 32px);
  text-align: center;
  pointer-events: none;
}

.ar-controls-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-xs);
}

.ar-controls-row--label {
  font-size: var(--font-size-xs);
  opacity: 0.9;
  text-align: center;
}

.ar-controls-row--actions {
  margin-top: var(--space-xs);
}

.ar-control-button {
  min-width: 48px;
  padding-inline: var(--space-sm);
}

.ar-control-button.secondary {
  background: var(--bg-surface);
}

.ar-control-button.primary {
  background: var(--accent);
  color: #fff;
}

.ar-scale-label {
  font-size: var(--font-size-xs);
  opacity: 0.9;
}
</style>
