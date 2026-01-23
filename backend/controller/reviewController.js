const Review = require("../models/review");
const asyncHandler = require("express-async-handler");

const reviewController = {
    // Get reviews where the user is the reviewee (e.g., Owner seeing reviews about them)
    getReviewsByOwner: asyncHandler(async (req, res) => {
        const { ownerId } = req.params;

        // We assume 'reviewee_id' points to the Owner
        const reviews = await Review.find({ reviewee_id: ownerId })
            .populate("reviewer_id", "name") // User who wrote the review (Farmer)
            .populate("equipment_id", "subCategory category");

        res.json({
            message: "Reviews fetched successfully.",
            data: reviews
        });
    }),

    // Add a review (optional, but good to have for testing)
    addReview: asyncHandler(async (req, res) => {
        const { booking_id, reviewer_id, reviewee_id, equipment_id, rating, comment } = req.body;

        const review = await Review.create({
            booking_id, reviewer_id, reviewee_id, equipment_id, rating, comment
        });

        res.json({
            message: "Review added successfully.",
            data: review
        });
    })
};

module.exports = reviewController;
