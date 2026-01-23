const express = require("express");
const aiController = require("../controller/aiController");

const aiRouter = express.Router();

aiRouter.post("/api/v1/ai/predict-demand", aiController.predictDemand);
aiRouter.post("/api/v1/ai/smart-pricing", aiController.smartPricing);
aiRouter.post("/api/v1/ai/recommend", aiController.recommendEquipment);
aiRouter.post("/api/v1/ai/impact-analytics", aiController.impactAnalytics);

module.exports = aiRouter;
