const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
]

const MAX_RETRIES = 3
const RETRY_BASE_DELAY_MS = 1000

let _mirrorIndex = 0

function _nextMirror() {
  const mirror = MIRRORS[_mirrorIndex % MIRRORS.length]
  _mirrorIndex++
  return mirror
}

export async function fetchFromOverpass(query, { south, west, north, east }) {
  const bbox = [south, west, north, east].join(',')

  const prepared = query
    .replace(/(\/\/.*)/g, '')
    .replace(/\n/g, '')
    .replace(/(\{\{bbox\}\})/g, bbox)

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const url = `${_nextMirror()}?data=[out:json];${prepared}`
    const response = await fetch(url)

    if (response.status === 429 || response.status === 504) {
      if (attempt === MAX_RETRIES) throw new Error(`Overpass error ${response.status}, max retries reached`)
      // If we haven't cycled through all mirrors yet, try the next one immediately
      if (attempt < MIRRORS.length - 1) continue
      await _sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - MIRRORS.length + 1))
      continue
    }

    if (!response.ok) throw new Error(`Response status: ${response.status}`)

    const result = await response.json()
    return result['elements']
  }
}

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
