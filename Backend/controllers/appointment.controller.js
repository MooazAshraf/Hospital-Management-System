const mongoose = require("mongoose");

const User = require("../models/users.model");
const Patient = require("../models/patient.model");
const Doctor = require("../models/doctors.model");
const Appointment = require("../models/appointment.model");
const Notification = require("../models/notifications.models");

<<<<<<< HEAD
// =====================================================
// Helpers
// =====================================================
=======
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1

const normalizeDate = (date) => {
  if (!date) return null;

  const value = String(date).trim();

<<<<<<< HEAD
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
=======
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
    result.push(
      `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`,
    );
    current += 30;
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
  }

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }

  return value;
};

<<<<<<< HEAD
const normalizeTime = (time) => {
  if (!time) return "";

  return String(time)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
=======
const getAvailability = (doctor, date) => {
  const day = DAY_NAMES[new Date(`${date}T00:00:00`).getDay()];
  const availability = (doctor.availability || []).find(
    (item) => item.day === day,
  );
  return { day, availability };
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
};

const sameTime = (time1, time2) => {
  return normalizeTime(time1) === normalizeTime(time2);
};

<<<<<<< HEAD
const getDoctorDisplayName = (doctor) => {
  if (!doctor) {
    return "Doctor";
  }

  return (
    doctor.name ||
    doctor.fullName ||
    doctor.doctorName ||
    doctor.displayName ||
    "Doctor"
  );
=======
const createAppointmentNotification = async (
  appointment,
  doctorName,
  patientUserId,
  doctorUserId,
) => {
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
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
};

// =====================================================
// Notification Helper
// =====================================================

const sendNotification = async ({
  recipient,
  sender = null,
  type = "appointment",
  title,
  message,
  relatedAppointment = null,
}) => {
  try {
<<<<<<< HEAD
    if (!recipient) {
      console.warn("Notification skipped: recipient is missing");
      return null;
    }

    return await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedAppointment,
    });
  } catch (error) {
    // Notification failure must NOT cancel the appointment
    console.error("Notification error:", error.message);
    return null;
=======
    const { doctor: doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor and date are required" });
    }
    if (!validDate(date)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
    }

    const doctor = await Doctor.findById(doctorId).select(
      "isAvailable availability name",
    );
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });

    if (!doctor.isAvailable) {
      return res
        .status(200)
        .json({
          success: true,
          data: {
            doctor: doctorId,
            date,
            day: null,
            startTime: null,
            endTime: null,
            bookedTimes: [],
            availableTimes: [],
          },
        });
    }

    const { day, availability } = getAvailability(doctor, date);
    if (!availability) {
      return res
        .status(200)
        .json({
          success: true,
          data: {
            doctor: doctorId,
            date,
            day,
            startTime: null,
            endTime: null,
            bookedTimes: [],
            availableTimes: [],
          },
        });
    }

    const allTimes = generateTimes(
      availability.startTime,
      availability.endTime,
    );
    const booked = await Appointment.find({
      doctor: doctorId,
      date,
      status: { $ne: "Cancelled" },
    }).select("time");

    const bookedTimes = booked.map((item) => item.time);
    const availableTimes = allTimes.filter(
      (time) => !bookedTimes.includes(time),
    );

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
    if (error.name === "CastError")
      return res
        .status(400)
        .json({ success: false, message: "Invalid doctor id" });
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch available slots",
        error: error.message,
      });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
  }
};

// =====================================================
// Get / Create Patient For Logged-in User
// =====================================================

const getPatientForUser = async (userId) => {
  if (!userId) {
    return null;
  }

  // ---------------------------------------------------
  // 1. Check existing Patient profile
  // ---------------------------------------------------

  let patientProfile = await Patient.findOne({
    user: userId,
  });

  if (patientProfile) {
    return patientProfile;
  }

  // ---------------------------------------------------
  // 2. Get logged-in User
  // ---------------------------------------------------

  const user = await User.findById(userId).select(
    "name email phone role"
  );

  if (!user) {
    return null;
  }

  // Only normal users can have Patient profiles
  if (user.role !== "user") {
    return null;
  }

  // ---------------------------------------------------
  // 3. Create Patient profile automatically
  // ---------------------------------------------------

  patientProfile = await Patient.create({
    user: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  });

  return patientProfile;
};

