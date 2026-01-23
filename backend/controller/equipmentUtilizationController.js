let Equipment = require("../models/equipment")
let asyncHandler = require('express-async-handler')
let Booking = require('../models/booking')

let bookingController = {
    utilization: asyncHandler(async (req, res)=>{
        let { ownerId } = req.params;
        let ownerEquipments = await Equipment.find({ owner_id: ownerId })
        res.json({
            data: ownerEquipments
        })
    })
}

module.exports = bookingController