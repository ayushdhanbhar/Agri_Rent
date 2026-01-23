const express = require("express");
const router = express.Router();
const mlController = require("../controller/mlController");

// Proxy endpoints to ML service (Node validates auth if needed)
router.post("/api/v1/ml/recommendations", mlController.recommendations);
router.post("/api/v1/ml/pricing/suggest", mlController.pricingSuggest);
router.post("/api/v1/ml/forecast/run", mlController.runForecast);

module.exports = router;

