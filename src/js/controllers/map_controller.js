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
import { VALID_CUISINES } from "../config"

export default class extends Controller {
  static targets = [ "map", "filters" ]

  initialize() {
    this._setupMap()
    this._updateFromFilters()

    this._nodeIds = []

    this.map.addEventListener("moveend", this._updateFromFilters.bind(this))
    this.map.addEventListener("zoomend", this._updateFromFilters.bind(this))
    this.map.addEventListener("moveend", this._updateUrlParams.bind(this))
    this.map.addEventListener("zoomend", this._updateUrlParams.bind(this))
  }

  filterChange() {
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
      icon: "fa-utensils"
    }).addTo(this.map)
  }

  async _updateFromFilters() {
    const formData = new FormData(this.filtersTarget)
    const filterValues = this._valuesFromFormData(formData)

    const veg = filterValues["veg"]

    const results = await this._fetchFromOverpass(this._buildOverpassQuery(veg))

    results.forEach((node) => {
      if (this._nodeIds.includes(node.id)) { return }

      const color = this._markerColor(node.tags)
      L.marker([node.lat, node.lon], {
        icon: L.AwesomeMarkers.icon({
          prefix: "fa",
          icon: "utensils",
          markerColor: color
        }),
        tags: [node.tags.cuisine]
      }).bindPopup(JSON.stringify(node)).addTo(this.map)
      this._nodeIds.push(node.id)
    })
  }

  _valuesFromFormData(formData) {
    // NOTE: we can't use Object.fromEntries because we to support checkboxes with the same name
    let data = {}
    for (const [key, value] of formData.entries()) {
      if (data.hasOwnProperty(key)) {
        if (Array.isArray(data[key])) {
          data[key].push(value)
        } else {
          const oldValue = data[key]
          data[key] = [oldValue, value]
        }
      } else {
        data[key] = value
      }
    }
    return data
  }

  _buildOverpassQuery(veg) {
    if (veg == "vegan") {
      return `
        node["diet:vegan"="only"]({{bbox}});
        out geom;
      `
    } else if (veg == "vegetarian") {
      return `
        (
          node["diet:vegan"="only"]({{bbox}});
          node["diet:vegetarian"="only"]({{bbox}});
        );
        out geom;
      `
    } else {
      return `
        (
          node["diet:vegan"]({{bbox}});
          node["diet:vegetarian"]({{bbox}});
        );
        out geom;
      `
    }
  }

  _buildOverpassUrlFromQuery(query) {
    const bounds = this.map.getBounds()
    const bbox = [
      bounds.getSouth(),
      bounds.getWest(),
      bounds.getNorth(),
      bounds.getEast()
    ].join(',');

    query = query.replace(/(\/\/.*)/g, '')
    query = query.replace(/\n/g, '')
    query = query.replace(/(\{\{bbox\}\})/g, bbox)

    return `https://overpass-api.de/api/interpreter?data=[out:json];${query}`
  }

  async _fetchFromOverpass(query) {
    const url = this._buildOverpassUrlFromQuery(query)
    const response = await fetch(url)
    if (!response.ok) { throw new Error(`Response status: ${response.status}`) }
    const results = await response.json()
    return results["elements"]
  }

  _markerColor(tags) {
    if (tags["diet:vegan"] == "only") {
      return "green"
    } else if (tags["diet:vegetarian"] == "only") {
      return "purple"
    } else {
      return "blue"
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
