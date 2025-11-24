import L from 'leaflet'

export function createUserMarker(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1px solid #000000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">👤</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}
