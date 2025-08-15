import { Controller } from "@hotwired/stimulus"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

import "leaflet.awesome-markers/dist/leaflet.awesome-markers"
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css"

import { LocateControl } from "leaflet.locatecontrol"
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css"

export default class extends Controller {
  static targets = [ "map", "filters" ]

  initialize() {
    this._setupMap()
    this._updateFromFilters()

    this._nodeIds = []

    this.map.addEventListener("moveend", this._updateFromFilters.bind(this))
  }

  filterChange() {
    this._updateFromFilters()
  }

  _setupMap() {
    this.map = L.map(this.mapTarget).setView([51.505, -0.10], 12)

    new LocateControl({ keepCurrentZoomLevel: true }).addTo(this.map)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map)
  }

  async _updateFromFilters() {
    const formData = new FormData(this.filtersTarget)
    const filterValues = this._valuesFromFormData(formData)

    const veg = filterValues["veg"]
    const cuisines = filterValues["all_cuisines"] == "on" ? undefined : filterValues["cuisine"]

    const results = await this._fetchFromOverpass(this._buildOverpassQuery(veg, cuisines))

    results.forEach((node) => {
      if (this._nodeIds.includes(node.id)) { return }

      const color = this._markerColor(node.tags)
      L.marker([node.lat, node.lon], {
        icon: L.AwesomeMarkers.icon({
          prefix: "fa",
          icon: "utensils",
          markerColor: color
        })
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

  _buildOverpassQuery(veg, cuisines) {
    const cuisineSubstring = cuisines ? `["cuisine"~"${cuisines.join("|")}"]` : ""
    if (veg == "vegan") {
      return `
        node["diet:vegan"="only"]${cuisineSubstring}({{bbox}});
        out geom;
      `
    } else if (veg == "vegetarian") {
      return `
        (
          node["diet:vegan"="only"]${cuisineSubstring}({{bbox}});
          node["diet:vegetarian"="only"]${cuisineSubstring}({{bbox}});
        );
        out geom;
      `
    } else {
      return `
        (
          node["diet:vegan"]${cuisineSubstring}({{bbox}});
          node["diet:vegetarian"]${cuisineSubstring}({{bbox}});
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
}
