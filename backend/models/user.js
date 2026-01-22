const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["farmer", "owner", "admin"]
  },
  taluka: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  village: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    required: true
  },
  rating: { type: Number, default: 0 },
  is_verified: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);