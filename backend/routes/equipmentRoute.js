let express = require("express")
const equipmentController = require("../controller/equipmentController")

let equipmentRouter = express.Router()

// add equipment
equipmentRouter.post("/api/v1/equipments/add", equipmentController.add)

// view equipments
equipmentRouter.get("/api/v1/equipments/view/:userId", equipmentController.view)

// fetch equipments
equipmentRouter.get("/api/v1/equipments/fetch/:district", equipmentController.fetch)

// fetch all equipments (for location-based map)
equipmentRouter.get("/api/v1/equipments/fetch", equipmentController.fetch)

// map listing (only those with location set)
equipmentRouter.get("/api/v1/equipments/map", equipmentController.fetchForMap)

// update location for tracking
equipmentRouter.post("/api/v1/equipments/location/:equipmentId", equipmentController.updateLocation)

// delete equipment
equipmentRouter.delete("/api/v1/equipments/delete/:equipmentId", equipmentController.deleteEqp)

module.exports = equipmentRouter