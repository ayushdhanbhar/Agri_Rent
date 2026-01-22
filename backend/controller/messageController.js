const Message = require("../models/message");
const asyncHandler = require("express-async-handler");

const messageController = {
    // Get messages between two users
    getMessages: asyncHandler(async (req, res) => {
        const { user1, user2 } = req.params;

        const messages = await Message.find({
            $or: [
                { sender_id: user1, receiver_id: user2 },
                { sender_id: user2, receiver_id: user1 }
            ]
        }).sort({ createdAt: 1 });

        res.json({
            message: "Messages fetched successfully.",
            data: messages
        });
    }),

    // Get list of users who have chatted with the current user
    getChatUsers: asyncHandler(async (req, res) => {
        const { userId } = req.params;

        // Find all messages where user is sender or receiver
        const messages = await Message.find({
            $or: [{ sender_id: userId }, { receiver_id: userId }]
        }).populate("sender_id", "name").populate("receiver_id", "name").sort({ createdAt: -1 });

        const usersMap = new Map();

        messages.forEach(msg => {
            let otherUser = (msg.sender_id._id.toString() === userId) ? msg.receiver_id : msg.sender_id;
            if (!usersMap.has(otherUser._id.toString())) {
                usersMap.set(otherUser._id.toString(), {
                    id: otherUser._id,
                    name: otherUser.name,
                    lastMessage: msg.content,
                    timestamp: msg.createdAt
                });
            }
        });

        res.json({
            message: "Chat users fetched.",
            data: Array.from(usersMap.values())
        });
    }),

    // Mark messages as read (optional, can be done via socket too)
    markRead: asyncHandler(async (req, res) => {
        // Logic to mark messages as read
    })
};

module.exports = messageController;
