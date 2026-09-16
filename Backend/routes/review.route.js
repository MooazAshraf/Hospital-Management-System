const express = require("express");

const router = express.Router();

const {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

router
  .route("/")
  .get(getAllReviews)
  .post(createReview);

router
  .route("/:id")
  .put(updateReview)
  .delete(deleteReview);

module.exports = router;