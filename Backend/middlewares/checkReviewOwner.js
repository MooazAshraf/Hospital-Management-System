const Review = require("../models/review.model");

const checkReviewAccess = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    const owner = String(review.patient) === String(req.user.userId);
    const admin = req.user.role === "admin";

    if (!owner && !admin) {
      return res.status(403).json({ success: false, message: "You are not allowed to modify this review" });
    }

    req.review = review;
    next();
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid review id" });
    res.status(500).json({ success: false, message: "Failed to check review access", error: error.message });
  }
};

module.exports = { checkReviewAccess };