// =====================================================
// Create Appointment
// =====================================================

const createAppointment = async (req, res) => {
  try {
<<<<<<< HEAD
    const {
      patient,
      doctor,
      date,
      time,
      appointmentType,
      notes,
    } = req.body;
=======
    if (req.user.role !== "user") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only patient accounts can book appointments",
        });
    }

    const { doctor, date, time, appointmentType, notes } = req.body;

    if (!doctor || !date || !time || !appointmentType) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Doctor, date, time and appointment type are required",
        });
    }
    if (!validDate(date))
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
    if (!TIME_RE.test(time))
      return res
        .status(400)
        .json({ success: false, message: "Invalid time format. Use HH:MM" });

    let patient = await Patient.findOne({ user: req.user.userId });
    if (!patient) {
      const account = await User.findById(req.user.userId).select(
        "name email phone",
      );
      if (!account)
        return res
          .status(404)
          .json({ success: false, message: "User account not found" });

      patient = await Patient.create({
        user: account._id,
        name: String(req.body.patientName || account.name).trim(),
        email: String(req.body.email || account.email)
          .trim()
          .toLowerCase(),
        phone: String(req.body.phone || account.phone).trim(),
      });
    }

    const doctorData = await Doctor.findById(doctor);
    if (!doctorData)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    if (!doctorData.isAvailable)
      return res
        .status(400)
        .json({ success: false, message: "Doctor is not available" });

    const { availability } = getAvailability(doctorData, date);
    if (!availability)
      return res
        .status(400)
        .json({ success: false, message: "Doctor does not work on this day" });

    const validTimes = generateTimes(
      availability.startTime,
      availability.endTime,
    );
    if (!validTimes.includes(time))
      return res
        .status(400)
        .json({
          success: false,
          message: "Selected time is outside the doctor's available slots",
        });

    const key = slotKey(doctor, date, time);
    const conflict = await Appointment.findOne({
      slotKey: key,
      status: { $ne: "Cancelled" },
    });
    if (conflict)
      return res
        .status(409)
        .json({
          success: false,
          message: "This appointment slot has already been booked",
        });

    const patientConflict = await Appointment.findOne({
      patient: patient._id,
      date,
      time,
      status: { $ne: "Cancelled" },
    });
    if (patientConflict)
      return res
        .status(409)
        .json({
          success: false,
          message: "You already have an appointment at this time",
        });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1

    // -------------------------------------------------
    // Basic validation
    // -------------------------------------------------

    if (!doctor || !date || !time || !appointmentType) {
      return res.status(400).json({
        success: false,
        message:
          "doctor, date, time and appointmentType are required",
      });
<<<<<<< HEAD
=======
    } catch (error) {
      if (error.code === 11000)
        return res
          .status(409)
          .json({
            success: false,
            message: "This appointment slot has already been booked",
          });
      throw error;
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
    }

    // -------------------------------------------------
    // Validate doctor ID
    // -------------------------------------------------

<<<<<<< HEAD
    if (!mongoose.Types.ObjectId.isValid(doctor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor id",
      });
