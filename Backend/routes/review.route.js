const express = require("express");
const { authenticate } = require("../middlewares/isLogged");
const { authorize } = require("../middlewares/authorize");
const { checkReviewAccess } = require("../middlewares/checkReviewOwner");
const {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

const router = express.Router();

router.get("/", getAllReviews);
router.post("/", authenticate, authorize("user"), createReview);
router.put("/:id", authenticate, checkReviewAccess, updateReview);
router.delete("/:id", authenticate, checkReviewAccess, deleteReview);

module.exports = router;
