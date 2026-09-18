const appointmentModel = require("../models/appointment.model");
const patientModel = require("../models/patient.model");
const doctorModel = require("../models/doctors.model");

const checkAppointmentAccess = async (
  req,
  res,
  next,
) => {
  try {
    const appointment =
      await appointmentModel.findById(
        req.params.id,
      );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const role = req.user.role;

    const isDoctor =
      role === "doctor";

    const isAdmin =
      role === "admin";

    let isOwnerPatient = false;
    let isOwnerDoctor = false;

    if (isDoctor) {
      const doctor =
        await doctorModel.findOne({
          user: req.user.userId,
        });

      if (doctor) {
        isOwnerDoctor =
          appointment.doctor.toString() ===
          doctor._id.toString();
      }
    }

    if (role === "patient") {
      const patient =
        await patientModel.findOne({
          user: req.user.userId,
        });

      if (patient) {
        isOwnerPatient =
          appointment.patient.toString() ===
          patient._id.toString();
      }
    }

    const allowed =
      isAdmin ||
      isOwnerDoctor ||
      isOwnerPatient;

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to access this appointment",
      });
    }

    req.appointment = appointment;

    req.appointmentAccess = {
      isOwnerPatient,
      isOwnerDoctor,
      isDoctor,
      isAdmin,
    };

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to check appointment access",
    });
  }
};

module.exports = {
  checkAppointmentAccess,
};