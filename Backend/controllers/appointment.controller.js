const Appointment = require("../models/appointment.model");
const Patient = require("../models/patient.model");
const Doctor = require("../models/doctors.model");
const Notification = require("../models/notifications.models");
const User = require("../models/users.model");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const populateAppointment = (query) =>
  query
    .populate({
      path: "doctor",
      populate: { path: "user", select: "name email role" },
    })
    .populate({
      path: "patient",
      populate: { path: "user", select: "name email phone role" },
    });

const slotKey = (doctor, date, time) => `${doctor}_${date}_${time}`;

const validDate = (value) => {
  if (!DATE_RE.test(String(value || ""))) return false;
  const d = new Date(`${value}T00:00:00`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};

const generateTimes = (startTime, endTime) => {
  const result = [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let current = sh * 60 + sm;
  const end = eh * 60 + em;

  while (current < end) {
    result.push(`${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`);
    current += 30;
  }
  return result;
};

const getAvailability = (doctor, date) => {
  const day = DAY_NAMES[new Date(`${date}T00:00:00`).getDay()];
  const availability = (doctor.availability || []).find((item) => item.day === day);
  return { day, availability };
};

const reorderQueueNumbers = async (doctorId, date) => {
  const appointments = await Appointment.find({
    doctor: doctorId,
    date,
    status: { $ne: "Cancelled" },
  }).sort({ time: 1, createdAt: 1, _id: 1 });

  if (!appointments.length) return;

  const bulk = appointments.map((item, index) => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $set: { queueNumber: index + 1 } },
    },
  }));
  await Appointment.bulkWrite(bulk);
};

const createAppointmentNotification = async (appointment, doctorName, patientUserId, doctorUserId) => {
  await Notification.create([
    {
      recipient: patientUserId,
      sender: null,
      type: "appointment",
      title: "Appointment booked",
      message: `Your appointment with Dr. ${doctorName} on ${appointment.date} at ${appointment.time} has been booked successfully.`,
      relatedAppointment: appointment._id,
    },
    {
      recipient: doctorUserId,
      sender: patientUserId,
      type: "appointment",
      title: "New appointment",
      message: `You have a new appointment on ${appointment.date} at ${appointment.time}.`,
      relatedAppointment: appointment._id,
    },
  ]);
};

