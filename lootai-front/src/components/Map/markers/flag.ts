import L from 'leaflet'

export function createFlagMarker(task: any, color: string) {
  return L.divIcon({
    className: 'task-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">
        ${task.title.charAt(0).toUpperCase()}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}
