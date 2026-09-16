const express = require("express");

const { authenticate } = require("../middlewares/isLogged");
const { authorize } = require("../middlewares/authorize");

const {
  getPatients,
  getPatientById,
  getMyPatientProfile,
  addPatient,
  updatePatient,
  deletePatient,
} = require("../controllers/patient.controller");

const patientRouter = express.Router();

// Get all patients - doctors only
// Get all patients - doctors and admins only
patientRouter.get("/", authenticate, authorize("doctor", "admin"), getPatients);

// Get logged-in user's patient profile
patientRouter.get("/me", authenticate, getMyPatientProfile);

// Get a single patient
patientRouter.get("/:id", authenticate, getPatientById);

// Create patient profile
patientRouter.post("/", authenticate, addPatient);

// Update patient
patientRouter.put("/:id", authenticate, updatePatient);

// Delete patient
patientRouter.delete(
  "/:id",
  authenticate,
  authorize("doctor", "admin"),
  deletePatient,
);
module.exports = {
  patientRouter,
};
