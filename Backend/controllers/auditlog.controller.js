const AuditLog = require("../models/auditlog.model");

const createAuditLog = async (req, res) => {
  try {
    const { action, collectionName, documentId, relatedPatient, relatedDoctor, description } = req.body;
    const log = await AuditLog.create({
      action,
      collectionName,
      documentId,
      performedBy: req.user.userId,
      relatedPatient,
      relatedDoctor,
      description,
    });
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to create audit log", error: error.message });
  }
};

const getAllAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("performedBy", "name email role")
      .populate("relatedPatient", "name email")
      .populate("relatedDoctor", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!log) return res.status(404).json({ success: false, message: "Audit log not found" });
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createAuditLog, getAllAuditLogs, updateAuditLog };
