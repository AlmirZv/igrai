/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'three'
declare module 'mind-ar/dist/mindar-image-three.prod.js'
declare module 'qrcode'
