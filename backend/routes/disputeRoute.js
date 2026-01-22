const express = require("express");
const router = express.Router();
const disputeController = require("../controller/disputeController");

router.post("/api/v1/disputes/create", disputeController.createDispute);
router.get("/api/v1/disputes/my/:userId", disputeController.getMyDisputes);
router.get("/api/v1/disputes/user/:userId", disputeController.getDisputesForUser);
router.get("/api/v1/disputes/admin/all", disputeController.getAllDisputes);
router.put("/api/v1/disputes/admin/status", disputeController.updateDisputeStatus);

module.exports = router;
