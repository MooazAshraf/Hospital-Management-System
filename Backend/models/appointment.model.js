const mongoose = require("mongoose");

const appointmentSchema =
  new mongoose.Schema(
    {
      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
      },

      doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
      },

      date: {
        type: String,
        required: true,
      },

      time: {
        type: String,
        required: true,
      },

      appointmentType: {
        type: String,
        enum: [
          "Consultation",
          "Follow-up",
          "Check-up",
        ],
        required: true,
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 1000,
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Confirmed",
          "Completed",
          "Cancelled",
        ],
        default: "Pending",
      },

      queueNumber: {
        type: Number,
        min: 1,
      },

      slotKey: {
  type: String,
  unique: true,
  sparse: true,
},
    },
    {
      timestamps: true,
    }
  );

appointmentSchema.index({
  doctor: 1,
  date: 1,
  time: 1,
});

module.exports =
  mongoose.model(
    "Appointment",
    appointmentSchema
  );