const express = require("express");

const { authenticate } = require("../middlewares/isLogged");
const { authorize } = require("../middlewares/authorize");

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
  getDoctorsCount,
} = require("../controllers/doctors.controller");

const doctorRouter = express.Router();

// Get logged-in doctor's own profile
doctorRouter.get("/me", authenticate, authorize("doctor"), getMyDoctorProfile);

// Get all doctors
doctorRouter.get("/", getDoctors);

// IMPORTANT: count must come before /:id
doctorRouter.get("/count", getDoctorsCount);

// Get doctor by ID
doctorRouter.get("/:id", getDoctorById);

// Create doctor profile
doctorRouter.post(
  "/",
  authenticate,
  authorize("doctor", "admin"),
  createDoctorValidationRules,
  validate,
  addDoctor,
);

// Update doctor
doctorRouter.put("/:id", authenticate, updateDoctor);

// Delete doctor
doctorRouter.delete("/:id", authenticate, authorize("admin"), deleteDoctor);

module.exports = {
  doctorRouter,
};
