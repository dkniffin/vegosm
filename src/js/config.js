export const CUISINES = {
  "pizza": {
    icon: "pizza-slice"
  },
  "burger": {
    icon: "burger"
  },
  "coffee_shop": {
    icon: "mug-hot"
  },
  "ice_cream": {
    icon: "ice-cream"
  }
}

export const VALID_CUISINES = Object.keys(CUISINES)

export const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000

export const TILE_ZOOM = 12

export const OVERPASS_QUERY = '(node["diet:vegan"]["diet:vegan"!="no"]({{bbox}});node["diet:vegetarian"]["diet:vegetarian"!="no"]({{bbox}}););out geom;'
