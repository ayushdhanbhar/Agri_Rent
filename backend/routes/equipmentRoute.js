let express = require("express")
const equipmentController = require("../controller/equipmentController")

let equipmentRouter = express.Router()

// add equipment
equipmentRouter.post("/api/v1/equipments/add", equipmentController.add)

// view equipments
equipmentRouter.get("/api/v1/equipments/view/:userId", equipmentController.view)

// fetch equipments
// fetch equipments
equipmentRouter.get("/api/v1/equipments/fetch", equipmentController.fetch)

// delete equipment
equipmentRouter.delete("/api/v1/equipments/delete/:equipmentId", equipmentController.delete)

module.exports = equipmentRouter