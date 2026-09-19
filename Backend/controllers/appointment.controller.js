const mongoose = require("mongoose");

const User = require("../models/users.model");
const Patient = require("../models/patient.model");
const Doctor = require("../models/doctors.model");
const Appointment = require("../models/appointment.model");
const Notification = require("../models/notifications.models");

// =====================================================
// Constants
// =====================================================

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

// =====================================================
// Helpers
// =====================================================

const normalizeDate = (date) => {
  if (!date) return null;

  const value = String(date).trim();

  if (DATE_RE.test(value)) {
    return value;
  }

  // Support DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }

  return value;
};

// FIX: validate YYYY-MM-DD without timezone problems
const validDate = (value) => {
  const dateValue = String(value || "").trim();

  if (!DATE_RE.test(dateValue)) {
    return false;
  }

  const [year, month, day] = dateValue.split("-").map(Number);

  const d = new Date(year, month - 1, day);

  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
};

const normalizeTime = (time) => {
  if (!time) return null;

  const value = String(time).trim();

  if (!TIME_RE.test(value)) {
    return null;
  }

  return value;
};

const generateTimes = (startTime, endTime) => {
  const result = [];

  if (!startTime || !endTime) {
    return result;
  }

  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);

  let current = sh * 60 + sm;
  const end = eh * 60 + em;

  while (current < end) {
    result.push(
      `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(
        current % 60
      ).padStart(2, "0")}`
    );

    current += 30;
  }

  return result;
};

const getAvailability = (doctor, date) => {
  const [year, month, day] = String(date).split("-").map(Number);

  const dateObject = new Date(year, month - 1, day);

  const dayName = DAY_NAMES[dateObject.getDay()];

  const availability = (doctor.availability || []).find(
    (item) => item.day === dayName
  );

  return {
    day: dayName,
    availability,
  };
};

const sameTime = (time1, time2) => {
  return normalizeTime(time1) === normalizeTime(time2);
};

const createSlotKey = (doctor, date, time) => {
  return `${String(doctor)}-${date}-${time}`;
};

const getDoctorDisplayName = (doctor) => {
  return doctor?.name || "Doctor";
};

const populateAppointment = (query) => {
  return query
    .populate("patient")
    .populate("doctor");
};

// =====================================================
// Queue Helper
// =====================================================

const reorderQueueNumbers = async (doctorId, date) => {
  if (!doctorId || !date) return;

  const appointments = await Appointment.find({
    doctor: doctorId,
    date,
    status: {
      $in: ["Pending", "Confirmed"],
    },
  }).sort({
    time: 1,
    createdAt: 1,
  });

  for (let index = 0; index < appointments.length; index++) {
    const queueNumber = index + 1;

    if (appointments[index].queueNumber !== queueNumber) {
      appointments[index].queueNumber = queueNumber;
      await appointments[index].save();
    }
  }
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
    if (!recipient) return;

    await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedAppointment,
    });
  } catch (error) {
    console.error(
      "Notification error:",
      error.message
    );
  }
};

const createAppointmentNotification = async (
  appointment,
  doctorName,
  patientUserId,
  doctorUserId
) => {
  try {
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
  } catch (error) {
    console.error(
      "Appointment notification error:",
      error.message
    );
  }
};

// =====================================================
// Get / Create Patient For Logged-in User
// =====================================================

