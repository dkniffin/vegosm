import { Controller } from "@hotwired/stimulus"
import "leaflet"
import "leaflet/dist/leaflet.css"

import "leaflet-overpass-layer"
import "leaflet-overpass-layer/dist/OverPassLayer.css"

import "leaflet.awesome-markers/dist/leaflet.awesome-markers"
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css"

export default class extends Controller {
  static targets = [ "map" ]

  initialize() {
    const map = L.map(this.mapTarget).setView([51.505, -0.10], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);


    new L.OverPassLayer({
      "query": 'nwr["diet:vegan"="only"]({{bbox}});out geom;',
      minZoom: 10,
      markerIcon: L.AwesomeMarkers.icon({
        prefix: "fa",
        icon: "utensils",
        markerColor: "green"
      })
    }).addTo(map)

    new L.OverPassLayer({
      "query": 'nwr["diet:vegan"="yes"]({{bbox}});out geom;',
      minZoom: 10,
      markerIcon: L.AwesomeMarkers.icon({
        prefix: "fa",
        icon: "utensils",
        markerColor: "purple"
      })
    }).addTo(map)
  }
}
