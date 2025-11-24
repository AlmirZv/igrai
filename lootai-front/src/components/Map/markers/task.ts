import L from 'leaflet'

export function createTaskMarker(color: string, icon: string) {
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
        ">${icon}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
  // return L.divIcon({
  //   className: 'custom-marker',
  //   html: `
  //   <div style="
  //     position: relative;
  //     width: 24px;
  //     height: 28px;
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //   ">
  //     <!-- Палочка -->
  //     <div style="
  //       position: absolute;
  //       bottom: 0;
  //       left: 10px;
  //       width: 4px;
  //       height: 28px;
  //       background: #555;
  //       border-radius: 2px;
  //     "></div>

  //     <!-- Флажок -->
  //     <div style="
  //       position: absolute;
  //       top: 0;
  //       left: 12px;
  //       width: 0;
  //       height: 0;
  //       border-top: 12px solid transparent;
  //       border-bottom: 12px solid transparent;
  //       border-left: 18px solid ${color};
  //       filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  //     "></div>

  //     <!-- Буква -->
  //     <span style="
  //       position: absolute;
  //       top: 0;
  //       left: 14px;
  //       transform: translateY(6px);
  //       font-size: 11px;
  //       font-weight: bold;
  //       color: white;
  //       text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  //     ">

  //     </span>
  //   </div>
  // `,
  //   iconSize: [24, 28],
  //   iconAnchor: [12, 28], // нижняя точка палочки = "основание"
  // })
}
