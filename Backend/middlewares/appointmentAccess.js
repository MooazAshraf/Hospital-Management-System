const appointmentModel = require("../models/appointment.model");
const patientModel = require("../models/patient.model");
const doctorModel = require("../models/doctors.model");

// Loads the appointment from :id ONE time and checks that the logged-in
// user is allowed to touch it:
// - the owning patient
// - the assigned doctor
// - any doctor
// - or an admin
//
// On success it attaches:
//   req.appointment       -> the mongoose document (not populated)
//   req.appointmentAccess -> { isOwnerPatient, isOwnerDoctor, isDoctor, isAdmin }
// so the controller does not have to re-fetch it or redo the checks.
const checkAppointmentAccess = async (req, res, next) => {
  try {
    const appointment = await appointmentModel.findById(req.params.id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "الموعد غير موجود" });
    }

    const isDoctor = req.user.role === "doctor";
    const isAdmin = req.user.role === "admin";

    // appointment.patient / appointment.doctor store Patient/Doctor PROFILE
    // ids, not the User account id - so we resolve the logged-in user's own
    // profile first, then compare profile-to-profile.
    let isOwnerPatient = false;
    let isOwnerDoctor = false;

    if (isDoctor) {
      const doctorProfile = await doctorModel.findOne({
        user: req.user.userId,
      });
      if (doctorProfile) {
        isOwnerDoctor =
          appointment.doctor.toString() === doctorProfile._id.toString();
      }
    } else if (!isAdmin) {
      const patientProfile = await patientModel.findOne({
        user: req.user.userId,
      });
      if (patientProfile) {
        isOwnerPatient =
          appointment.patient.toString() === patientProfile._id.toString();
      }
    }

    if (!isOwnerPatient && !isOwnerDoctor && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this appointment",
      });
    }

    req.appointment = appointment;
    req.appointmentAccess = { isOwnerPatient, isOwnerDoctor, isDoctor, isAdmin };

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { checkAppointmentAccess };