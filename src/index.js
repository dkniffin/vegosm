import "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-overpass-layer"
import "leaflet-overpass-layer/dist/OverPassLayer.css"
import "./css"
import veganIconUrl from "./icons/vegan.png"

document.addEventListener("DOMContentLoaded", () => {
  var map = L.map('map').setView([51.505, -0.09], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  const veganIcon = L.icon({
      iconUrl: veganIconUrl
    })

  var opl = new L.OverPassLayer({
    "query": 'nwr["diet:vegan"]({{bbox}});out geom;',
    minZoom: 10,
    markerIcon: veganIcon
  })

  map.addLayer(opl)
})
