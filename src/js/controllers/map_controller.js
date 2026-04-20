import { Controller } from "@hotwired/stimulus"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

import "leaflet.awesome-markers/dist/leaflet.awesome-markers"
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css"

import { LocateControl } from "leaflet.locatecontrol"
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css"

import "leaflet-easybutton"
import "leaflet-easybutton/src/easy-button.css"
import "leaflet-tag-filter-button/src/leaflet-tag-filter-button"
import "leaflet-tag-filter-button/src/leaflet-tag-filter-button.css"

import "leaflet-sidebar"
import "leaflet-sidebar/src/L.Control.Sidebar.css"

import { CUISINES, VALID_CUISINES, CACHE_DURATION_MS } from "../config"
import buildPopup from "../utils/buildPopup"
import { loadNodes, saveNodes } from "../utils/nodeCache"
import { fetchFromOverpass } from "../utils/overpass"
import { debounce } from "../utils/debounce"

export default class extends Controller {
  static targets = [ "map", "sidebar" ]

  initialize() {
    this._setupMap()

    this._nodeIds = []
    this._addNodesToMap(loadNodes(CACHE_DURATION_MS))

    const debouncedUpdate = debounce(this._updateFromFilters.bind(this), 500)
    this.map.addEventListener("moveend", debouncedUpdate)
    this.map.addEventListener("zoomend", debouncedUpdate)
    this.map.addEventListener("moveend", this._updateUrlParams.bind(this))
    this.map.addEventListener("zoomend", this._updateUrlParams.bind(this))

    this._updateFromFilters()
  }

_setupMap() {
    const urlParams = new URLSearchParams(window.location.search)
    const initialLat = parseFloat(urlParams.get('lat')) || 51.505
    const initialLng = parseFloat(urlParams.get('lng')) || -0.10
    const initialZoom = parseInt(urlParams.get('zoom')) || 13
    this.map = L.map(this.mapTarget).setView([initialLat, initialLng], initialZoom)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map)

    new LocateControl({ keepCurrentZoomLevel: true }).addTo(this.map)

    L.control.tagFilterButton({
      data: VALID_CUISINES,
      icon: "fa-utensils",
      filterOnEveryClick: true
    }).addTo(this.map)

    this.veganLayer = L.layerGroup().addTo(this.map)
    this.vegetarianLayer = L.layerGroup().addTo(this.map)
    this.friendlyLayer = L.layerGroup().addTo(this.map)

    this.layerControl = L.control.layers(
      undefined,
      {
        "Vegan only": this.veganLayer,
        "Vegetarian only": this.vegetarianLayer,
        "Vegan friendly": this.friendlyLayer
      }
    ).addTo(this.map)

    this.sidebar = L.control.sidebar(this.sidebarTarget, {
      position: 'left',
      autoPan: false
    }).addTo(this.map)
  }

  async _updateFromFilters() {
    const query = '(node["diet:vegan"]["diet:vegan"!="no"]({{bbox}});node["diet:vegetarian"]["diet:vegetarian"!="no"]({{bbox}}););out geom;'
    const nodes = await fetchFromOverpass(query, this.map.getBounds())
    saveNodes(nodes)
    this._addNodesToMap(nodes)
  }

  _addNodesToMap(nodes) {
    nodes.forEach((node) => {
      if (this._nodeIds.includes(node.id)) { return }

      const color = this._markerColorFor(node.tags)
      const layer = this._layerFor(node.tags)
      const cuisineTag = node.tags["cuisine"]
      const icon = (cuisineTag && CUISINES.hasOwnProperty(cuisineTag))
        ? CUISINES[cuisineTag]["icon"]
        : "utensils"

      const popupContents = buildPopup(node)

      L.marker([node.lat, node.lon], {
        icon: L.AwesomeMarkers.icon({ prefix: "fa", icon, markerColor: color }),
        tags: [node.tags.cuisine]
      }).addTo(layer).on("click", function () {
        this.sidebar.setContent(popupContents)
        this.sidebar.toggle()
      }.bind(this))

      this._nodeIds.push(node.id)
    })
  }

_markerColorFor(tags) {
    if (tags["diet:vegan"] == "only") {
      return "green"
    } else if (tags["diet:vegetarian"] == "only") {
      return "purple"
    } else {
      return "blue"
    }
  }

  _layerFor(tags) {
    if (tags["diet:vegan"] == "only") {
      return this.veganLayer
    } else if (tags["diet:vegetarian"] == "only") {
      return this.vegetarianLayer
    } else {
      return this.friendlyLayer
    }
  }

  _updateUrlParams() {
    const center = this.map.getCenter()
    const zoom = this.map.getZoom()
    const params = new URLSearchParams(window.location.search)

    params.set('lat', center.lat.toFixed(5))
    params.set('lng', center.lng.toFixed(5))
    params.set('zoom', zoom)

    const newUrl = `${window.location.pathname}?${params.toString()}`
    history.replaceState(null, '', newUrl)
  }
}
