import { Controller } from "@hotwired/stimulus"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

import { LocateControl } from "leaflet.locatecontrol"
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css"

import "leaflet-easybutton"
import "leaflet-easybutton/src/easy-button.css"
import "leaflet-sidebar"
import "leaflet-sidebar/src/L.Control.Sidebar.css"
import "../../css/cuisine-filter.css"

import { CUISINES, DEFAULT_ICON, VALID_CUISINES, CACHE_DURATION_MS, OVERPASS_QUERY } from "../config"
import CuisineFilter from "../controls/CuisineFilter"
import createMarkerIcon from "../utils/createMarkerIcon"
import buildPopup from "../utils/buildPopup"
import { loadNodes, saveNodes } from "../utils/nodeCache"
import { loadTiles, saveTiles, getUncachedTiles, tilesBbox } from "../utils/tileCache"
import { fetchFromOverpass } from "../utils/overpass"
import { debounce } from "../utils/debounce"

export default class extends Controller {
  static targets = ["map", "sidebar", "spinner"]

  initialize() {
    this._hideChainsActive = false
    this._chainsHidden = new Map()
    this._nodeIds = []

    this._setupMap()
    this._setupDarkMode()
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
    this._lightTileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    })
    this._darkTileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    })
    this._lightTileLayer.addTo(this.map)

    this.map.createPane('veganPane').style.zIndex = 650
    this.map.createPane('vegetarianPane').style.zIndex = 640
    this.map.createPane('friendlyPane').style.zIndex = 630

    this.veganLayer = L.layerGroup().addTo(this.map)
    this.vegetarianLayer = L.layerGroup().addTo(this.map)
    this.friendlyLayer = L.layerGroup().addTo(this.map)
  }

  _setupControls() {
    new LocateControl({ keepCurrentZoomLevel: true }).addTo(this.map)

    new CuisineFilter({
      cuisines: VALID_CUISINES,
      layers: [this.veganLayer, this.vegetarianLayer, this.friendlyLayer]
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

    this._setupChainFilter()
  }

  _setupDarkMode() {
    // override: null = auto, true = force dark, false = force light
    this._darkOverride = null
    this._systemDark = window.matchMedia("(prefers-color-scheme: dark)")

    this._systemDark.addEventListener("change", () => {
      if (this._darkOverride === null) this._applyDarkMode(this._systemDark.matches)
    })

    const icons = { auto: "fa-circle-half-stroke", dark: "fa-moon", light: "fa-sun" }
    this._darkModeButton = L.easyButton(`<i class="fa-solid ${icons.auto}"></i>`, () => {
      if (this._darkOverride === null) {
        this._darkOverride = true
      } else if (this._darkOverride === true) {
        this._darkOverride = false
      } else {
        this._darkOverride = null
      }
      const isDark = this._darkOverride === null ? this._systemDark.matches : this._darkOverride
      const icon = this._darkOverride === null ? icons.auto : this._darkOverride ? icons.dark : icons.light
      this._darkModeButton.button.querySelector("i").className = `fa-solid ${icon}`
      this._applyDarkMode(isDark)
    }).addTo(this.map)

    this._applyDarkMode(this._systemDark.matches)
  }

  _applyDarkMode(dark) {
    document.body.classList.toggle("dark", dark)
    if (dark) {
      this._lightTileLayer.remove()
      this._darkTileLayer.addTo(this.map)
    } else {
      this._darkTileLayer.remove()
      this._lightTileLayer.addTo(this.map)
    }
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
    if (this._hideChainsActive) this._applyChainFilter()
  }

  _createMarker(node) {
    const { color, pane } = this._dietInfo(node.tags)
    const cuisineTag = node.tags["cuisine"]
    const iconUrl = CUISINES[cuisineTag]?.icon ?? DEFAULT_ICON
    const popupContents = buildPopup(node)

    return L.marker([node.lat, node.lon], {
      icon: createMarkerIcon(iconUrl, color),
      pane,
      tags: [cuisineTag],
      isChain: this._isChain(node.tags)
    }).on("click", () => {
      this.sidebar.setContent(popupContents)
      this.sidebar.toggle()
    })
  }

  _isChain(tags) {
    return !!tags["brand:wikidata"]
  }

  _setupChainFilter() {
    this._chainFilterButton = L.easyButton('<i class="fa-solid fa-trademark chain-filter-icon"></i>', () => {
      this._hideChainsActive = !this._hideChainsActive
      this._chainFilterButton.button.classList.toggle("chain-filter-active", this._hideChainsActive)
      this._applyChainFilter()
    }).addTo(this.map)
  }

  _applyChainFilter() {
    for (const [marker, layer] of this._chainsHidden) layer.addLayer(marker)
    this._chainsHidden.clear()

    if (!this._hideChainsActive) return

    const toHide = []
    for (const layer of [this.veganLayer, this.vegetarianLayer, this.friendlyLayer]) {
      layer.eachLayer(marker => {
        if (marker.options.isChain) toHide.push([marker, layer])
      })
    }
    for (const [marker, layer] of toHide) {
      layer.removeLayer(marker)
      this._chainsHidden.set(marker, layer)
    }
  }

  _dietInfo(tags) {
    if (tags["diet:vegan"] === "only") return { color: "#388e3c", layer: this.veganLayer, pane: "veganPane" }
    if (tags["diet:vegetarian"] === "only") return { color: "#7b1fa2", layer: this.vegetarianLayer, pane: "vegetarianPane" }
    return { color: "#1565c0", layer: this.friendlyLayer, pane: "friendlyPane" }
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
