const appointmentModel = require("../models/appointment.model");
const patientModel = require("../models/patient.model");
const doctorModel = require("../models/doctors.model");

// ==========================
// Create Appointment
// - "user" (patient) books with a doctor -> patient is forced to self
// - "doctor" books on behalf of a patient -> doctor is forced to self
// Note: appointment.patient/doctor reference Patient/Doctor profile IDs,
// NOT the User account id - so we look up each profile first.
// ==========================
const createAppointment = async (req, res) => {
  try {
    const isDoctor = req.user.role === "doctor";

    let patientId, doctorId;

    if (isDoctor) {
      // Doctor is booking on behalf of a patient
      if (!req.body.patient) {
        return res.status(400).json({
          success: false,
          message: "patient is required",
        });
      }

      const patientExists = await patientModel.findById(req.body.patient);
      if (!patientExists) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }
      patientId = patientExists._id;

      const doctorProfile = await doctorModel.findOne({
        user: req.user.userId,
      });
      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }
      doctorId = doctorProfile._id;
    } else {
      // Patient is booking for themselves
      const patientProfile = await patientModel.findOne({
        user: req.user.userId,
      });
      if (!patientProfile) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }
      patientId = patientProfile._id;

      if (!req.body.doctor) {
        return res.status(400).json({
          success: false,
          message: "doctor is required",
        });
      }

      const doctorExists = await doctorModel.findById(req.body.doctor);
      if (!doctorExists) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }
      doctorId = doctorExists._id;
    }

    const { date, time, appointmentType, notes } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "date and time are required",
      });
    }

    // Auto-generate the queue number for this doctor on this date
    const sameDayCount = await appointmentModel.countDocuments({
      doctor: doctorId,
      date,
    });

    const newAppointment = await appointmentModel.create({
      patient: patientId,
      doctor: doctorId,
      date,
      time,
      appointmentType,
      notes,
      queueNumber: sameDayCount + 1,
    });

    res.status(201).json({ success: true, data: newAppointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================
// Get All Appointments
// - "doctor" sees appointments assigned to them
// - "admin" sees every appointment
// - "user" (patient) sees only their own appointments
// ==========================
const getAllAppointments = async (req, res) => {
  try {
    const isDoctor = req.user.role === "doctor";
    const isAdmin = req.user.role === "admin";

    let filter = {};

    if (isAdmin) {
      filter = {}; // no restriction - admin sees everything
    } else if (isDoctor) {
      const doctorProfile = await doctorModel.findOne({
        user: req.user.userId,
      });
      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }
      filter = { doctor: doctorProfile._id };
    } else {
      const patientProfile = await patientModel.findOne({
        user: req.user.userId,
      });
      if (!patientProfile) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }
      filter = { patient: patientProfile._id };
    }

    const appointments = await appointmentModel
      .find(filter)
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .sort({ date: -1, queueNumber: 1 });

    res
      .status(200)
      .json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================
// Get Appointment By ID
// Auth + ownership already handled by checkAppointmentAccess middleware
// ==========================
const getAppointmentById = async (req, res) => {
  try {
    await req.appointment.populate([
      { path: "patient", select: "name email" },
      { path: "doctor", select: "name email" },
    ]);

    res.status(200).json({ success: true, data: req.appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================
// Update Appointment
// Auth + ownership already handled by checkAppointmentAccess middleware
// - the assigned doctor, any doctor, or an admin can update everything
// - the owning patient can only cancel it or edit their notes
// ==========================
const updateAppointment = async (req, res) => {
  try {
    const { isDoctor, isAdmin } = req.appointmentAccess;

    let updateData = req.body;

    // A patient (non-doctor, non-admin) may only cancel the appointment or edit notes
    if (!isDoctor && !isAdmin) {
      updateData = {};
      if (req.body.notes !== undefined) updateData.notes = req.body.notes;
      if (req.body.status === "Cancelled") updateData.status = "Cancelled";
    }

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    res.status(200).json({ success: true, data: updatedAppointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================
// Delete Appointment (doctors and admins only)
// ==========================
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await appointmentModel.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};