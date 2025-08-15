import { Application } from "@hotwired/stimulus"

import MapController from "./controllers/map_controller"

window.Stimulus = Application.start()
Stimulus.register("map", MapController)
