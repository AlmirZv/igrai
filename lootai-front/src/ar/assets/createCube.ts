import * as THREE from "three"

export function createCube(): THREE.Object3D {
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x4CAF50,
    metalness: 0.5,
    roughness: 0.5
  })
  const cube = new THREE.Mesh(geometry, material)
  return cube
}
