import L from "leaflet"

export default function createMarkerIcon(iconUrl, color) {
  return L.divIcon({
    html: `<div class="map-pin" style="background:${color}"><img class="map-pin-icon" src="${iconUrl}"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 36],
    popupAnchor: [1, -34],
    className: ""
  })
}
