let express = require("express")
let equipmentUtilizationController = require('../controller/equipmentUtilizationController')

let utilizationRouter = express.Router()

utilizationRouter.get("/api/v1/owner/:ownerId", equipmentUtilizationController.utilization)

module.exports = utilizationRouter