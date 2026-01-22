const express = require("express");
const messageController = require("../controller/messageController");

const messageRouter = express.Router();

// Get chat users list
messageRouter.get("/api/v1/messages/users/:userId", messageController.getChatUsers);

// Get messages between two users
messageRouter.get("/api/v1/messages/:user1/:user2", messageController.getMessages);

module.exports = messageRouter;
