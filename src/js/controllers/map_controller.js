import { Controller } from "@hotwired/stimulus"
import "leaflet"
import "leaflet/dist/leaflet.css"

import "leaflet-overpass-layer"
import "leaflet-overpass-layer/dist/OverPassLayer.css"

import "leaflet.icon.glyph"

import veganIconUrl from "../../icons/vegan-marker.svg"


export default class extends Controller {
  static targets = [ "map" ]

  initialize() {
    const map = L.map(this.mapTarget).setView([51.505, -0.10], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const veganIcon = L.icon({
      iconUrl: veganIconUrl
    })

    const opl = new L.OverPassLayer({
      "query": 'nwr["diet:vegan"]({{bbox}});out geom;',
      minZoom: 10,
      markerIcon: veganIcon
    })

    map.addLayer(opl)
  }
}
