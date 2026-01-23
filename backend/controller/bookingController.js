const Booking = require("../models/booking");
const asyncHandler = require("express-async-handler");

const bookingController = {
    // Create a new booking request
    createBooking: asyncHandler(async (req, res) => {
        const { farmer_id, owner_id, equipment_id, start_datetime, end_datetime, total_hours, total_amount } = req.body;

        const booking = await Booking.create({
            farmer_id,
            owner_id,
            equipment_id,
            start_datetime,
            end_datetime,
            total_hours,
            total_amount,
            booking_status: "pending"
        });

        if (req.io) {
            req.io.to(owner_id.toString()).emit("notification", {
                type: "new_booking",
                message: "New booking request received!",
                data: booking
            });
        }

        res.status(201).json({
            message: "Booking requested successfully.",
            data: booking
        });
    }),

    // Get bookings for a specific owner
    getBookingsByOwner: asyncHandler(async (req, res) => {
        const { ownerId } = req.params;
        const bookings = await Booking.find({ owner_id: ownerId })
            .populate("farmer_id", "name email phone")
            .populate("equipment_id", "subCategory category ratePerHour ratePerDay");

        res.json({
            message: "Owner bookings fetched successfully.",
            data: bookings
        });
    }),

    // Get bookings for a specific farmer
    getBookingsByFarmer: asyncHandler(async (req, res) => {
        const { farmerId } = req.params;
        const bookings = await Booking.find({ farmer_id: farmerId })
            .populate("owner_id", "name email phone")
            .populate("equipment_id", "subCategory category ratePerHour ratePerDay");

        res.json({
            message: "Farmer bookings fetched successfully.",
            data: bookings
        });
    }),

    // Update booking status (e.g., confirm, cancel)
    updateBookingStatus: asyncHandler(async (req, res) => {
        const { bookingId } = req.params;
        const { status } = req.body; // expected: "confirmed", "cancelled", "completed"

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { booking_status: status },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }

        // Emit real-time notification to the farmer
        if (req.io) {
            req.io.to(booking.farmer_id.toString()).emit("notification", {
                type: "booking_update",
                message: `Your booking for ${booking.equipment_id} is now ${status}`,
                data: booking
            });
        }

        res.json({
            message: `Booking ${status} successfully.`,
            data: booking
        });
    })
};

module.exports = bookingController;
