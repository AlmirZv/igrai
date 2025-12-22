import { ref } from 'vue'
import L from 'leaflet'

export function useMapCore() {
  const map = ref<L.Map>()
  const markers = ref<Map<string, L.Marker>>(new Map())

  function init(container: HTMLElement, coords: [number, number], zoom = 13) {
    const m = L.map(container).setView(coords, zoom)

    var defaultMode = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'lootai',
      maxZoom: 19,
    })
    var darkMode = L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}',
      {
        minZoom: 0,
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png',
      },
    )

    var darkMode2 = L.tileLayer(
      'https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token={accessToken}',
      {
        attribution:
          '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 0,
        maxZoom: 22,
        accessToken: 'iI6OHBx93W0PWkoNvIGlnFlwSEhlTjtyLXUNBfWLbodLn0oHTmLyGFMa5MdAg7fr',
      },
    )

    darkMode2.addTo(m)
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
