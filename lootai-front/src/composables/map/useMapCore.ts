import { ref } from 'vue'
import L from 'leaflet'

export function useMapCore() {
  const map = ref<L.Map>()
  const markers = ref<Map<string, L.Marker>>(new Map())

  function init(container: HTMLElement, coords: [number, number], zoom = 13) {
    const m = L.map(container).setView(coords, zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'lootai',
      maxZoom: 19,
    }).addTo(m)
    map.value = m
    return m
  }

  function addMarker(id: string, coords: [number, number], icon: L.Icon | L.DivIcon) {
    if (!map.value) return
    const existing = markers.value.get(id)
    if (existing) map.value.removeLayer(existing as any)
    const marker = L.marker(coords, { icon }).addTo(map.value)
    markers.value.set(id, marker)
    return marker
  }

  function removeMarker(id: string) {
    const marker = markers.value.get(id)
    if (marker && map.value) {
      map.value.removeLayer(marker as any)
      markers.value.delete(id)
    }
  }

  function center(coords: [number, number], zoom = 15) {
    map.value?.setView(coords, zoom)
  }

  return { map, markers, init, addMarker, removeMarker, center }
}
