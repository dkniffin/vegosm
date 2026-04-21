import prettyOpenHours from "./prettyOpenHours"

function osmUrl(node) {
  return `https://www.openstreetmap.org/node/${node.id}`
}

function happyCowUrl(node) {
  return `https://www.happycow.net/searchmap?s=3&lat=${node.lat}&lng=${node.lon}&zoom=16`
}

function address(tags) {
  const housenumber = tags["addr:housenumber"]
  const street = tags["addr:street"]
  const city = tags["addr:city"]
  const state = tags["addr:state"]
  const postcode = tags["addr:postcode"]

  if (!housenumber || !street) { return }

  let addressString = `${housenumber} ${street}`

  if (city) { addressString += `, ${city}` }
  if (state) { addressString += `, ${state}` }
  if (postcode) { addressString += ` ${postcode}` }

  return addressString
}

function socialUrl(value, baseUrl) {
  if (!value) return undefined
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  return `${baseUrl}${value}`
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
      happyCowUrl: happyCowUrl(node),
      address: address(tags),
      phone: tags["phone"],
      website: tags["website"],
      email: tags["email"] || tags["contact:email"],
      instagram: socialUrl(tags["contact:instagram"], "https://instagram.com/"),
      facebook: socialUrl(tags["contact:facebook"], "https://facebook.com/"),
      wheelchair: tags["wheelchair"],
      takeaway: tags["takeaway"],
      delivery: tags["delivery"],
      openHours: prettyOpenHours(tags),
      osmTags: tags
    }
  }

  return prettyObject
}
