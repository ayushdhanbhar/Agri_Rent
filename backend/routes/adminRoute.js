const express = require("express");
const adminController = require("../controller/adminController");
const router = express.Router();

// Middleware to check if admin (Simplified for now, assume auth middleware exists or handled in frontend check + backend verification if implemented)
// Real implementation should parse token and verify role === 'admin'

router.get("/api/v1/admin/stats", adminController.getOverviewStats);
router.get("/api/v1/admin/users", adminController.getAllUsers);
router.put("/api/v1/admin/users/:userId", adminController.toggleUserStatus);

router.get("/api/v1/admin/equipment", adminController.getEquipmentForModeration);
router.put("/api/v1/admin/equipment/:equipmentId", adminController.moderateEquipment);

router.get("/api/v1/admin/disputes", adminController.getAllDisputes);
router.put("/api/v1/admin/disputes/:disputeId", adminController.resolveDispute);

router.get("/api/v1/admin/analytics", adminController.getAnalytics);

module.exports = router;