=======
    const populated = await populateAppointment(
      Appointment.findById(appointment._id),
    );
    const doctorUserId = doctorData.user;

    try {
      await createAppointmentNotification(
        appointment,
        doctorData.name,
        req.user.userId,
        doctorUserId,
      );
    } catch (notificationError) {
      console.error(
        "Appointment notification error:",
        notificationError.message,
      );
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
    }

    // -------------------------------------------------
    // Check doctor exists
    // -------------------------------------------------

    const doctorProfile = await Doctor.findById(doctor);

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // -------------------------------------------------
    // Get Patient
    // -------------------------------------------------

    let patientId = patient || null;

    // For logged-in normal users:
    // Always use the Patient profile belonging
    // to the authenticated user.

    if (req.user?.role === "user") {
      const patientProfile = await getPatientForUser(
        req.user.userId
      );

      if (!patientProfile) {
        return res.status(404).json({
          success: false,
          message:
            "Unable to create patient profile for the logged-in user",
        });
      }

      patientId = patientProfile._id;
    }

    // -------------------------------------------------
    // Validate Patient
    // -------------------------------------------------

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient id",
      });
    }

    // -------------------------------------------------
    // Make sure Patient exists
    // -------------------------------------------------

    const patientExists = await Patient.findById(patientId);

    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // -------------------------------------------------
    // Normalize date and time
    // -------------------------------------------------

    const normalizedDate = normalizeDate(date);
    const normalizedTime = normalizeTime(time);

    if (!normalizedDate || !normalizedTime) {
      return res.status(400).json({
        success: false,
        message: "Valid date and time are required",
      });
    }

    // -------------------------------------------------
    // Validate appointment type
    // -------------------------------------------------

    const allowedAppointmentTypes = [
      "Consultation",
      "Follow-up",
      "Check-up",
    ];

    if (!allowedAppointmentTypes.includes(appointmentType)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid appointment type. Allowed values are Consultation, Follow-up, Check-up",
      });
    }

    // -------------------------------------------------
    // Check booked slot
    // -------------------------------------------------

    const appointments = await Appointment.find({
      doctor,
      date: normalizedDate,
      status: {
        $in: ["Pending", "Confirmed"],
      },
    }).select("time");

    const alreadyBooked = appointments.some((appointment) =>
      sameTime(appointment.time, normalizedTime)
    );

    if (alreadyBooked) {
      return res.status(409).json({
        success: false,
        message: "This appointment slot is already booked",
      });
    }

    // -------------------------------------------------
    // Unique slot key
    // -------------------------------------------------

    const slotKey =
      `${doctor}-${normalizedDate}-${normalizedTime}`;

    // Check active appointment using same slot
    const existingSlot = await Appointment.findOne({
      slotKey,
      status: {
        $in: ["Pending", "Confirmed"],
      },
    });

    if (existingSlot) {
      return res.status(409).json({
        success: false,
        message: "This appointment slot is already booked",
      });
    }

    // -------------------------------------------------
    // Free old cancelled slot if it still owns
    // the same slotKey
    // -------------------------------------------------

    const cancelledSlot = await Appointment.findOne({
      slotKey,
      status: "Cancelled",
    });

    if (cancelledSlot) {
      cancelledSlot.slotKey = undefined;
      await cancelledSlot.save();
    }

    // -------------------------------------------------
    // Queue number
    // -------------------------------------------------

    const lastAppointment = await Appointment.findOne({
      doctor,
      date: normalizedDate,
      status: {
        $in: ["Pending", "Confirmed"],
      },
    }).sort({
      queueNumber: -1,
    });

    const queueNumber = lastAppointment?.queueNumber
      ? lastAppointment.queueNumber + 1
      : 1;

    // -------------------------------------------------
    // Create appointment
    // -------------------------------------------------

    const appointment = await Appointment.create({
      patient: patientId,
      doctor,
      date: normalizedDate,
      time: normalizedTime,
      appointmentType,
      notes: notes || "",
      status: "Pending",
      queueNumber,
      slotKey,
    });

    // -------------------------------------------------
    // Populate appointment
    // -------------------------------------------------

    const populatedAppointment =
      await Appointment.findById(appointment._id)
        .populate("patient")
        .populate("doctor");

    // =================================================
    // Create Notification For Patient
    // =================================================

    if (req.user?.userId) {
      const doctorName =
        getDoctorDisplayName(doctorProfile);

      await sendNotification({
        recipient: req.user.userId,
        sender: null,
        type: "appointment",
        title: "Appointment booked successfully",
        message:
          `Your appointment with Dr. ${doctorName} ` +
          `has been booked for ${normalizedDate} ` +
          `at ${normalizedTime}.`,
        relatedAppointment: appointment._id,
      });
    }

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully",

      appointment: populatedAppointment,
      data: populatedAppointment,
    });

  } catch (error) {
<<<<<<< HEAD
    console.error("Create appointment error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This appointment slot is already booked",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create appointment",
      error: error.message,
    });
=======
    if (error.name === "ValidationError")
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation failed",
          error: error.message,
        });
    if (error.name === "CastError")
      return res
        .status(400)
        .json({ success: false, message: "Invalid doctor id" });
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create appointment",
        error: error.message,
      });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
  }
};

// =====================================================
// Get All Appointments
// =====================================================

