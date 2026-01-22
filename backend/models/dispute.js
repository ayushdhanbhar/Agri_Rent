const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: false },
  raised_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["farmer", "owner"], required: true },
  issue_type: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Resolved", "Rejected"],
    default: "Pending"
  },
  resolution_summary: { type: String },
  resolved_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resolved_at: Date
}, { timestamps: true });

module.exports = mongoose.model("Dispute", disputeSchema);
