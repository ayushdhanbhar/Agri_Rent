const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking"
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  payment_gateway: String,
  transaction_id: String,
  amount: Number,
  payment_status: {
    type: String,
    enum: ["success", "failed", "refunded"]
  },
  payment_date: Date
});

module.exports = mongoose.model("Payment", paymentSchema);
