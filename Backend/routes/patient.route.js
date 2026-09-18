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
  saveMyPatientProfile,
  getPatientsCount,
} = require("../controllers/patient.controller");

const patientRouter = express.Router();

patientRouter.get("/me", authenticate, getMyPatientProfile);
patientRouter.put("/me", authenticate, saveMyPatientProfile);

patientRouter.get("/count", authenticate, authorize("doctor", "admin"), getPatientsCount);
patientRouter.get("/", authenticate, authorize("doctor", "admin"), getPatients);
patientRouter.get("/:id", authenticate, getPatientById);
patientRouter.post("/", authenticate, addPatient);
patientRouter.put("/:id", authenticate, updatePatient);
patientRouter.delete("/:id", authenticate, authorize("admin"), deletePatient);

module.exports = { patientRouter };
