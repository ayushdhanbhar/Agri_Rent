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

    // ✅ MAIN CATEGORY (stored)
    category: {
      type: String,
      required: true,
      enum: Object.keys(CATEGORY_MAP),
    },

    // ✅ SUB CATEGORY / EQUIPMENT TYPE (stored)
    subCategory: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return CATEGORY_MAP[this.category]?.includes(value);
        },
        message: "Sub-category does not belong to selected category",
      },
    },

    description: {
      type: String,
      required: true,
      trim: true,
    }, 
    district: {
      type: String,
      required: true,
      trim: true,
    },

    ratePerHour: {
      type: Number,
      required: true,
      min: 0,
    },

    ratePerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Equipment", equipmentSchema);