const getAvailableSlots = async (req, res) => {
  try {
    const { doctor: doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: "Doctor and date are required" });
    }
    if (!validDate(date)) {
      return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD" });
    }

    const doctor = await Doctor.findById(doctorId).select("isAvailable availability name");
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    if (!doctor.isAvailable) {
      return res.status(200).json({ success: true, data: { doctor: doctorId, date, day: null, startTime: null, endTime: null, bookedTimes: [], availableTimes: [] } });
    }

    const { day, availability } = getAvailability(doctor, date);
    if (!availability) {
      return res.status(200).json({ success: true, data: { doctor: doctorId, date, day, startTime: null, endTime: null, bookedTimes: [], availableTimes: [] } });
    }

    const allTimes = generateTimes(availability.startTime, availability.endTime);
    const booked = await Appointment.find({
      doctor: doctorId,
      date,
      status: { $ne: "Cancelled" },
    }).select("time");

    const bookedTimes = booked.map((item) => item.time);
    const availableTimes = allTimes.filter((time) => !bookedTimes.includes(time));

    res.status(200).json({
      success: true,
      data: {
        doctor: doctorId,
        date,
        day,
        startTime: availability.startTime,
        endTime: availability.endTime,
        bookedTimes,
        availableTimes,
      },
    });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid doctor id" });
    res.status(500).json({ success: false, message: "Failed to fetch available slots", error: error.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ success: false, message: "Only patient accounts can book appointments" });
    }

    const { doctor, date, time, appointmentType, notes } = req.body;

    if (!doctor || !date || !time || !appointmentType) {
      return res.status(400).json({ success: false, message: "Doctor, date, time and appointment type are required" });
    }
    if (!validDate(date)) return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD" });
    if (!TIME_RE.test(time)) return res.status(400).json({ success: false, message: "Invalid time format. Use HH:MM" });

    let patient = await Patient.findOne({ user: req.user.userId });
    if (!patient) {
      const account = await User.findById(req.user.userId).select("name email phone");
      if (!account) return res.status(404).json({ success: false, message: "User account not found" });

      patient = await Patient.create({
        user: account._id,
        name: String(req.body.patientName || account.name).trim(),
        email: String(req.body.email || account.email).trim().toLowerCase(),
        phone: String(req.body.phone || account.phone).trim(),
      });
    }

    const doctorData = await Doctor.findById(doctor);
    if (!doctorData) return res.status(404).json({ success: false, message: "Doctor not found" });
    if (!doctorData.isAvailable) return res.status(400).json({ success: false, message: "Doctor is not available" });

    const { availability } = getAvailability(doctorData, date);
    if (!availability) return res.status(400).json({ success: false, message: "Doctor does not work on this day" });

    const validTimes = generateTimes(availability.startTime, availability.endTime);
    if (!validTimes.includes(time)) return res.status(400).json({ success: false, message: "Selected time is outside the doctor's available slots" });

    const key = slotKey(doctor, date, time);
    const conflict = await Appointment.findOne({ slotKey: key, status: { $ne: "Cancelled" } });
    if (conflict) return res.status(409).json({ success: false, message: "This appointment slot has already been booked" });

    const patientConflict = await Appointment.findOne({
      patient: patient._id,
      date,
      time,
      status: { $ne: "Cancelled" },
    });
    if (patientConflict) return res.status(409).json({ success: false, message: "You already have an appointment at this time" });

    let appointment;
    try {
      appointment = await Appointment.create({
        patient: patient._id,
        doctor,
        date,
        time,
        appointmentType,
        notes: notes || "",
        status: "Pending",
        queueNumber: 1,
        slotKey: key,
      });
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ success: false, message: "This appointment slot has already been booked" });
      throw error;
    }

    await reorderQueueNumbers(doctor, date);

    const populated = await populateAppointment(Appointment.findById(appointment._id));
    const doctorUserId = doctorData.user;

    try {
      await createAppointmentNotification(appointment, doctorData.name, req.user.userId, doctorUserId);
    } catch (notificationError) {
      console.error("Appointment notification error:", notificationError.message);
    }

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: populated,
    });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid doctor id" });
    res.status(500).json({ success: false, message: "Failed to create appointment", error: error.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user.userId }).select("_id");
      if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
      filter.doctor = doctor._id;
    } else if (req.user.role === "user") {
      const patient = await Patient.findOne({ user: req.user.userId }).select("_id");
      if (!patient) return res.status(404).json({ success: false, message: "Patient profile not found" });
      filter.patient = patient._id;
    } else if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You don't have permission to view appointments" });
    }

    const appointments = await populateAppointment(
      Appointment.find(filter).sort({ date: 1, time: 1, createdAt: 1 }),
    );

    res.status(200).json({ success: true, message: "Appointments fetched successfully", count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch appointments", error: error.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await populateAppointment(Appointment.findById(req.params.id));
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    // Read access is checked here without requiring the update/delete middleware.
    const role = req.user.role;
    let allowed = role === "admin";
    if (role === "user") {
      const patient = await Patient.findOne({ user: req.user.userId }).select("_id");
      allowed = !!patient && String(appointment.patient._id) === String(patient._id);
    } else if (role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user.userId }).select("_id");
      allowed = !!doctor && String(appointment.doctor._id) === String(doctor._id);
    }
    if (!allowed) return res.status(403).json({ success: false, message: "You are not allowed to access this appointment" });

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid appointment id" });
    res.status(500).json({ success: false, message: "Failed to fetch appointment", error: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = req.appointment;
    const access = req.appointmentAccess;

    if (!appointment || !access) return res.status(404).json({ success: false, message: "Appointment not found" });

    const { date, time, appointmentType, notes, status } = req.body;

    if (access.isOwnerPatient && !access.isAdmin) {
      if (status !== "Cancelled" || date !== undefined || time !== undefined || appointmentType !== undefined) {
        return res.status(403).json({ success: false, message: "Patients can only cancel an appointment" });
      }
      if (appointment.status === "Completed" || appointment.status === "Cancelled") {
        return res.status(400).json({ success: false, message: "This appointment can no longer be cancelled" });
      }
    }

    if (!access.isAdmin && !access.isOwnerPatient && !access.isOwnerDoctor) {
      return res.status(403).json({ success: false, message: "You are not allowed to update this appointment" });
    }

    const oldDoctor = String(appointment.doctor);
    const oldDate = appointment.date;

    if (date !== undefined) {
      if (!validDate(date)) return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD" });
      appointment.date = date;
    }
    if (time !== undefined) {
      if (!TIME_RE.test(time)) return res.status(400).json({ success: false, message: "Invalid time format. Use HH:MM" });
      appointment.time = time;
    }
    if (appointmentType !== undefined) appointment.appointmentType = appointmentType;
    if (notes !== undefined) appointment.notes = notes;
    if (status !== undefined) appointment.status = status;

    if (access.isOwnerDoctor && !access.isAdmin && status && !["Confirmed", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid appointment status" });
    }

    // Only admins can move an appointment to a different slot/date.
    if (!access.isAdmin && (date !== undefined || time !== undefined)) {
      return res.status(403).json({ success: false, message: "Only an admin can reschedule an appointment" });
    }

    if (date !== undefined || time !== undefined) {
      const doctor = await Doctor.findById(appointment.doctor);
      if (!doctor || !doctor.isAvailable) return res.status(400).json({ success: false, message: "Doctor is not available" });
      const { availability } = getAvailability(doctor, appointment.date);
      if (!availability || !generateTimes(availability.startTime, availability.endTime).includes(appointment.time)) {
        return res.status(400).json({ success: false, message: "Selected time is outside the doctor's available slots" });
      }

      appointment.slotKey = slotKey(appointment.doctor, appointment.date, appointment.time);
      const conflict = await Appointment.findOne({
        _id: { $ne: appointment._id },
        slotKey: appointment.slotKey,
        status: { $ne: "Cancelled" },
      });
      if (conflict) return res.status(409).json({ success: false, message: "This appointment slot is already booked" });
    }

    if (appointment.status === "Cancelled") {
      appointment.queueNumber = undefined;
      appointment.slotKey = undefined;
    }

    await appointment.save();
    await reorderQueueNumbers(oldDoctor, oldDate);
    if (appointment.status !== "Cancelled") await reorderQueueNumbers(appointment.doctor, appointment.date);

    const updated = await populateAppointment(Appointment.findById(appointment._id));
    res.status(200).json({ success: true, message: "Appointment updated successfully", data: updated });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "This appointment slot is already booked" });
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    res.status(500).json({ success: false, message: "Failed to update appointment", error: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Only admins can delete appointments" });

    const appointment = req.appointment;
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    const doctorId = appointment.doctor;
    const date = appointment.date;
    await Appointment.findByIdAndDelete(appointment._id);
    await reorderQueueNumbers(doctorId, date);

    res.status(200).json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete appointment", error: error.message });
  }
};

const getAppointmentsCount = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      if (!["Pending", "Confirmed", "Completed", "Cancelled"].includes(req.query.status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
      filter.status = req.query.status;
    }
    if (req.query.date === "today") {
      const now = new Date();
      filter.date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    } else if (req.query.date) {
      if (!validDate(req.query.date)) return res.status(400).json({ success: false, message: "Invalid date" });
      filter.date = req.query.date;
    }

    const count = await Appointment.countDocuments(filter);
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
  getAppointmentsCount,
};