const getPatientForUser = async (userId) => {
  if (!userId) {
    return null;
  }

  let patientProfile = await Patient.findOne({
    user: userId,
  });

  if (patientProfile) {
    return patientProfile;
  }

  const user = await User.findById(userId).select(
    "name email phone role"
  );

  if (!user) {
    return null;
  }

  if (user.role !== "user") {
    return null;
  }

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
    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only patient accounts can book appointments",
      });
    }

    const {
      doctor,
      date,
      time,
      appointmentType,
      notes,
    } = req.body;

    if (!doctor || !date || !time || !appointmentType) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor, date, time and appointment type are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor id",
      });
    }

    const normalizedDate = normalizeDate(date);

    if (!validDate(normalizedDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const normalizedTime = normalizeTime(time);

    if (!normalizedTime) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format. Use HH:MM",
      });
    }

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

    let patient = await Patient.findOne({
      user: req.user.userId,
    });

    if (!patient) {
      const account = await User.findById(
        req.user.userId
      ).select("name email phone");

      if (!account) {
        return res.status(404).json({
          success: false,
          message: "User account not found",
        });
      }

      patient = await Patient.create({
        user: account._id,
        name: String(
          req.body.patientName || account.name
        ).trim(),
        email: String(
          req.body.email || account.email
        )
          .trim()
          .toLowerCase(),
        phone: String(
          req.body.phone || account.phone
        ).trim(),
      });
    }

    const doctorData = await Doctor.findById(doctor);

    if (!doctorData) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!doctorData.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available",
      });
    }

    const { availability } = getAvailability(
      doctorData,
      normalizedDate
    );

    if (!availability) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor does not work on this day",
      });
    }

    const validTimes = generateTimes(
      availability.startTime,
      availability.endTime
    );

    if (!validTimes.includes(normalizedTime)) {
      return res.status(400).json({
        success: false,
        message:
          "Selected time is outside the doctor's available slots",
      });
    }

    const patientConflict = await Appointment.findOne({
      patient: patient._id,
      date: normalizedDate,
      time: normalizedTime,
      status: {
        $ne: "Cancelled",
      },
    });

    if (patientConflict) {
      return res.status(409).json({
        success: false,
        message:
          "You already have an appointment at this time",
      });
    }

    const appointmentSlotKey = createSlotKey(
      doctor,
      normalizedDate,
      normalizedTime
    );

    const conflict = await Appointment.findOne({
      slotKey: appointmentSlotKey,
      status: {
        $ne: "Cancelled",
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message:
          "This appointment slot has already been booked",
      });
    }

    const lastAppointment =
      await Appointment.findOne({
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

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor,
      date: normalizedDate,
      time: normalizedTime,
      appointmentType,
      notes: notes || "",
      status: "Pending",
      queueNumber,
      slotKey: appointmentSlotKey,
    });

    const populatedAppointment =
      await populateAppointment(
        Appointment.findById(appointment._id)
      );

    await createAppointmentNotification(
      appointment,
      getDoctorDisplayName(doctorData),
      req.user.userId,
      doctorData.user
    );

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment: populatedAppointment,
      data: populatedAppointment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This appointment slot has already been booked",
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
        message: "Invalid doctor id",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create appointment",
      error: error.message,
    });
  }
};

// =====================================================
// Get All Appointments
// =====================================================

const getAllAppointments = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({
        user: req.user.userId,
      }).select("_id");

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }

      filter.doctor = doctor._id;
    } else if (req.user.role === "user") {
      const patient = await Patient.findOne({
        user: req.user.userId,
      }).select("_id");

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }

      filter.patient = patient._id;
    } else if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "You don't have permission to view appointments",
      });
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.date) {
      const normalizedDate =
        normalizeDate(req.query.date);

      if (!validDate(normalizedDate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date",
        });
      }

      filter.date = normalizedDate;
    }

    if (req.query.doctor) {
      filter.doctor = req.query.doctor;
    }

    if (req.query.patient) {
      filter.patient = req.query.patient;
    }

    const appointments =
      await Appointment.find(filter)
        .populate("patient")
        .populate("doctor")
        .sort({
          date: 1,
          time: 1,
          createdAt: 1,
        });

    return res.status(200).json({
      success: true,
      message:
        "Appointments fetched successfully",
      count: appointments.length,
      appointments,
      data: appointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch appointments",
      error: error.message,
    });
  }
};

// =====================================================
// Get Appointment By ID
// =====================================================

const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment id",
      });
    }

    const appointment =
      await populateAppointment(
        Appointment.findById(id)
      );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const role = req.user.role;

    let allowed = role === "admin";

    if (role === "user") {
      const patient = await Patient.findOne({
        user: req.user.userId,
      }).select("_id");

      allowed =
        !!patient &&
        appointment.patient &&
        String(appointment.patient._id) ===
          String(patient._id);
    } else if (role === "doctor") {
      const doctor = await Doctor.findOne({
        user: req.user.userId,
      }).select("_id");

      allowed =
        !!doctor &&
        appointment.doctor &&
        String(appointment.doctor._id) ===
          String(doctor._id);
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to access this appointment",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Appointment fetched successfully",
      appointment,
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch appointment",
      error: error.message,
    });
  }
};

