const express = require("express");
const { authenticate } = require("../middlewares/isLogged");
const {
  getAllMedicalReports,
  getMedicalReportById,
  createMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
} = require("../controllers/medicalReports.controller");

const router = express.Router();

router.use(authenticate);
router.get("/", getAllMedicalReports);
router.get("/:id", getMedicalReportById);
router.post("/", createMedicalReport);
router.put("/:id", updateMedicalReport);
router.delete("/:id", deleteMedicalReport);

module.exports = { medicalReportsRouter: router };
