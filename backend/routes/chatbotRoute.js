const express = require('express');
const router = express.Router();
const chatbotController = require('../controller/chatbotController');

router.post('/api/chatbot', chatbotController.chat);

module.exports = router;
