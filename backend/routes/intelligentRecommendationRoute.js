const express = require('express');
const router = express.Router();
const { getIntelligentRecommendation } = require('../controller/intelligentRecommendationController');

// POST /ml/intelligent-recommendation
router.post('/ml/intelligent-recommendation', getIntelligentRecommendation);

module.exports = router;
