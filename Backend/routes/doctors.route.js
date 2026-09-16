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
  addDoctor,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctors.controller");

const doctorRouter = express.Router();

// Get all doctors - any authenticated user
doctorRouter.get("/", authenticate, getDoctors);

// Get a single doctor - any authenticated user
doctorRouter.get("/:id", authenticate, getDoctorById);

// Create a doctor profile - doctor accounts or admin only
doctorRouter.post(
  "/",
  authenticate,
  authorize("doctor", "admin"),
  createDoctorValidationRules,
  validate,
  addDoctor,
);

// Update a doctor - owner or admin
doctorRouter.put("/:id", authenticate, updateDoctor);

// Delete a doctor - admin only
doctorRouter.delete("/:id", authenticate, authorize("admin"), deleteDoctor);

module.exports = {
  doctorRouter,
};
