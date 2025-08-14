import "leaflet"
import "leaflet/dist/leaflet.css";
// import "leaflet-overpass-layer"
import "./css"

document.addEventListener("DOMContentLoaded", () => {
  var map = L.map('map').setView([51.505, -0.09], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // var opl = new L.OverPassLayer({
  //   "query": "(node({{bbox}})[organic];node({{bbox}})[second_hand];);out qt;",
  // })

  // map.addLayer(opl)
})
