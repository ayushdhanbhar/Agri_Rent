const mongoose = require("mongoose");

const CATEGORY_MAP = {
  "Land Preparation Equipment": [
    "Tractor",
    "Power Tiller",
    "Plough",
    "Harrow",
    "Cultivator",
    "Rotavator",
    "Subsoiler",
    "Land Leveler",
    "Laser Land Leveler",
  ],

  "Sowing & Planting Equipment": [
    "Seed Drill",
    "Seed Cum Fertilizer Drill",
    "Planter",
    "Rice Transplanter",
    "Potato Planter",
    "Maize Planter",
    "Sugarcane Planter",
    "Nursery Seeder",
    "Dibber",
  ],

  "Irrigation Equipment": [
    "Water Pump",
    "Drip Irrigation System",
    "Sprinkler System",
    "Hose Pipes",
    "Rain Gun",
    "Micro Irrigation System",
    "Submersible Pump",
    "Centrifugal Pump",
  ],

  "Crop Protection Equipment": [
    "Knapsack Sprayer",
    "Boom Sprayer",
    "Fogger",
    "Duster",
    "Weed Cutter",
    "Brush Cutter",
    "Drone Sprayer",
  ],

  "Fertilizer & Manure Application": [
    "Fertilizer Spreader",
    "Manure Spreader",
    "Compost Spreader",
    "Broadcast Sprayer",
  ],

  "Harvesting Equipment": [
    "Harvester",
    "Combine Harvester",
    "Reaper",
    "Reaper Binder",
    "Paddy Harvester",
    "Sugarcane Harvester",
    "Forage Harvester",
  ],

  "Post-Harvest Equipment": [
    "Thresher",
    "Winnower",
    "Grain Cleaner",
    "Dehusker",
    "Paddy Separator",
    "Maize Separator",
    "Grain Dryer",
    "Baler",
  ],

  "Storage & Handling Equipment": [
    "Grain Storage Bins",
    "Cold Storage Units",
    "Silage Bags",
    "Crates",
    "Weighing Scale",
    "Conveyor Belt",
  ],

  "Transport & Material Handling": [
    "Tractor Trolley",
    "Trailer",
    "Farm Cart",
    "Mini Truck",
    "Forklift",
    "Hand Trolley",
  ],

  "Orchard & Plantation Equipment": [
    "Pruning Machine",
    "Orchard Sprayer",
    "Hedge Trimmer",
    "Fruit Picker",
    "Mulcher",
    "Chipper",
  ],

  "Renewable & Smart Farming Equipment": [
    "Solar Pump",
    "Soil Moisture Sensor",
    "Weather Station",
    "GPS Tracker",
    "Farm Drone",
    "Yield Monitor",
  ],

  "Small Tools & Accessories": [
    "Chainsaw",
    "Power Weeder",
    "Auger",
    "Earth Auger",
    "Generator",
    "Pressure Washer",
  ],
};

const equipmentSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Canonical name used by frontend + API
    equipment_name: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ MAIN CATEGORY (stored)
    category: {
      type: String,
      required: true,
      enum: Object.keys(CATEGORY_MAP),
    },

    // ✅ SUB CATEGORY / EQUIPMENT TYPE (stored) (backward compatibility)
    // Many flows in this repo treat equipment_name as the sub-category/type.
    subCategory: {
      type: String,
      required: false,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return CATEGORY_MAP[this.category]?.includes(value);
        },
        message: "Sub-category does not belong to selected category",
      },
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Canonical pricing fields used by frontend
    price_per_hour: { type: Number, required: true, min: 0 },
    price_per_day: { type: Number, required: true, min: 0 },

    // Backward-compatible aliases (older code used these names)
    ratePerHour: { type: Number, required: false, min: 0 },
    ratePerDay: { type: Number, required: false, min: 0 },

    // Moderation lifecycle (used by admin + farmer fetch)
    approval_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["inactive", "active", "deleted"],
      default: "inactive",
    },

    // Location tracking (GeoJSON Point)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined,
      },
    },
    location_label: { type: String, default: "", trim: true }, // e.g., address/village
    last_location_updated_at: { type: Date },

    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratings_count: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Geo index for map queries
equipmentSchema.index({ location: "2dsphere" });

// Keep older fields in sync if only one set is provided
equipmentSchema.pre("validate", function (next) {
  if (this.price_per_hour == null && this.ratePerHour != null) this.price_per_hour = this.ratePerHour;
  if (this.price_per_day == null && this.ratePerDay != null) this.price_per_day = this.ratePerDay;
  if (this.ratePerHour == null && this.price_per_hour != null) this.ratePerHour = this.price_per_hour;
  if (this.ratePerDay == null && this.price_per_day !=null) this.ratePerDay = this.price_per_day;

  if (!this.subCategory && this.equipment_name) {
    this.subCategory = this.equipment_name;
  }
  next();
});

module.exports = mongoose.model("Equipment", equipmentSchema);
