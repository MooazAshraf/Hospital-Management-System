const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },

    collectionName: {
      type: String,
      required: true,
      trim: true,
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    relatedPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    relatedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    oldData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "auditlogs",
  }
);

const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;