const User = require("../models/user");
const geocodeLocation = require("../utils/geocodeLocation");
const getDistanceInKm = require("../utils/distance");

exports.getNearbyOwners = async (req, res) => {
  try {
    const { farmerId } = req.params;

    // 1️⃣ Fetch farmer
    const farmer = await User.findById(farmerId);
    if (!farmer || farmer.role !== "farmer") {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // 2️⃣ Geocode farmer location
    const farmerCoords = await geocodeLocation(farmer);

    // 3️⃣ Fetch all owners
    const owners = await User.find({ role: "owner" });

    const nearbyOwners = [];

    for (const owner of owners) {
      // 4️⃣ Geocode owner location
      const ownerCoords = await geocodeLocation(owner);

      // 5️⃣ Calculate distance
      const distance = getDistanceInKm(
        farmerCoords.lat,
        farmerCoords.lng,
        ownerCoords.lat,
        ownerCoords.lng
      );

      if (distance <= 15) {
        nearbyOwners.push({
          ownerId: owner._id,
          name: owner.name,
          village: owner.village,
          distance: distance.toFixed(2)
        });
      }
    }

    // 6️⃣ Response
    res.json({
      farmer: farmer.name,
      nearbyOwners
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
