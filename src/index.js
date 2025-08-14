import "leaflet"
import "leaflet/dist/leaflet.css"

import "leaflet-overpass-layer"
import "leaflet-overpass-layer/dist/OverPassLayer.css"

import "leaflet.icon.glyph"

import "./css"

document.addEventListener("DOMContentLoaded", () => {
  var map = L.map('map').setView([51.505, -0.10], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // TODO: change marker color
  const veganMarker = L.icon.glyph({
		prefix: "icon",
		glyph: "vegan",
    glyphColor: "white"
	})

  var opl = new L.OverPassLayer({
    "query": 'nwr["diet:vegan"]({{bbox}});out geom;',
    minZoom: 10,
    markerIcon: veganMarker
  })

  map.addLayer(opl)
})
