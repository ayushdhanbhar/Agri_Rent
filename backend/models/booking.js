const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  farmer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  equipment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment"
  },
  start_datetime: Date,
  end_datetime: Date,
  total_hours: Number,
  total_amount: Number,
  booking_status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending"
  },
  payment_status: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