// =====================================================
// Update Appointment
// =====================================================

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment id",
      });
    }

    let appointment = req.appointment;

    if (!appointment) {
      appointment =
        await populateAppointment(
          Appointment.findById(id)
        );
    }

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const isAdmin = req.user.role === "admin";

    let isOwnerPatient = false;
    let isOwnerDoctor = false;

    if (req.user.role === "user") {
      const patient = await Patient.findOne({
        user: req.user.userId,
      }).select("_id");

      isOwnerPatient =
        !!patient &&
        String(
          appointment.patient?._id ||
            appointment.patient
        ) === String(patient._id);
    }

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({
        user: req.user.userId,
      }).select("_id");

      isOwnerDoctor =
        !!doctor &&
        String(
          appointment.doctor?._id ||
            appointment.doctor
        ) === String(doctor._id);
    }

    const access = req.appointmentAccess || {};

    const finalIsOwnerPatient =
      access.isOwnerPatient ?? isOwnerPatient;

    const finalIsOwnerDoctor =
      access.isOwnerDoctor ?? isOwnerDoctor;

    const finalIsAdmin =
      access.isAdmin ?? isAdmin;

    if (
      !finalIsAdmin &&
      !finalIsOwnerPatient &&
      !finalIsOwnerDoctor
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to update this appointment",
      });
    }

    const {
      doctor,
      date,
      time,
      appointmentType,
      notes,
      status,
    } = req.body;

    if (
      finalIsOwnerPatient &&
      !finalIsAdmin
    ) {
      if (
        status !== "Cancelled" ||
        date !== undefined ||
        time !== undefined ||
        doctor !== undefined ||
        appointmentType !== undefined
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Patients can only cancel an appointment",
        });
      }

      if (
        appointment.status === "Completed" ||
        appointment.status === "Cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This appointment can no longer be cancelled",
        });
      }
    }

    const oldDoctor =
      appointment.doctor?._id
        ? appointment.doctor._id
        : appointment.doctor;

    const oldDate = appointment.date;
    const oldTime = appointment.time;

    if (
      !finalIsAdmin &&
      (
        doctor !== undefined ||
        date !== undefined ||
        time !== undefined
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only an admin can reschedule an appointment",
      });
    }

    if (doctor !== undefined) {
      if (
        !mongoose.Types.ObjectId.isValid(doctor)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor id",
        });
      }

      const doctorExists =
        await Doctor.findById(doctor);

      if (!doctorExists) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      appointment.doctor = doctor;
    }

    if (date !== undefined) {
      const normalizedDate =
        normalizeDate(date);

      if (!validDate(normalizedDate)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid date format. Use YYYY-MM-DD",
        });
      }

      appointment.date = normalizedDate;
    }

    if (time !== undefined) {
      const normalizedTime =
        normalizeTime(time);

      if (!normalizedTime) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid time format. Use HH:MM",
        });
      }

      appointment.time = normalizedTime;
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
          message:
            "Invalid appointment type. Allowed values are Consultation, Follow-up, Check-up",
        });
      }

      appointment.appointmentType =
        appointmentType;
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
          message:
            "Invalid appointment status",
        });
      }

      if (
        finalIsOwnerDoctor &&
        !finalIsAdmin &&
        ![
          "Confirmed",
          "Completed",
          "Cancelled",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid appointment status",
        });
      }

      appointment.status = status;
    }

    const slotChanged =
      String(oldDoctor) !==
        String(
          appointment.doctor?._id ||
            appointment.doctor
        ) ||
      oldDate !== appointment.date ||
      oldTime !== appointment.time;

    if (slotChanged) {
      const doctorProfile =
        await Doctor.findById(
          appointment.doctor
        );

      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      if (!doctorProfile.isAvailable) {
        return res.status(400).json({
          success: false,
          message:
            "Doctor is not available",
        });
      }

      const { availability } =
        getAvailability(
          doctorProfile,
          appointment.date
        );

      if (!availability) {
        return res.status(400).json({
          success: false,
          message:
            "Doctor does not work on this day",
        });
      }

      const validTimes =
        generateTimes(
          availability.startTime,
          availability.endTime
        );

      if (
        !validTimes.includes(
          normalizeTime(
            appointment.time
          )
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Selected time is outside the doctor's available slots",
        });
      }

      const newSlotKey =
        createSlotKey(
          appointment.doctor,
          appointment.date,
          appointment.time
        );

      const conflict =
        await Appointment.findOne({
          _id: {
            $ne: appointment._id,
          },
          slotKey: newSlotKey,
          status: {
            $ne: "Cancelled",
          },
        });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message:
            "This appointment slot is already booked",
        });
      }

      appointment.slotKey =
        newSlotKey;
    }

    if (
      appointment.status ===
      "Cancelled"
    ) {
      appointment.slotKey =
        undefined;
    } else {
      appointment.slotKey =
        createSlotKey(
          appointment.doctor,
          appointment.date,
          appointment.time
        );
    }

    if (
      slotChanged &&
      appointment.status !==
        "Cancelled"
    ) {
      const lastAppointment =
        await Appointment.findOne({
          _id: {
            $ne: appointment._id,
          },
          doctor: appointment.doctor,
          date: appointment.date,
          status: {
            $in: [
              "Pending",
              "Confirmed",
            ],
          },
        }).sort({
          queueNumber: -1,
        });

      appointment.queueNumber =
        lastAppointment?.queueNumber
          ? lastAppointment.queueNumber + 1
          : 1;
    }

    await appointment.save();

    if (
      slotChanged &&
      oldDoctor &&
      oldDate
    ) {
      await reorderQueueNumbers(
        oldDoctor,
        oldDate
      );
    }

    if (
      appointment.status !==
      "Cancelled"
    ) {
      await reorderQueueNumbers(
        appointment.doctor,
        appointment.date
      );
    }

    const updated =
      await populateAppointment(
        Appointment.findById(
          appointment._id
        )
      );

    return res.status(200).json({
      success: true,
      message:
        "Appointment updated successfully",
      appointment: updated,
      data: updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This appointment slot is already booked",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message:
          "Validation failed",
        error: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid appointment id",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update appointment",
      error: error.message,
    });
  }
};

