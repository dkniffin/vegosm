import OpeningHours from "opening_hours"
import osm_logo from "../../icons/osm_logo.svg"

export default function buildPopup(node) {
  const tags = node.tags

  function safeGetValue(key, callback) {
    if (tags.hasOwnProperty(key)) {
      callback(tags[key])
    }
  }

  let popupHtml = '<div class="shop-popup">'

  const osmHref = `https://www.openstreetmap.org/node/${node.id}`


  if (tags.hasOwnProperty("name")) {
    popupHtml += `<h1>${tags["name"]}</h1>`
  } else {
    popupHtml += "<h1>???</h1>"
  }

  popupHtml += `
    <a class="osm-link" href=${osmHref}>
      <img src=${osm_logo} />
    </a>
    <br />
  `

  // const address = `${node.tags["addr:housenumber"]} ${node.tags["addr:street"]} ${node.tags["addr:city"]}, ${node.tags["addr:state"]} ${node.tags["postcode"]}`

  safeGetValue("phone", (phone) => {
    popupHtml += `<a href="tel:${phone}">${phone}</a><br />`
  })

  safeGetValue("website", (website) => {
    popupHtml += `<a href="tel:${website}">${website}</a><br />`
  })

  safeGetValue("opening_hours", (opening_hours) => {
    const openingHours = new OpeningHours(opening_hours, {}, { 'locale': navigator.language }).prettifyValue({ conf: { locale: "en" }})
    popupHtml += `<span>${openingHours}</span><br />`
  })

  popupHtml += "</div>"
  return popupHtml
}
