const mongoose = require("mongoose");

const platformStatsSchema = new mongoose.Schema({
  total_users: Number,
  total_farmers: Number,
  total_owners: Number,
  total_equipments: Number,
  total_bookings: Number,
  total_revenue: Number,
  platform_commission: Number,
  top_equipment_categories: [String],
  daily_booking_count: Number
}, { timestamps: true });

module.exports = mongoose.model("PlatformStats", platformStatsSchema);
