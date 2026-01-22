const mongoose = require("mongoose");

const equipmentAvailabilitySchema = new mongoose.Schema({
  equipment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment"
  },
  date: Date,
  start_time: String,
  end_time: String,
  status: {
    type: String,
    enum: ["available", "booked", "blocked"]
  }
});

module.exports = mongoose.model("EquipmentAvailability", equipmentAvailabilitySchema);
