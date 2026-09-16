const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, "Action is required"],
    },

    collectionName: {
      type: String,
      required: [true, "Collection name is required"],
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Document ID is required"],
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Performed by is required"],
    },

    relatedPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    relatedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);