const getAllAppointments = async (req, res) => {
  try {
    const filter = {};

<<<<<<< HEAD
    // -------------------------------------------------
    // Patient
    // -------------------------------------------------

    if (req.user?.role === "user") {
      const patientProfile = await getPatientForUser(
        req.user.userId
      );

      if (!patientProfile) {
        return res.status(200).json({
          success: true,
          message: "Appointments fetched successfully",
          count: 0,
          appointments: [],
          data: [],
        });
      }

      filter.patient = patientProfile._id;
=======
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user.userId }).select(
        "_id",
      );
      if (!doctor)
        return res
          .status(404)
          .json({ success: false, message: "Doctor profile not found" });
      filter.doctor = doctor._id;
    } else if (req.user.role === "user") {
      const patient = await Patient.findOne({ user: req.user.userId }).select(
        "_id",
      );
      if (!patient)
        return res
          .status(404)
          .json({ success: false, message: "Patient profile not found" });
      filter.patient = patient._id;
    } else if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "You don't have permission to view appointments",
        });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
    }

    // -------------------------------------------------
    // Doctor
    // -------------------------------------------------

    if (req.user?.role === "doctor") {
      if (req.user.doctorId) {
        filter.doctor = req.user.doctorId;
      }
    }

    // -------------------------------------------------
    // Query filters
    // -------------------------------------------------

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.date) {
      filter.date = normalizeDate(req.query.date);
    }

    if (req.query.doctor) {
      filter.doctor = req.query.doctor;
    }

    if (req.query.patient) {
      filter.patient = req.query.patient;
    }

    // -------------------------------------------------
    // Fetch appointments
    // -------------------------------------------------

    const appointments = await Appointment.find(filter)
      .populate("patient")
      .populate("doctor")
      .sort({
        date: 1,
        time: 1,
        createdAt: 1,
      });

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      count: appointments.length,
      appointments,
      data: appointments,
    });

<<<<<<< HEAD
  } catch (error) {
    console.error("Get all appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
=======
    res
      .status(200)
      .json({
        success: true,
        message: "Appointments fetched successfully",
        count: appointments.length,
        data: appointments,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch appointments",
        error: error.message,
      });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
  }
};

// =====================================================
// Get Appointment By ID
// =====================================================

const getAppointmentById = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment id",
      });
    }
=======
    const appointment = await populateAppointment(
      Appointment.findById(req.params.id),
    );
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });

    // Read access is checked here without requiring the update/delete middleware.
    const role = req.user.role;
    let allowed = role === "admin";
    if (role === "user") {
      const patient = await Patient.findOne({ user: req.user.userId }).select(
        "_id",
      );
      allowed =
        !!patient && String(appointment.patient._id) === String(patient._id);
    } else if (role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user.userId }).select(
        "_id",
      );
      allowed =
        !!doctor && String(appointment.doctor._id) === String(doctor._id);
    }
    if (!allowed)
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not allowed to access this appointment",
        });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1

    const appointment = await Appointment.findById(id)
      .populate("patient")
      .populate("doctor");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment fetched successfully",
      appointment,
      data: appointment,
    });

  } catch (error) {
<<<<<<< HEAD
    console.error("Get appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
      error: error.message,
    });
=======
    if (error.name === "CastError")
      return res
        .status(400)
        .json({ success: false, message: "Invalid appointment id" });
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch appointment",
        error: error.message,
      });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
  }
};

// =====================================================
// Update Appointment
// =====================================================

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

<<<<<<< HEAD
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment id",
      });
    }
=======
    if (!appointment || !access)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1

    const {
      doctor,
      date,
      time,
      appointmentType,
      notes,
      status,
    } = req.body;

