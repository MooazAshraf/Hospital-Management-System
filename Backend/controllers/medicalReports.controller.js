const MedicalReport = require("../models/medicalReports.model");

// Get all medical reports
const getAllMedicalReports = async (req, res, next) => {
  try {
    const reports = await MedicalReport.find();

    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};

// Get medical report by ID
const getMedicalReportById = async (req, res, next) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Medical report not found",
      });
    }

    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};

// Create medical report
const createMedicalReport = async (req, res, next) => {
  try {
    const report = await MedicalReport.create(req.body);

    res.status(201).json({
      message: "Medical report created successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// Update medical report
const updateMedicalReport = async (req, res, next) => {
  try {
    const report = await MedicalReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!report) {
      return res.status(404).json({
        message: "Medical report not found",
      });
    }

    res.status(200).json({
      message: "Medical report updated successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// Delete medical report
const deleteMedicalReport = async (req, res, next) => {
  try {
    const report = await MedicalReport.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Medical report not found",
      });
    }

    res.status(200).json({
      message: "Medical report deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMedicalReports,
  getMedicalReportById,
  createMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
};