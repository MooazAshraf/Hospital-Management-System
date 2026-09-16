const mongoose = require("mongoose");

const prescribedMedicineSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Midicine",
      required: true,
    },

    dosage: {
      type: String,
      required: true,
    },

    frequency: {
      type: String,
      required: true,
    },

    duration: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const medicalReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    surgery: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    reportType: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    diagnosis: {
      type: String,
      required: true,
    },

    findings: {
      type: String,
      default: "",
    },

    recommendations: {
      type: String,
      default: "",
    },

    prescribedMedicines: {
      type: [prescribedMedicineSchema],
      default: [],
    },

    reportDate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MedicalReport",
  medicalReportSchema,
  "medicalReports"
);