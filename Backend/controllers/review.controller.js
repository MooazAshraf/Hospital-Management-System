const Review = require("../models/review.model");

const createReview = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only patient accounts can create reviews",
      });
    }

    const {
      doctor,
      rating,
      comment,
    } = req.body;

    if (
      !doctor ||
      rating === undefined ||
      !comment
    ) {
      return res.status(400).json({
        success: false,
        message: "doctor, rating and comment are required",
      });
    }

    const patientUserId = req.user.userId;

    const review = await Review.create({
      patient: patientUserId,
      doctor,
      rating,
      comment,
    });

    const populatedReview =
      await Review.findById(review._id)
        .populate(
          "patient",
          "name email"
        )
        .populate(
          "doctor",
          "name email"
        );

    console.log(
      "CREATED REVIEW:",
      populatedReview
    );

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: populatedReview,
    });

  } catch (error) {

    console.error(
      "CREATE REVIEW ERROR:",
      error
    );

    if (
      error.name === "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getAllReviews = async (req, res) => {
  try {

    const reviews =
      await Review.find()
        .populate(
          "patient",
          "name email"
        )
        .populate(
          "doctor",
          "name email"
        )
        .populate("appointment")
        .sort({
          createdAt: -1,
        });

    console.log(
      "ALL REVIEWS FROM DB:",
      reviews
    );

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });

  } catch (error) {

    console.error(
      "GET REVIEWS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


const updateReview = async (req, res) => {
  try {

    const review =
      await Review.findByIdAndUpdate(
        req.params.id,
        {
          rating: req.body.rating,
          comment: req.body.comment,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "patient",
          "name email"
        )
        .populate(
          "doctor",
          "name email"
        );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    console.log(
      "UPDATED REVIEW:",
      review
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });

  } catch (error) {

    console.error(
      "UPDATE REVIEW ERROR:",
      error
    );

    if (
      error.name === "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const deleteReview = async (req, res) => {
  try {

    const review =
      await Review.findByIdAndDelete(
        req.params.id
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    console.log(
      "DELETED REVIEW:",
      review
    );

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: review,
    });

  } catch (error) {

    console.error(
      "DELETE REVIEW ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


module.exports = {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
};