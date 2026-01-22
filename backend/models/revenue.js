const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking"
  },
  equipment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment"
  },
  farmer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  total_amount: Number,
  commission_percentage: Number,
  platform_earning: Number,
  owner_earning: Number,
  payment_status: String
}, { timestamps: true });

module.exports = mongoose.model("Revenue", revenueSchema);
