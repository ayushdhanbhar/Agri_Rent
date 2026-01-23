const asyncHandler = require("express-async-handler");

const FLASK_URL = "http://localhost:5000";

const aiController = {
    // Forecast demand
    predictDemand: asyncHandler(async (req, res) => {
        const { equipment, month, district } = req.body;
        try {
            const response = await fetch(`${FLASK_URL}/predict-demand`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ equipment, month, district })
            });
            const data = await response.json();
            res.json({ message: "Demand prediction success", data });
        } catch (error) {
            res.status(500).json({ message: "AI Service Error", error: error.message });
        }
    }),

    // Smart pricing
    smartPricing: asyncHandler(async (req, res) => {
        const { equipment, district } = req.body;
        try {
            const response = await fetch(`${FLASK_URL}/smart-pricing`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ equipment, district })
            });
            const data = await response.json();
            res.json({ message: "Pricing suggestion success", data });
        } catch (error) {
            res.status(500).json({ message: "AI Service Error", error: error.message });
        }
    }),

    // Recommendations
    recommendEquipment: asyncHandler(async (req, res) => {
        const { crop, land_size } = req.body;
        try {
            const response = await fetch(`${FLASK_URL}/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ crop, land_size })
            });
            const data = await response.json();
            res.json({ message: "Recommendations fetched", data });
        } catch (error) {
            res.status(500).json({ message: "AI Service Error", error: error.message });
        }
    }),

    // Impact Analytics
    impactAnalytics: asyncHandler(async (req, res) => {
        const { hours_used, equipment_type } = req.body;
        try {
            const response = await fetch(`${FLASK_URL}/impact-analytics`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hours_used, equipment_type })
            });
            const data = await response.json();
            res.json({ message: "Analytics fetched", data });
        } catch (error) {
            res.status(500).json({ message: "AI Service Error", error: error.message });
        }
    })
};

module.exports = aiController;
