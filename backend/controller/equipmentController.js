let Equipment = require("../models/equipment")
let asyncHandler = require("express-async-handler")

let equipmentController = {
    add: asyncHandler(async (req, res) => {
        let { owner_id, equipment_name, category, district, price_per_hour, price_per_day } = req.body;
        let equipment = await Equipment.create({
            owner_id,
            category,
            subCategory: equipment_name,
            district,
            ratePerHour: price_per_hour,
            ratePerDay: price_per_day
        });
        res.json({
            message: "Equipment added successfully.",
            data: equipment
        });
    }),
    view: asyncHandler(async (req, res) => {
        let { userId } = req.params;
        let equipments = await Equipment.find({ owner_id: userId, status: { $ne: "deleted" } }).populate("owner_id");
        if (!equipments || equipments.length === 0) {
            return res.status(200).json({ message: "No equipments found.", data: [] });
        }
        res.json({
            message: "Equipments fetched successfully.",
            data: equipments
        });
    }),
    fetch: asyncHandler(async (req, res) => {
        let equipments = await Equipment.find({ status: "active", approval_status: "approved" }) // Only active and approved for farmers
        res.json({
            "message": "Equipments fetched successfully.",
            "data": equipments
        })
    }),
    delete: asyncHandler(async (req, res) => {
        const { equipmentId } = req.params;
        await Equipment.findByIdAndUpdate(equipmentId, { status: "deleted" });
        res.json({ message: "Equipment deleted successfully." });
    })
}

module.exports = equipmentController