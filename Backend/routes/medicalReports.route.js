const express = require("express");

const {
  getAllMedicalReports,
  getMedicalReportById,
  createMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
} = require("../controllers/medicalReports.controller");

const medicalReportsRouter = express.Router();

// Get all medical reports
medicalReportsRouter.get("/", getAllMedicalReports);

// Get medical report by ID
medicalReportsRouter.get("/:id", getMedicalReportById);

// Create medical report
medicalReportsRouter.post("/", createMedicalReport);

// Update medical report
medicalReportsRouter.put("/:id", updateMedicalReport);

// Delete medical report
medicalReportsRouter.delete("/:id", deleteMedicalReport);

module.exports = {
  medicalReportsRouter,
};