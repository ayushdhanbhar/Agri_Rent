const User = require("../models/user");
const Equipment = require("../models/equipment");
const Booking = require("../models/booking");
const Dispute = require("../models/dispute");
const asyncHandler = require("express-async-handler");

const adminController = {
    // 1. Overview Stats
    getOverviewStats: asyncHandler(async (req, res) => {
        const totalUsers = await User.countDocuments();
        const totalOwners = await User.countDocuments({ role: "owner" });
        const totalFarmers = await User.countDocuments({ role: "farmer" });
        const totalDisputes = await Dispute.countDocuments();
        const activeRentals = await Booking.countDocuments({ booking_status: "confirmed" });
        const pendingDisputes = await Dispute.countDocuments({ status: "open" });

        // Revenue Calculation
        const result = await Booking.aggregate([
            { $match: { booking_status: { $in: ["confirmed", "completed"] } } },
            { $group: { _id: null, totalRevenue: { $sum: "$total_amount" } } }
        ]);
        const totalVolume = result.length > 0 ? result[0].totalRevenue : 0;
        const platformRevenue = Math.round(totalVolume * 0.10); // 10% commission

        res.json({
            data: {
                totalUsers,
                totalOwners,
                totalFarmers,
                totalDisputes,
                activeRentals,
                platformRevenue,
                pendingDisputes,
                totalVolume
            }
        });
    }),

    // 2. User Management
    getAllUsers: asyncHandler(async (req, res) => {
        const users = await User.find({})
            .select("-password")
            .sort({ createdAt: -1 });
        res.json({ data: users });
    }),

    toggleUserStatus: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const { is_active } = req.body;
        await User.findByIdAndUpdate(userId, { is_active });
        res.json({ message: "User status updated." });
    }),

    // 3. Equipment Moderation
    getEquipmentForModeration: asyncHandler(async (req, res) => {
        // Fetch all equipment regardless of status so admin can see pending/rejected too
        const equipment = await Equipment.find({}).populate("owner_id", "name");
        res.json({ data: equipment });
    }),

    moderateEquipment: asyncHandler(async (req, res) => {
        const { equipmentId } = req.params;
        const { approval_status } = req.body; // approved / rejected
        await Equipment.findByIdAndUpdate(equipmentId, { approval_status });

        if (approval_status === 'rejected') {
            await Equipment.findByIdAndUpdate(equipmentId, { status: "inactive" });
        } else if (approval_status === 'approved') {
            await Equipment.findByIdAndUpdate(equipmentId, { status: "active" });
        }

        res.json({ message: "Equipment updated." });
    }),

    // 4. Disputes
    getAllDisputes: asyncHandler(async (req, res) => {
        const disputes = await Dispute.find({})
            .populate("raised_by", "name email role")
            .populate("booking_id")
            .sort({ createdAt: -1 });
        res.json({ data: disputes });
    }),

    resolveDispute: asyncHandler(async (req, res) => {
        const { disputeId } = req.params;
        const { status, resolution_summary, adminId } = req.body;

        await Dispute.findByIdAndUpdate(disputeId, {
            status,
            resolution_summary,
            resolved_by: adminId,
            resolved_at: new Date()
        });

        res.json({ message: "Dispute updated." });
    }),

    // 5. Analytics Data (Charts)
    getAnalytics: asyncHandler(async (req, res) => {
        // Monthly Revenue
        const revenueData = await Booking.aggregate([
            { $match: { booking_status: { $in: ["confirmed", "completed"] } } },
            {
                $group: {
                    _id: { $month: "$start_datetime" },
                    total: { $sum: "$total_amount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Booking Trends (Daily)
        const bookingTrends = await Booking.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$start_datetime" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            { $limit: 7 }
        ]);

        // Dispute Stats
        const disputeStats = await Dispute.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // User Growth (Role distribution)
        const userDist = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);

        // Active Users Trend (Mocking based on createdAt - monthly)
        const activeUsersTrend = await User.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Equipment Growth
        const equipmentGrowth = await Equipment.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            data: {
                revenueChart: revenueData,
                bookingTrends: bookingTrends,
                disputeStats: disputeStats,
                userDist: userDist,
                activeUsersTrend,
                equipmentGrowth
            }
        });
    })
};

module.exports = adminController;
