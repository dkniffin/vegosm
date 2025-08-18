import prettyOpenHours from "./prettyOpenHours"

function osmUrl(node) {
  return `https://www.openstreetmap.org/node/${node.id}`
}

function address(tags) {
  const housenumber = tags["addr:housenumber"]
  const street = tags["addr:street"]
  const city = tags["addr:city"]
  const state = tags["addr:state"]
  const postcode = tags["addr:postcode"]

  // If one or both of these are not present, we can't form a valid address
  if (!housenumber || !street) { return }

  let addressString = `${housenumber} ${street}`

  if (city) { addressString += `, ${city}` }
  if (state) { addressString += `, ${state}` }
  if (postcode) { addressString += ` ${postcode}` }

  return addressString
}

export default function prettyOsmNode(node) {
  let prettyObject = {
    id: node.id,
    lat: node.lat,
    lon: node.lon
  }

  const tags = node.tags

  if (tags) {
    prettyObject = {
      ...prettyObject,
      name: tags["name"],
      osmUrl: osmUrl(node),
      address: address(tags),
      phone: tags["phone"],
      website: tags["website"],
      openHours: prettyOpenHours(tags),
      osmTags: tags
    }
  }

  return prettyObject
}