// =====================================================
// Delete Appointment
// =====================================================

const deleteAppointment = async (
  req,
  res
) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Only admins can delete appointments",
      });
    }

    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid appointment id",
      });
    }

    const appointment =
      await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found",
      });
    }

    const doctorId =
      appointment.doctor;

    const date =
      appointment.date;

    await Appointment.findByIdAndDelete(
      id
    );

    await reorderQueueNumbers(
      doctorId,
      date
    );

    return res.status(200).json({
      success: true,
      message:
        "Appointment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to delete appointment",
      error: error.message,
    });
  }
};

// =====================================================
// Get Available Slots
// =====================================================

const getAvailableSlots = async (
  req,
  res
) => {
  try {
    const { doctor, date } =
      req.query;

    if (!doctor || !date) {
      return res.status(400).json({
        success: false,
        message:
          "doctor and date are required",
        slots: [],
        availableSlots: [],
        availableTimes: [],
        data: {
          availableTimes: [],
        },
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        doctor
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid doctor id",
        slots: [],
        availableSlots: [],
        availableTimes: [],
        data: {
          availableTimes: [],
        },
      });
    }

    // Validate date
    const normalizedDate =
      normalizeDate(date);

    if (!validDate(normalizedDate)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid date format. Use YYYY-MM-DD",
        slots: [],
        availableSlots: [],
        availableTimes: [],
        data: {
          availableTimes: [],
        },
      });
    }

    const doctorExists =
      await Doctor.findById(
        doctor
      );

    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message:
          "Doctor not found",
        slots: [],
        availableSlots: [],
        availableTimes: [],
        data: {
          availableTimes: [],
        },
      });
    }

    if (!doctorExists.isAvailable) {
      return res.status(200).json({
        success: true,
        doctor,
        date: normalizedDate,
        slots: [],
        availableSlots: [],
        availableTimes: [],
        data: {
          availableTimes: [],
        },
        count: 0,
      });
    }

    const { availability } =
      getAvailability(
        doctorExists,
        normalizedDate
      );

    if (!availability) {
      return res.status(200).json({
        success: true,
        doctor,
        date: normalizedDate,
        slots: [],
        availableSlots: [],
        availableTimes: [],
        data: {
          availableTimes: [],
        },
        count: 0,
      });
    }

    const allSlots =
      generateTimes(
        availability.startTime,
        availability.endTime
      );

    const appointments =
      await Appointment.find({
        doctor,
        date: normalizedDate,
        status: {
          $in: [
            "Pending",
            "Confirmed",
          ],
        },
      }).select("time");

    const bookedTimes =
      appointments.map(
        (appointment) =>
          normalizeTime(
            appointment.time
          )
      );

    const availableTimes =
      allSlots.filter(
        (slot) =>
          !bookedTimes.some(
            (booked) =>
              sameTime(
                booked,
                slot
              )
          )
      );

    return res.status(200).json({
      success: true,
      doctor,
      date: normalizedDate,
      slots: availableTimes,
      availableSlots:
        availableTimes,
      availableTimes,
      data: {
        availableTimes,
      },
      count:
        availableTimes.length,
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

const getAppointmentsCount = async (
  req,
  res
) => {
  try {
    const filter = {};

    if (req.query.status) {
      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled",
      ];

      if (
        !allowedStatuses.includes(
          req.query.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status",
        });
      }

      filter.status =
        req.query.status;
    }

    if (
      req.query.date === "today"
    ) {
      const now = new Date();

      const today =
        `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-${String(
          now.getDate()
        ).padStart(2, "0")}`;

      filter.date = today;
    } else if (req.query.date) {
      const normalizedDate =
        normalizeDate(
          req.query.date
        );

      if (
        !validDate(
          normalizedDate
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid date",
        });
      }

      filter.date =
        normalizedDate;
    }

    const count =
      await Appointment.countDocuments(
        filter
      );

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Server error",
      error: error.message,
    });
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