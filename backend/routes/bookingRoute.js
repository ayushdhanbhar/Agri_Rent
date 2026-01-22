const express = require("express");
const bookingController = require("../controller/bookingController");

const bookingRouter = express.Router();

// Create booking
bookingRouter.post("/api/v1/bookings/create", bookingController.createBooking);

// Get bookings by owner
bookingRouter.get("/api/v1/bookings/owner/:ownerId", bookingController.getBookingsByOwner);

// Get bookings by farmer
bookingRouter.get("/api/v1/bookings/farmer/:farmerId", bookingController.getBookingsByFarmer);

// Update booking status
bookingRouter.put("/api/v1/bookings/status/:bookingId", bookingController.updateBookingStatus);

module.exports = bookingRouter;
