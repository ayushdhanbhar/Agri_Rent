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

    // 2️⃣ Validate farmer location
    if (!farmer.village || farmer.village.trim() === "") {
      return res
        .status(400)
        .json({ message: "Farmer district information is missing" });
    }

    const farmerLocationString = `${farmer.village || ""}, ${farmer.taluka || ""}, ${farmer.district}`
      .replace(/,\s*,/g, ",")
      .trim();

    const farmerCoords = await geocodeLocation(farmerLocationString);

    // 3️⃣ Fetch all owners
    const owners = await User.find({ role: "owner" });

    const nearbyOwners = [];

    for (const owner of owners) {
      // 4️⃣ Skip owners without location
      if (!owner.village || owner.village.trim() === "") continue;

      const ownerLocationString = `${owner.village || ""}, ${owner.taluka || ""}, ${owner.district}`
        .replace(/,\s*,/g, ",")
        .trim();

      const ownerCoords = await geocodeLocation(ownerLocationString);

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
          distance: Number(distance.toFixed(2)), // ✅ FIX: number, not string
          lat: ownerCoords.lat,
          long: ownerCoords.lng
        });
      }
    }

    // 6️⃣ Sort by nearest first ✅ FIX
    nearbyOwners.sort((a, b) => a.distance - b.distance);

    // 7️⃣ Response
    res.json({
      farmer: farmer.name,
      farmetLat: farmerCoords.lat,
      farmerLong: farmerCoords.lng,
      nearbyOwners
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
