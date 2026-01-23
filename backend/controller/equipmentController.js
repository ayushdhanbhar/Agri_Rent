let Equipment = require("../models/equipment")
let EquipmentUsageEvent = require("../models/equipmentUsageEvent")
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
    }),
    // For map-based listing (farmers)
    fetchForMap: asyncHandler(async (req, res) => {
        const { district } = req.query;
        const q = { status: "active", approval_status: "approved", location: { $exists: true } };
        if (district) q.district = district;
        const equipments = await Equipment.find(q).select("equipment_name category district price_per_hour price_per_day ratings ratings_count location location_label owner_id");
        res.json({ message: "Equipments fetched for map.", data: equipments });
    }),
    // Owner can update current equipment location (manual or via tracking device)
    updateLocation: asyncHandler(async (req, res) => {
        const { equipmentId } = req.params;
        const { lng, lat, location_label, booking_id, farmer_id, owner_id } = req.body;
        if (typeof lng !== "number" || typeof lat !== "number") {
            return res.status(400).json({ message: "lng and lat must be numbers." });
        }
        const updated = await Equipment.findByIdAndUpdate(
            equipmentId,
            {
                location: { type: "Point", coordinates: [lng, lat] },
                location_label: location_label || "",
                last_location_updated_at: new Date()
            },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Equipment not found." });

        // Persist tracking ping
        await EquipmentUsageEvent.create({
            equipment_id: updated._id,
            booking_id: booking_id || undefined,
            farmer_id: farmer_id || undefined,
            owner_id: owner_id || undefined,
            event_type: "location_ping",
            location: { type: "Point", coordinates: [lng, lat] },
            meta: { location_label: location_label || "" }
        });

        // Broadcast live update to interested clients
        if (req.io) {
            req.io.emit("equipment_location_update", {
                equipment_id: updated._id,
                location: updated.location,
                location_label: updated.location_label,
                last_location_updated_at: updated.last_location_updated_at
            });
        }

        res.json({ message: "Location updated.", data: updated });
    }),
    delete: asyncHandler(async (req, res) => {
        const { equipmentId } = req.params;
        await Equipment.findByIdAndUpdate(equipmentId, { status: "deleted" });
        res.json({ message: "Equipment deleted successfully." });
    })
}

module.exports = equipmentController