<<<<<<< HEAD
    // -------------------------------------------------
    // Find appointment
    // -------------------------------------------------

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const oldStatus = appointment.status;

    // -------------------------------------------------
    // Validate doctor if provided
    // -------------------------------------------------

    if (
      doctor !== undefined &&
      !mongoose.Types.ObjectId.isValid(doctor)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor id",
      });
    }

    // -------------------------------------------------
    // New values
    // -------------------------------------------------

    const newDoctor =
      doctor || appointment.doctor;

    const newDate = date
      ? normalizeDate(date)
      : appointment.date;

    const newTime = time
      ? normalizeTime(time)
      : appointment.time;

    const slotChanged =
      String(newDoctor) !== String(appointment.doctor) ||
      newDate !== appointment.date ||
      !sameTime(newTime, appointment.time);

    // -------------------------------------------------
    // Validate new doctor
    // -------------------------------------------------

    if (doctor !== undefined) {
      const doctorExists = await Doctor.findById(doctor);

      if (!doctorExists) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }
    }

    // -------------------------------------------------
    // Check new slot
    // -------------------------------------------------

    if (
      slotChanged &&
      status !== "Cancelled"
    ) {
      const doctorAppointments =
        await Appointment.find({
          _id: {
            $ne: id,
          },

          doctor: newDoctor,

          date: newDate,

          status: {
            $in: ["Pending", "Confirmed"],
          },

        }).select("time");

      const booked = doctorAppointments.some((item) =>
        sameTime(item.time, newTime)
      );

      if (booked) {
        return res.status(409).json({
          success: false,
          message:
            "The new appointment slot is already booked",
        });
      }

      // -------------------------------------------------
      // Check unique slotKey
      // -------------------------------------------------

      const newSlotKey =
        `${newDoctor}-${newDate}-${newTime}`;

      const existingSlot =
        await Appointment.findOne({
          slotKey: newSlotKey,

          _id: {
            $ne: id,
          },

          status: {
            $in: ["Pending", "Confirmed"],
          },
        });

      if (existingSlot) {
        return res.status(409).json({
          success: false,
          message:
            "The new appointment slot is already booked",
        });
      }
=======
    if (access.isOwnerPatient && !access.isAdmin) {
      if (
        status !== "Cancelled" ||
        date !== undefined ||
        time !== undefined ||
        appointmentType !== undefined
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Patients can only cancel an appointment",
          });
      }
      if (
        appointment.status === "Completed" ||
        appointment.status === "Cancelled"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "This appointment can no longer be cancelled",
          });
      }
    }

    if (!access.isAdmin && !access.isOwnerPatient && !access.isOwnerDoctor) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not allowed to update this appointment",
        });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
    }

    // -------------------------------------------------
    // Update fields
    // -------------------------------------------------

    if (doctor !== undefined) {
      appointment.doctor = doctor;
    }

    if (date !== undefined) {
<<<<<<< HEAD
      appointment.date = normalizeDate(date);
=======
      if (!validDate(date))
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid date format. Use YYYY-MM-DD",
          });
      appointment.date = date;
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
    }

    if (time !== undefined) {
<<<<<<< HEAD
      appointment.time = normalizeTime(time);
    }

    if (appointmentType !== undefined) {
      const allowedAppointmentTypes = [
        "Consultation",
        "Follow-up",
        "Check-up",
      ];

      if (
        !allowedAppointmentTypes.includes(
          appointmentType
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment type",
        });
      }

      appointment.appointmentType =
        appointmentType;
