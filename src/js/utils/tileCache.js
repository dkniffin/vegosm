import { TILE_ZOOM } from "../config"

const CACHE_KEY = 'vegosm_tiles'

function tileX(lng) {
  return Math.floor((lng + 180) / 360 * Math.pow(2, TILE_ZOOM))
}

function tileY(lat) {
  const rad = lat * Math.PI / 180
  return Math.floor((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * Math.pow(2, TILE_ZOOM))
}

function tileBbox(x, y) {
  const n = Math.pow(2, TILE_ZOOM)
  return {
    west:  x / n * 360 - 180,
    east:  (x + 1) / n * 360 - 180,
    north: Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI,
    south: Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n))) * 180 / Math.PI
  }
}

export function loadTiles(durationMs) {
  const raw = localStorage.getItem(CACHE_KEY)
  if (!raw) return new Set()

  const { timestamp, tiles } = JSON.parse(raw)
  if (Date.now() - timestamp > durationMs) {
    localStorage.removeItem(CACHE_KEY)
    return new Set()
  }

  return new Set(tiles)
}

export function saveTiles(cachedTiles, newKeys) {
  const merged = new Set([...cachedTiles, ...newKeys])
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    timestamp: Date.now(),
    tiles: Array.from(merged)
  }))
  return merged
}

export function getUncachedTiles(bounds, cachedTiles) {
  const xMin = tileX(bounds.getWest())
  const xMax = tileX(bounds.getEast())
  const yMin = tileY(bounds.getNorth()) // y increases southward
  const yMax = tileY(bounds.getSouth())

  const uncached = []
  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {
      if (!cachedTiles.has(`${x},${y}`)) uncached.push(`${x},${y}`)
    }
  }
  return uncached
}

export function tilesBbox(tileKeys) {
  let south = Infinity, north = -Infinity, west = Infinity, east = -Infinity

  for (const key of tileKeys) {
    const [x, y] = key.split(',').map(Number)
    const bbox = tileBbox(x, y)
    if (bbox.south < south) south = bbox.south
    if (bbox.north > north) north = bbox.north
    if (bbox.west  < west)  west  = bbox.west
    if (bbox.east  > east)  east  = bbox.east
  }

  return { south, north, west, east }
}
