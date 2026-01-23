const express = require("express");
const reviewController = require("../controller/reviewController");

const reviewRouter = express.Router();

// Get reviews for an owner
reviewRouter.get("/api/v1/reviews/owner/:ownerId", reviewController.getReviewsByOwner);

// Get reviews for a farmer
reviewRouter.get("/api/v1/reviews/farmer/:farmerId", reviewController.getReviewsByFarmer);

// Add review
reviewRouter.post("/api/v1/reviews/add", reviewController.addReview);

module.exports = reviewRouter;
