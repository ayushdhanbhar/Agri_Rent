let Equipment = require("../models/equipment")
let asyncHandler = require("express-async-handler")

let equipmentController = {
    add: asyncHandler(async (req, res) => {
        let { owner_id, category, subCategory, description, district, ratePerHour, ratePerDay } = req.body;
        let equipment = await Equipment.create({
            owner_id,
            category,
            subCategory,
            description,
            district,
            ratePerHour,
            ratePerDay
        });
        res.json({
            message: "Equipment added successfully.",
            data: equipment
        });
    }),
    view: asyncHandler(async (req, res) => {
        let { userId } = req.params;
        let equipments = await Equipment.find({ owner_id: userId }).populate("owner_id");
        if (!equipments || equipments.length === 0) {
            return res.status(200).json({ message: "No equipments found.", data: [] });
        }
        res.json({
            message: "Equipments fetched successfully.",
            data: equipments
        });
    }),
    fetch: asyncHandler(async (req, res) => {
        let equipments = await Equipment.find({}).populate("owner_id");
        res.json({
            "message": "Equipments fetched successfully.",
            "data": equipments
        })
    }),
    delete: asyncHandler(async (req, res) => {
        const { equipmentId } = req.params;
        await Equipment.findByIdAndDelete(equipmentId);
        res.json({ message: "Equipment deleted successfully." });
    })
}

module.exports = equipmentController