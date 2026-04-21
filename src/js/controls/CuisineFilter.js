import L from "leaflet"

export default L.Control.extend({
  options: {
    position: "topleft",
    cuisines: [],
    layers: []
  },

  initialize(options) {
    L.Util.setOptions(this, options)
    this._selected = new Set(options.cuisines)
    this._hidden = new Map() // marker → layer group
  },

  onAdd(map) {
    this._map = map
    const container = L.DomUtil.create("div", "leaflet-bar leaflet-control cuisine-filter")
    L.DomEvent.disableClickPropagation(container)
    L.DomEvent.disableScrollPropagation(container)

    this._btn = L.DomUtil.create("a", "", container)
    this._btn.innerHTML = '<i class="fa-solid fa-utensils"></i>'
    this._btn.href = "#"
    this._btn.title = "Filter by cuisine"
    L.DomEvent.on(this._btn, "click", L.DomEvent.stop)
    L.DomEvent.on(this._btn, "click", () => this._toggle())

    this._dropdown = L.DomUtil.create("div", "cuisine-filter-dropdown", container)
    this._dropdown.style.display = "none"

    const header = L.DomUtil.create("div", "cuisine-filter-header", this._dropdown)
    const allBtn = L.DomUtil.create("button", "cuisine-filter-all-btn", header)
    allBtn.textContent = "all"
    const noneBtn = L.DomUtil.create("button", "cuisine-filter-none-btn", header)
    noneBtn.textContent = "none"
    L.DomEvent.on(allBtn, "click", () => { this._selectAll(); this._applyFilter() })
    L.DomEvent.on(noneBtn, "click", () => { this._selectNone(); this._applyFilter() })

    this._list = L.DomUtil.create("ul", "cuisine-filter-list", this._dropdown)
    for (const cuisine of this.options.cuisines) {
      const li = L.DomUtil.create("li", "cuisine-filter-item", this._list)
      li.dataset.cuisine = cuisine
      const check = L.DomUtil.create("span", "cuisine-filter-check", li)
      check.textContent = "✓"
      L.DomUtil.create("span", "", li).textContent = cuisine
      L.DomEvent.on(li, "click", () => this._toggleCuisine(cuisine))
    }

    map.on("click", () => this._close())

    return container
  },

  _toggle() {
    this._dropdown.style.display === "none" ? this._open() : this._close()
  },

  _open() { this._dropdown.style.display = "block" },
  _close() { this._dropdown.style.display = "none" },

  _selectAll() {
    this._selected = new Set(this.options.cuisines)
    this._updateUI()
  },

  _selectNone() {
    this._selected = new Set()
    this._updateUI()
  },

  _toggleCuisine(cuisine) {
    this._selected.has(cuisine) ? this._selected.delete(cuisine) : this._selected.add(cuisine)
    this._updateUI()
    this._applyFilter()
  },

  _updateUI() {
    this._list.querySelectorAll(".cuisine-filter-item").forEach(li => {
      li.querySelector(".cuisine-filter-check").style.visibility =
        this._selected.has(li.dataset.cuisine) ? "visible" : "hidden"
    })
  },

  _applyFilter() {
    for (const [marker, layer] of this._hidden) layer.addLayer(marker)
    this._hidden.clear()

    if (this._selected.size === this.options.cuisines.length) return

    const toHide = []
    for (const layer of this.options.layers) {
      layer.eachLayer(marker => {
        const cuisine = marker.options.tags?.[0]
        if (cuisine && !this._selected.has(cuisine)) toHide.push([marker, layer])
      })
    }
    for (const [marker, layer] of toHide) {
      layer.removeLayer(marker)
      this._hidden.set(marker, layer)
    }
  }
})
