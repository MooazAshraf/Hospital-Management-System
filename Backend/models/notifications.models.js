const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    type: {
      type: String,
      enum: ["appointment", "medical-report", "payment", "system"],
      default: "system",
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    relatedAppointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
    relatedMedicalReport: { type: mongoose.Schema.Types.ObjectId, ref: "MedicalReport", default: null },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
