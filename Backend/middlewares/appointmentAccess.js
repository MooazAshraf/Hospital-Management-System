const Appointment = require("../models/appointment.model");
const Patient = require("../models/patient.model");
const Doctor = require("../models/doctors.model");

const checkAppointmentAccess = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const role = req.user.role;
    const isAdmin = role === "admin";
    let isOwnerPatient = false;
    let isOwnerDoctor = false;

    if (role === "user") {
      const patient = await Patient.findOne({ user: req.user.userId }).select("_id");
      isOwnerPatient = !!patient && String(appointment.patient) === String(patient._id);
    }

    if (role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user.userId }).select("_id");
      isOwnerDoctor = !!doctor && String(appointment.doctor) === String(doctor._id);
    }

    if (!isAdmin && !isOwnerPatient && !isOwnerDoctor) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this appointment",
      });
    }

    req.appointment = appointment;
    req.appointmentAccess = {
      isAdmin,
      isOwnerPatient,
      isOwnerDoctor,
      isDoctor: role === "doctor",
    };

    next();
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid appointment id" });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to check appointment access",
      error: error.message,
    });
  }
};

module.exports = { checkAppointmentAccess };
