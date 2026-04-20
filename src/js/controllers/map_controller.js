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

import { CUISINES, VALID_CUISINES, CACHE_DURATION_MS, OVERPASS_QUERY } from "../config"
import buildPopup from "../utils/buildPopup"
import { loadNodes, saveNodes } from "../utils/nodeCache"
import { loadTiles, saveTiles, getUncachedTiles, tilesBbox } from "../utils/tileCache"
import { fetchFromOverpass } from "../utils/overpass"
import { debounce } from "../utils/debounce"

export default class extends Controller {
  static targets = [ "map", "sidebar", "spinner" ]

  initialize() {
    this._setupMap()

    this._nodeIds = []
    this._cachedTiles = loadTiles(CACHE_DURATION_MS)
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

    this._setupLayers()
    this._setupControls()
  }

  _setupLayers() {
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map)

    this.veganLayer = L.layerGroup().addTo(this.map)
    this.vegetarianLayer = L.layerGroup().addTo(this.map)
    this.friendlyLayer = L.layerGroup().addTo(this.map)
  }

  _setupControls() {
    new LocateControl({ keepCurrentZoomLevel: true }).addTo(this.map)

    L.control.tagFilterButton({
      data: VALID_CUISINES,
      icon: "fa-utensils",
      filterOnEveryClick: true
    }).addTo(this.map)

    L.control.layers(undefined, {
      "Vegan only": this.veganLayer,
      "Vegetarian only": this.vegetarianLayer,
      "Vegan friendly": this.friendlyLayer
    }).addTo(this.map)

    this.sidebar = L.control.sidebar(this.sidebarTarget, {
      position: 'left',
      autoPan: false
    }).addTo(this.map)
  }

  async _updateFromFilters() {
    const uncached = getUncachedTiles(this.map.getBounds(), this._cachedTiles)
    if (uncached.length === 0) return

    this.spinnerTarget.classList.add("visible")
    try {
      const nodes = await fetchFromOverpass(OVERPASS_QUERY, tilesBbox(uncached))
      this._cachedTiles = saveTiles(this._cachedTiles, uncached)
      saveNodes(nodes)
      this._addNodesToMap(nodes)
    } finally {
      this.spinnerTarget.classList.remove("visible")
    }
  }

  _addNodesToMap(nodes) {
    nodes.forEach((node) => {
      if (this._nodeIds.includes(node.id)) { return }
      this._createMarker(node).addTo(this._dietInfo(node.tags).layer)
      this._nodeIds.push(node.id)
    })
  }

  _createMarker(node) {
    const { color } = this._dietInfo(node.tags)
    const cuisineTag = node.tags["cuisine"]
    const icon = (cuisineTag && CUISINES.hasOwnProperty(cuisineTag))
      ? CUISINES[cuisineTag]["icon"]
      : "utensils"
    const popupContents = buildPopup(node)

    return L.marker([node.lat, node.lon], {
      icon: L.AwesomeMarkers.icon({ prefix: "fa", icon, markerColor: color }),
      tags: [cuisineTag]
    }).on("click", () => {
      this.sidebar.setContent(popupContents)
      this.sidebar.toggle()
    })
  }

  _dietInfo(tags) {
    if (tags["diet:vegan"] === "only")       return { color: "green",  layer: this.veganLayer }
    if (tags["diet:vegetarian"] === "only")  return { color: "purple", layer: this.vegetarianLayer }
    return                                          { color: "blue",   layer: this.friendlyLayer }
  }

  _updateUrlParams() {
    const center = this.map.getCenter()
    const zoom = this.map.getZoom()
    const params = new URLSearchParams(window.location.search)

    params.set('lat', center.lat.toFixed(5))
    params.set('lng', center.lng.toFixed(5))
    params.set('zoom', zoom)

    history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  }
}
