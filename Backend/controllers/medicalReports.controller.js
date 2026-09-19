const MedicalReport = require("../models/medicalReports.model");
const Notification = require("../models/notifications.models");

// report.patient and report.doctor both store the User id directly (see
// schema refs), so access checks compare req.user.userId straight against
// them — no need to round-trip through a Patient/Doctor profile document,
// which isn't guaranteed to exist for every account.
const canAccessReport = (report, req) => {
  if (req.user.role === "admin") return true;
  const userId = String(req.user.userId);
  return String(report.patient) === userId || String(report.doctor) === userId;
};

const getAllMedicalReports = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "user") {
      // report.patient stores the User id directly (see schema), so we can
      // filter on it without requiring a separate Patient profile document
      // to exist first. A user should see every report tied to their
      // account, profile filled in or not.
      filter.patient = req.user.userId;
    } else if (req.user.role === "doctor") {
      filter.doctor = req.user.userId;
    } else if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const reports = await MedicalReport.find(filter)
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .populate({
        path: "prescribedMedicines.medicine",
        select: "name genericName unit",
      })
      .sort({ reportDate: -1, createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch medical reports", error: error.message });
  }
};

const getMedicalReportById = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id)
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .populate("prescribedMedicines.medicine", "name genericName unit");

    if (!report) return res.status(404).json({ success: false, message: "Medical report not found" });

    if (!canAccessReport(report, req)) {
      return res.status(403).json({ success: false, message: "You are not allowed to access this report" });
    }

    res.status(200).json(report);
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid medical report id" });
    res.status(500).json({ success: false, message: "Failed to fetch medical report", error: error.message });
  }
};

const createMedicalReport = async (req, res) => {
  try {
    if (!["doctor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only doctors and admins can create medical reports" });
    }

    const payload = { ...req.body };
    if (req.user.role === "doctor") payload.doctor = req.user.userId;

    const report = await MedicalReport.create(payload);

    try {
      await Notification.create({
        recipient: report.patient,
        sender: req.user.userId,
        type: "medical-report",
        title: "New medical report",
        message: "A new medical report has been added to your account.",
        relatedMedicalReport: report._id,
      });
    } catch (notificationError) {
      console.error("Medical report notification error:", notificationError.message);
    }

    const populated = await MedicalReport.findById(report._id)
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .populate("prescribedMedicines.medicine", "name genericName unit");

    res.status(201).json({ message: "Medical report created successfully", data: populated });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    res.status(500).json({ success: false, message: "Failed to create medical report", error: error.message });
  }
};

const updateMedicalReport = async (req, res) => {
  try {
    const existing = await MedicalReport.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Medical report not found" });

    if (req.user.role === "doctor" && String(existing.doctor) !== String(req.user.userId)) {
      return res.status(403).json({ success: false, message: "You can only update your own reports" });
    }
    if (!["doctor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only doctors and admins can update reports" });
    }

    const payload = { ...req.body };
    if (req.user.role === "doctor") {
      delete payload.doctor;
      delete payload.patient;
    }

    const report = await MedicalReport.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    })
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .populate("prescribedMedicines.medicine", "name genericName unit");

    res.status(200).json({ message: "Medical report updated successfully", data: report });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid medical report id" });
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    res.status(500).json({ success: false, message: "Failed to update medical report", error: error.message });
  }
};

const deleteMedicalReport = async (req, res) => {
  try {
    const existing = await MedicalReport.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Medical report not found" });

    if (req.user.role !== "admin" && (req.user.role !== "doctor" || String(existing.doctor) !== String(req.user.userId))) {
      return res.status(403).json({ success: false, message: "You are not allowed to delete this report" });
    }

    await MedicalReport.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Medical report deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete medical report", error: error.message });
  }
};

module.exports = {
  getAllMedicalReports,
  getMedicalReportById,
  createMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
};
