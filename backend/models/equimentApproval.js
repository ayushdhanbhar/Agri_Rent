const mongoose = require("mongoose");

const equipmentApprovalSchema = new mongoose.Schema({
  equipment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment"
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  approval_status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  remarks: String,
  reviewed_at: Date
}, { timestamps: true });

module.exports = mongoose.model("EquipmentApproval", equipmentApprovalSchema);
