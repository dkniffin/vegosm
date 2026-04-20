const MAX_RETRIES = 3
const RETRY_BASE_DELAY_MS = 1000

export async function fetchFromOverpass(query, bounds) {
  const bbox = [
    bounds.getSouth(),
    bounds.getWest(),
    bounds.getNorth(),
    bounds.getEast()
  ].join(',')

  const prepared = query
    .replace(/(\/\/.*)/g, '')
    .replace(/\n/g, '')
    .replace(/(\{\{bbox\}\})/g, bbox)

  const url = `https://overpass-api.de/api/interpreter?data=[out:json];${prepared}`

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url)

    if (response.status === 429) {
      if (attempt === MAX_RETRIES) throw new Error('Overpass rate limit exceeded, max retries reached')
      await _sleep(RETRY_BASE_DELAY_MS * 2 ** attempt)
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
