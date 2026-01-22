const Dispute = require("../models/dispute");
const Booking = require("../models/booking");
const asyncHandler = require("express-async-handler");

const disputeController = {
    createDispute: asyncHandler(async (req, res) => {
        const { booking_id, raised_by, role, issue_type, description } = req.body;

        if (!raised_by || !role || !issue_type || !description) {
            return res.status(400).json({ error: "Missing required fields: raised_by, role, issue_type, description" });
        }

        const dispute = await Dispute.create({
            booking_id: booking_id || null, // Optional
            raised_by,
            role,
            issue_type,
            description,
            status: "Pending" // Default status as per requirements
        });

        res.status(201).json({ message: "Dispute raised successfully", data: dispute });
    }),

    getMyDisputes: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const disputes = await Dispute.find({ raised_by: userId })
            .populate("booking_id")
            .sort({ createdAt: -1 });

        res.json({ data: disputes });
    }),

    // Get all disputes for Admin
    getAllDisputes: asyncHandler(async (req, res) => {
        const disputes = await Dispute.find({})
            .populate("booking_id")
            .populate("raised_by", "name email phone")
            .sort({ createdAt: -1 });
        res.json({ data: disputes });
    }),

    // Admin updates status (Resolve/Reject)
    updateDisputeStatus: asyncHandler(async (req, res) => {
        const { disputeId, status, resolution_summary, resolved_by } = req.body;

        if (!["Resolved", "Rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const dispute = await Dispute.findByIdAndUpdate(
            disputeId,
            {
                status,
                resolution_summary,
                resolved_by,
                resolved_at: new Date()
            },
            { new: true }
        );

        if (!dispute) {
            return res.status(404).json({ error: "Dispute not found" });
        }

        res.json({ message: `Dispute marked as ${status}`, data: dispute });
    }),

    // Get disputes involved with user (Old logic kept for backward compat if needed, otherwise optional)
    getDisputesForUser: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        // 1. Find all bookings involving this user
        const bookings = await Booking.find({ $or: [{ farmer_id: userId }, { owner_id: userId }] }).select('_id');
        const bookingIds = bookings.map(b => b._id);

        // 2. Find disputes linked to those bookings or raised by user
        const disputes = await Dispute.find({
            $or: [
                { booking_id: { $in: bookingIds } },
                { raised_by: userId }
            ]
        })
            .populate("booking_id")
            .populate("raised_by", "name role")
            .sort({ createdAt: -1 });

        res.json({ data: disputes });
    })
};

module.exports = disputeController;