=======
      if (!TIME_RE.test(time))
        return res
          .status(400)
          .json({ success: false, message: "Invalid time format. Use HH:MM" });
      appointment.time = time;
    }
    if (appointmentType !== undefined)
      appointment.appointmentType = appointmentType;
    if (notes !== undefined) appointment.notes = notes;
    if (status !== undefined) appointment.status = status;

    if (
      access.isOwnerDoctor &&
      !access.isAdmin &&
      status &&
      !["Confirmed", "Completed", "Cancelled"].includes(status)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid appointment status" });
    }

    // Only admins can move an appointment to a different slot/date.
    if (!access.isAdmin && (date !== undefined || time !== undefined)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only an admin can reschedule an appointment",
        });
    }

    if (date !== undefined || time !== undefined) {
      const doctor = await Doctor.findById(appointment.doctor);
      if (!doctor || !doctor.isAvailable)
        return res
          .status(400)
          .json({ success: false, message: "Doctor is not available" });
      const { availability } = getAvailability(doctor, appointment.date);
      if (
        !availability ||
        !generateTimes(availability.startTime, availability.endTime).includes(
          appointment.time,
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Selected time is outside the doctor's available slots",
          });
      }

      appointment.slotKey = slotKey(
        appointment.doctor,
        appointment.date,
        appointment.time,
      );
      const conflict = await Appointment.findOne({
        _id: { $ne: appointment._id },
        slotKey: appointment.slotKey,
        status: { $ne: "Cancelled" },
      });
      if (conflict)
        return res
          .status(409)
          .json({
            success: false,
            message: "This appointment slot is already booked",
          });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
    }

    if (notes !== undefined) {
      appointment.notes = notes;
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment status",
        });
      }

      appointment.status = status;
    }

    // -------------------------------------------------
    // Update slot key
    // -------------------------------------------------

    if (appointment.status === "Cancelled") {

      // Free the slot completely
      appointment.slotKey = undefined;

    } else {

      appointment.slotKey =
        `${appointment.doctor}-${appointment.date}-${appointment.time}`;

    }

    // -------------------------------------------------
    // Queue number
    // -------------------------------------------------

    if (
      slotChanged &&
      appointment.status !== "Cancelled"
    ) {
      const lastAppointment =
        await Appointment.findOne({
          _id: {
            $ne: id,
          },

          doctor: appointment.doctor,

          date: appointment.date,

          status: {
            $in: ["Pending", "Confirmed"],
          },

        }).sort({
          queueNumber: -1,
        });

      appointment.queueNumber =
        lastAppointment?.queueNumber
          ? lastAppointment.queueNumber + 1
          : 1;
    }

    // -------------------------------------------------
    // Save
    // -------------------------------------------------

    await appointment.save();
<<<<<<< HEAD

    // -------------------------------------------------
    // Populate
    // -------------------------------------------------

    const updatedAppointment =
      await Appointment.findById(id)
        .populate("patient")
        .populate("doctor");

    // =================================================
    // Appointment Cancelled Notification
    // =================================================

    if (
      status === "Cancelled" &&
      oldStatus !== "Cancelled" &&
      updatedAppointment?.patient
    ) {
      const patientUserId =
        updatedAppointment.patient.user;

      const doctorName =
        getDoctorDisplayName(
          updatedAppointment.doctor
        );

      await sendNotification({
        recipient: patientUserId,
        sender: null,
        type: "appointment",
        title: "Appointment cancelled",
        message:
          `Your appointment with Dr. ${doctorName} ` +
          `on ${updatedAppointment.date} ` +
          `at ${updatedAppointment.time} ` +
          `has been cancelled.`,
        relatedAppointment:
          updatedAppointment._id,
      });
    }

    // =================================================
    // Appointment Confirmed Notification
    // =================================================

    if (
      status === "Confirmed" &&
      oldStatus !== "Confirmed" &&
      updatedAppointment?.patient
    ) {
      const patientUserId =
        updatedAppointment.patient.user;

      const doctorName =
        getDoctorDisplayName(
          updatedAppointment.doctor
        );

      await sendNotification({
        recipient: patientUserId,
        sender: null,
        type: "appointment",
        title: "Appointment confirmed",
        message:
          `Your appointment with Dr. ${doctorName} ` +
          `on ${updatedAppointment.date} ` +
          `at ${updatedAppointment.time} ` +
          `has been confirmed.`,
        relatedAppointment:
          updatedAppointment._id,
      });
    }

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      appointment: updatedAppointment,
      data: updatedAppointment,
    });

  } catch (error) {
    console.error("Update appointment error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "The appointment slot is already booked",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update appointment",
      error: error.message,
    });
=======
    await reorderQueueNumbers(oldDoctor, oldDate);
    if (appointment.status !== "Cancelled")
      await reorderQueueNumbers(appointment.doctor, appointment.date);

    const updated = await populateAppointment(
      Appointment.findById(appointment._id),
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Appointment updated successfully",
        data: updated,
      });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({
          success: false,
          message: "This appointment slot is already booked",
        });
    if (error.name === "ValidationError")
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation failed",
          error: error.message,
        });
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update appointment",
        error: error.message,
      });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
  }
};

// =====================================================
// Delete Appointment
// =====================================================

const deleteAppointment = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment id",
      });
    }
