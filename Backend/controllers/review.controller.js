const Review = require("../models/review.model");
const Appointment = require("../models/appointment.model");
const Doctor = require("../models/doctors.model");

const createReview = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ success: false, message: "Only patient accounts can create reviews" });
    }

    const { doctor, appointment, rating, comment } = req.body;
    if (!doctor || !appointment || rating === undefined || !comment) {
      return res.status(400).json({ success: false, message: "doctor, appointment, rating and comment are required" });
    }

    const patientUserId = req.user.userId;
    const appointmentDoc = await Appointment.findById(appointment).populate("doctor", "user");
    if (!appointmentDoc) return res.status(404).json({ success: false, message: "Appointment not found" });

    const patient = await require("../models/patient.model").findOne({ user: patientUserId }).select("_id");
    if (!patient || String(appointmentDoc.patient) !== String(patient._id)) {
      return res.status(403).json({ success: false, message: "This appointment does not belong to you" });
    }

    const doctorProfile = await Doctor.findById(doctor).select("user");
    if (!doctorProfile || String(doctorProfile.user) !== String(appointmentDoc.doctor.user)) {
      return res.status(400).json({ success: false, message: "Invalid doctor for this appointment" });
    }

    if (appointmentDoc.status !== "Completed") {
      return res.status(400).json({ success: false, message: "You can review an appointment only after it is completed" });
    }

    const exists = await Review.findOne({ patient: patientUserId, appointment });
    if (exists) return res.status(409).json({ success: false, message: "You already reviewed this appointment" });

    const review = await Review.create({
      patient: patientUserId,
      doctor: doctorProfile.user,
      appointment,
      rating,
      comment,
    });

    res.status(201).json({ success: true, message: "Review created successfully", data: review });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .populate("appointment")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const update = {};
    if (req.body.rating !== undefined) update.rating = req.body.rating;
    if (req.body.comment !== undefined) update.comment = req.body.comment;

    const review = await Review.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    res.status(200).json({ success: true, message: "Review deleted successfully", data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReview, getAllReviews, updateReview, deleteReview };
