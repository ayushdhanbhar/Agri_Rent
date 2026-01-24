const axios = require('axios');
const Equipment = require('../models/equipment');

// POST /ml/intelligent-recommendation
// Forwards request to Flask ML service
exports.getIntelligentRecommendation = async (req, res) => {
  try {
    const { land_size, crop_type, farming_stage } = req.body;
    if (!land_size || !crop_type || !farming_stage) {
      return res.status(400).json({
        recommended_equipment: [],
        error: 'Missing required fields.'
      });
    }
    // Fetch available equipment (all for demo, add filters as needed)
    const availableEquipmentDocs = await Equipment.find({});
    const availableEquipment = availableEquipmentDocs.map(eq => eq.subCategory);
    // Forward to Flask ML service with available equipment
    const flaskUrl = process.env.INTELLIGENT_RECOMMENDATION_URL || 'http://localhost:5055/ml/intelligent-recommendation';
    const response = await axios.post(flaskUrl, {
      land_size,
      crop_type,
      farming_stage,
      available_equipment: availableEquipment
    });
    const { recommended_equipment } = response.data;
    // If not available, handle gracefully
    if (!recommended_equipment ||
        recommended_equipment.length === 0 ||
        recommended_equipment[0] === "Equipment not available") {
      return res.status(200).json({
        recommended_equipment: [],
        message: "Equipment not available"
      });
    }
    // Fetch full equipment details for each recommended name
    // (Assume subCategory is unique enough for demo; in real use, may need more robust matching)
    const details = await Equipment.find({ subCategory: { $in: recommended_equipment } });
    // Map to required fields
    const result = details.map(eq => ({
      _id: eq._id,
      name: eq.subCategory,
      category: eq.category,
      subCategory: eq.subCategory,
      ratePerHour: eq.ratePerHour,
      ratePerDay: eq.ratePerDay,
      district: eq.district,
      owner: eq.owner_id,
      // For demo, always true; add real logic if needed
      availability: true
    }));
    if (result.length === 0) {
      return res.status(200).json({
        recommended_equipment: [],
        message: "Equipment not available"
      });
    }
    return res.status(200).json({ recommended_equipment: result });
  } catch (err) {
    if (err.response && err.response.data) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({
      recommended_equipment: [],
      error: 'Internal server error.'
    });
  }
};
