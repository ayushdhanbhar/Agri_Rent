const express = require("express");
const router = express.Router();

// 👇 THIS PATH MUST MATCH YOUR FOLDER
const mapController = require("../controller/mapController");

router.get("/api/v1/map/nearby-owners/:farmerId", mapController.getNearbyOwners);

module.exports = router;
