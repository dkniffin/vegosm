import osmLogo from "../../icons/osm_logo.svg"
import prettyOsmNode from "./prettyOsmNode"

export default function buildPopup(node) {
  const nodeData = prettyOsmNode(node)

  let popupHtml = '<div class="shop-popup">'

  if (nodeData["name"]) {
    popupHtml += `<h1>${nodeData["name"]}</h1>`
  } else {
    popupHtml += "<h1>???</h1>"
  }

  popupHtml += `
    <a class="osm-link" href=${nodeData["osmUrl"]}>
      <img src=${osmLogo} />
    </a>
    <br />
  `

  if (nodeData["address"]) {
    popupHtml += `<span>${nodeData["address"]}</span><br />`
  }

  if (nodeData["phone"]) {
    popupHtml += `<a href="tel:${nodeData["phone"]}">${nodeData["phone"]}</a><br />`
  }

  if (nodeData["website"]) {
    popupHtml += `<a href="tel:${nodeData["website"]}">${nodeData["website"]}</a><br />`
  }

  if (nodeData["openHours"]) {
    const openHours = nodeData["openHours"]
    const { now, ...rest } = openHours
    if (openHours["now"]) {
      popupHtml += `<span>Currently: <span class="currently-open">Open</span></span><br />`
    } else {
      popupHtml += `<span>Currently: <span class="currently-closed">Closed</span></span><br />`
    }

    popupHtml += "<table>"
    Object.keys(rest).forEach((dayOfWeek) => {
      const dayOpenString = rest[dayOfWeek]
      popupHtml += `<tr><td>${dayOfWeek}</td><td>${dayOpenString}</td></tr>`
    })
    popupHtml += "</table"
  }

  // For debugging:
  // popupHtml += JSON.stringify(nodeData)

  popupHtml += "</div>"
  return popupHtml
}
