const express = require("express");

const router = express.Router();

const {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

const { authenticate } = require("../middlewares/isLogged.js");
const { checkReviewAccess } = require("../middlewares/checkReviewOwner.js");

router
  .route("/")
  .get(getAllReviews)
  .post(authenticate, createReview);

router
  .route("/:id")
  .put(authenticate, checkReviewAccess, updateReview)
  .delete(authenticate, checkReviewAccess, deleteReview);

module.exports = router;