=======
    if (req.user.role !== "admin")
      return res
        .status(403)
        .json({
          success: false,
          message: "Only admins can delete appointments",
        });

    const appointment = req.appointment;
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1

    const appointment =
      await Appointment.findById(id)
        .populate("patient")
        .populate("doctor");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    await Appointment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });

<<<<<<< HEAD
  } catch (error) {
    console.error("Delete appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
      error: error.message,
    });
=======
    res
      .status(200)
      .json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete appointment",
        error: error.message,
      });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
  }
};

// =====================================================
// Get Available Slots
// =====================================================

const getAvailableSlots = async (req, res) => {
  try {
    const { doctor, date } = req.query;

    // -------------------------------------------------
    // Basic validation
    // -------------------------------------------------

    if (!doctor || !date) {
      return res.status(400).json({
        success: false,
        message: "doctor and date are required",
        slots: [],
        availableSlots: [],
        availableTimes: [],
        data: {
          availableTimes: [],
        },
      });
    }

    // -------------------------------------------------
    // Validate doctor
    // -------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(doctor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor id",
        slots: [],
        availableSlots: [],
        availableTimes: [],
        data: {
          availableTimes: [],
        },
      });
    }

    // -------------------------------------------------
    // Make sure doctor exists
    // -------------------------------------------------

    const doctorExists =
      await Doctor.findById(doctor);

    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
        slots: [],
        availableSlots: [],
        availableTimes: [],
        data: {
          availableTimes: [],
        },
      });
    }

    const normalizedDate =
      normalizeDate(date);

    // =================================================
    // SAME HOSPITAL WORKING SLOTS
    // =================================================

    const allSlots = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
    ];

    // -------------------------------------------------
    // Get booked appointments
    // -------------------------------------------------

    const appointments =
      await Appointment.find({
        doctor,
        date: normalizedDate,
        status: {
          $in: ["Pending", "Confirmed"],
        },
      }).select("time");

    // -------------------------------------------------
    // Normalize booked times
    // -------------------------------------------------

    const bookedTimes = appointments.map(
      (appointment) =>
        normalizeTime(appointment.time)
    );

    // -------------------------------------------------
    // Get available times
    // -------------------------------------------------

    const availableTimes =
      allSlots.filter(
        (slot) =>
          !bookedTimes.some((booked) =>
            sameTime(booked, slot)
          )
      );

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      doctor,
      date: normalizedDate,

      slots: availableTimes,
      availableSlots: availableTimes,
      availableTimes,

      data: {
        availableTimes,
      },

      count: availableTimes.length,
    });

  } catch (error) {
    console.error(
      "Get available slots error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch available slots",

      slots: [],
      availableSlots: [],
      availableTimes: [],

      data: {
        availableTimes: [],
      },

      error: error.message,
    });
  }
};

// =====================================================
// Get Appointments Count
// =====================================================

const getAppointmentsCount = async (req, res) => {
  try {
    const filter = {};
<<<<<<< HEAD

    // -------------------------------------------------
    // Doctor
    // -------------------------------------------------

    if (
      req.user?.role === "doctor" &&
      req.user.doctorId
    ) {
      filter.doctor = req.user.doctorId;
=======
    if (req.query.status) {
      if (
        !["Pending", "Confirmed", "Completed", "Cancelled"].includes(
          req.query.status,
        )
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status" });
      }
      filter.status = req.query.status;
    }
    if (req.query.date === "today") {
      const now = new Date();
      filter.date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    } else if (req.query.date) {
      if (!validDate(req.query.date))
        return res
          .status(400)
          .json({ success: false, message: "Invalid date" });
      filter.date = req.query.date;
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
    }

    // -------------------------------------------------
    // Status
    // -------------------------------------------------

    if (req.query.status) {
      filter.status = req.query.status;
    }

    // -------------------------------------------------
    // Date
    // -------------------------------------------------

    if (req.query.date) {
      filter.date = normalizeDate(
        req.query.date
      );
    }

    // -------------------------------------------------
    // Count
    // -------------------------------------------------

    const count =
      await Appointment.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count,
    });

  } catch (error) {
<<<<<<< HEAD
    console.error(
      "Get appointments count error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get appointments count",
      error: error.message,
    });
=======
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
  }
};

// =====================================================
// Exports
// =====================================================

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
  getAppointmentsCount,
};