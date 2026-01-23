const mongoose = require("mongoose");

const equipmentUsageEventSchema = new mongoose.Schema(
  {
    equipment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment", required: true },
    booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    event_type: {
      type: String,
      enum: ["usage_start", "usage_end", "location_ping"],
      required: true,
    },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: undefined }, // [lng, lat]
    },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

equipmentUsageEventSchema.index({ equipment_id: 1, createdAt: -1 });

module.exports = mongoose.model("EquipmentUsageEvent", equipmentUsageEventSchema);

