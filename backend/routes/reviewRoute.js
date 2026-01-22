const express = require("express");
const reviewController = require("../controller/reviewController");

const reviewRouter = express.Router();

// Get reviews for an owner
reviewRouter.get("/api/v1/reviews/owner/:ownerId", reviewController.getReviewsByOwner);

// Add review
reviewRouter.post("/api/v1/reviews/add", reviewController.addReview);

module.exports = reviewRouter;
