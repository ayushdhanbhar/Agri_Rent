const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking"
  },
  reviewer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  reviewee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  equipment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment"
  },
  rating: { type: Number, min: 1, max: 5 },
  comment: String
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
