import osmLogo from "../../icons/osm_logo.svg"
import happyCowLogo from "../../icons/happycow_logo.svg"
import mapsIcon from "../../icons/google_maps_icon.svg"
import instagramIcon from "../../icons/instagram_icon.svg"
import facebookIcon from "../../icons/facebook_icon.svg"
import phoneIcon from "@material-design-icons/svg/outlined/call.svg"
import websiteIcon from "@material-design-icons/svg/outlined/language.svg"
import emailIcon from "@material-design-icons/svg/outlined/email.svg"
import wheelchairYesIcon from "@material-design-icons/svg/outlined/accessible.svg"
import wheelchairNoIcon from "@material-design-icons/svg/outlined/not_accessible.svg"
import takeawayIcon from "@material-design-icons/svg/outlined/takeout_dining.svg"
import deliveryIcon from "@material-design-icons/svg/outlined/delivery_dining.svg"
import scheduleIcon from "@material-design-icons/svg/outlined/schedule.svg"
import prettyOsmNode from "./prettyOsmNode"

function badge(icon, label, state) {
  return `<span class="popup-badge popup-badge-${state}"><img src="${icon}" alt="${label}" />${label}</span>`
}

function openNowBadge(openHours) {
  if (!openHours) return badge(scheduleIcon, "Hours unknown", "unknown")
  return openHours.now
    ? badge(scheduleIcon, "Open now", "yes")
    : badge(scheduleIcon, "Closed now", "no")
}

function wheelchairBadge(value) {
  if (!value) return badge(wheelchairYesIcon, "Accessibility unknown", "unknown")
  if (value === "yes") return badge(wheelchairYesIcon, "Wheelchair accessible", "yes")
  if (value === "limited") return badge(wheelchairYesIcon, "Limited accessibility", "partial")
  return badge(wheelchairNoIcon, "Not wheelchair accessible", "no")
}

function takeawayBadge(value) {
  if (!value) return badge(takeawayIcon, "Takeaway unknown", "unknown")
  if (value === "yes" || value === "only") return badge(takeawayIcon, "Takeaway available", "yes")
  return badge(takeawayIcon, "No takeaway", "no")
}

function deliveryBadge(value) {
  if (!value) return badge(deliveryIcon, "Delivery unknown", "unknown")
  if (value === "yes") return badge(deliveryIcon, "Delivery available", "yes")
  return badge(deliveryIcon, "No delivery", "no")
}

export default function buildPopup(node) {
  const nodeData = prettyOsmNode(node)

  let popupHtml = '<div class="shop-popup">'

  popupHtml += nodeData["name"] ? `<h1>${nodeData["name"]}</h1>` : "<h1>???</h1>"

  if (nodeData["address"]) {
    popupHtml += `<div class="popup-address">${nodeData["address"]}</div>`
  }

  popupHtml += '<div class="popup-badges">'
  popupHtml += openNowBadge(nodeData["openHours"])
  popupHtml += wheelchairBadge(nodeData["wheelchair"])
  popupHtml += takeawayBadge(nodeData["takeaway"])
  popupHtml += deliveryBadge(nodeData["delivery"])
  popupHtml += '</div>'

  popupHtml += '<div class="popup-links">'

  popupHtml += `<a class="popup-link osm-link" href="${nodeData["osmUrl"]}" target="_blank" rel="noopener" title="View on OpenStreetMap"><img src="${osmLogo}" alt="OpenStreetMap" /></a>`
  popupHtml += `<a class="popup-link happycow-link" href="${nodeData["happyCowUrl"]}" target="_blank" rel="noopener" title="Search on HappyCow"><img src="${happyCowLogo}" alt="HappyCow" /></a>`

  const googleMapsQuery = [nodeData["name"], nodeData["address"]].filter(Boolean).join(" ") || `${nodeData["lat"]},${nodeData["lon"]}`
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleMapsQuery)}`
  popupHtml += `<a class="popup-link gmaps-link" href="${googleMapsUrl}" target="_blank" rel="noopener" title="View on Google Maps"><img src="${mapsIcon}" alt="Google Maps" /></a>`

  if (nodeData["website"]) {
    popupHtml += `<a class="popup-link" href="${nodeData["website"]}" target="_blank" rel="noopener" title="${nodeData["website"]}"><img src="${websiteIcon}" alt="Website" /></a>`
  }

  if (nodeData["instagram"]) {
    popupHtml += `<a class="popup-link instagram-link" href="${nodeData["instagram"]}" target="_blank" rel="noopener" title="Instagram"><img src="${instagramIcon}" alt="Instagram" /></a>`
  }

  if (nodeData["facebook"]) {
    popupHtml += `<a class="popup-link facebook-link" href="${nodeData["facebook"]}" target="_blank" rel="noopener" title="Facebook"><img src="${facebookIcon}" alt="Facebook" /></a>`
  }

  if (nodeData["email"]) {
    popupHtml += `<a class="popup-link" href="mailto:${nodeData["email"]}" title="${nodeData["email"]}"><img src="${emailIcon}" alt="Email" /></a>`
  }

  if (nodeData["phone"]) {
    popupHtml += `<a class="popup-link" href="tel:${nodeData["phone"]}" title="${nodeData["phone"]}"><img src="${phoneIcon}" alt="Phone" /></a>`
  }

  popupHtml += '</div>'

  if (nodeData["openHours"]) {
    const { now, ...rest } = nodeData["openHours"]
    popupHtml += "<table>"
    Object.keys(rest).forEach((dayOfWeek) => {
      popupHtml += `<tr><td>${dayOfWeek}</td><td>${rest[dayOfWeek]}</td></tr>`
    })
    popupHtml += "</table>"
  }

  popupHtml += "</div>"
  return popupHtml
}
