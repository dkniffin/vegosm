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
  const response = await fetch(url)
  if (!response.ok) { throw new Error(`Response status: ${response.status}`) }
  const result = await response.json()
  return result['elements']
}
