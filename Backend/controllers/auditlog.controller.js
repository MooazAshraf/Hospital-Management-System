const AuditLog = require("../models/auditlog.model");

require("../models/users.model");

const createAuditLog = async (req, res) => {
  try {
    const newAuditLog = await AuditLog.create(req.body);

    res.status(201).json({
      success: true,
      data: newAuditLog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllAuditLogs = async (req, res) => {
  try {
    const auditLogs = await AuditLog.find()
      .populate("performedBy", "name email")
      .populate("relatedPatient", "name email")
      .populate("relatedDoctor", "name email");

    res.status(200).json({
      success: true,
      count: auditLogs.length,
      data: auditLogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAuditLog = async (req, res) => {
  try {
    const updatedAuditLog = await AuditLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAuditLog) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedAuditLog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAuditLog,
  getAllAuditLogs,
  updateAuditLog,
};