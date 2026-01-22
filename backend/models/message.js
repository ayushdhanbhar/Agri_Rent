const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    booking_id: { // Optional, if we want to link chat to a specific booking context
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    is_read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
