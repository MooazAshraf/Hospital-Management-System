const express = require("express");

const {
  authenticate,
} = require("../middlewares/isLogged");

const {
  authorize,
} = require("../middlewares/authorize");

const {
  createDoctorValidationRules,
  validate,
} = require("../middlewares/doctorValidation");

const {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  addDoctor,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctors.controller");


const doctorRouter = express.Router();


// ==========================================
// Get logged-in doctor's own profile
// Doctor only
// NOTE: must come before "/:id" or Express will
// treat "me" as an :id value
// ==========================================

doctorRouter.get(
  "/me",
  authenticate,
  authorize("doctor"),
  getMyDoctorProfile
);


// ==========================================
// Get all doctors
// Public — anyone can browse the doctors list,
// no login required
// ==========================================

doctorRouter.get(
  "/",
  getDoctors
);


// ==========================================
// Get doctor by ID
// Public — anyone can view a doctor's profile,
// no login required
// ==========================================

doctorRouter.get(
  "/:id",
  getDoctorById
);


// ==========================================
// Create doctor profile
// Doctor or Admin
// ==========================================

doctorRouter.post(
  "/",
  authenticate,
  authorize("doctor", "admin"),
  createDoctorValidationRules,
  validate,
  addDoctor
);


// ==========================================
// Update doctor
// Owner or Admin
// ==========================================

doctorRouter.put(
  "/:id",
  authenticate,
  updateDoctor
);


// ==========================================
// Delete doctor
// Admin only
// ==========================================

doctorRouter.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteDoctor
);


module.exports = {
  doctorRouter,
};