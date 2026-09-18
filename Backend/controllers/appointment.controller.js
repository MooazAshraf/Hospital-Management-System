const appointmentModel = require("../models/appointment.model");
const patientModel = require("../models/patient.model");
const doctorModel = require("../models/doctors.model");
const notificationModel = require("../models/notifications.models");

// =====================================================
// Helpers
// =====================================================

const generateSlotKey = (doctorId, date, time) => {
  return `${doctorId}_${date}_${time}`;
};

const generateQueueNumber = async (doctorId, date) => {
  const count = await appointmentModel.countDocuments({
    doctor: doctorId,
    date,
    status: {
      $ne: "Cancelled",
    },
  });

  return count + 1;
};

// =====================================================
// Get Available Slots
// GET /api/appointments/available-slots
// =====================================================

const getAvailableSlots = async (req, res) => {
  try {
    const { doctor, date } = req.query;

    if (!doctor || !date) {
      return res.status(400).json({
        success: false,
        message: "Doctor and date are required",
      });
    }

    // Validate date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Find doctor
    const doctorData =
      await doctorModel.findById(doctor);

    if (!doctorData) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Doctor unavailable
    if (!doctorData.isAvailable) {
      return res.status(200).json({
        success: true,
        data: {
          doctor,
          date,
          day: null,
          startTime: null,
          endTime: null,
          bookedTimes: [],
          availableTimes: [],
        },
      });
    }

    // Convert date to day name
    const selectedDate = new Date(
      `${date}T00:00:00`
    );

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayName =
      dayNames[selectedDate.getDay()];

    // Find availability for selected day
    const availability =
      doctorData.availability?.find(
        (item) => item.day === dayName
      );

    // Doctor doesn't work on selected day
    if (!availability) {
      return res.status(200).json({
        success: true,
        data: {
          doctor,
          date,
          day: dayName,
          startTime: null,
          endTime: null,
          bookedTimes: [],
          availableTimes: [],
        },
      });
    }

    const start = availability.startTime;
    const end = availability.endTime;

    // Generate slots every 30 minutes
    const generateTimes = (
      startTime,
      endTime
    ) => {
      const result = [];

      const [startHour, startMinute] =
        startTime.split(":").map(Number);

      const [endHour, endMinute] =
        endTime.split(":").map(Number);

      let current =
        startHour * 60 + startMinute;

      const endMinutes =
        endHour * 60 + endMinute;

      while (current < endMinutes) {
        const hour =
          Math.floor(current / 60);

        const minute =
          current % 60;

        result.push(
          `${String(hour).padStart(2, "0")}:${String(
            minute
          ).padStart(2, "0")}`
        );

        current += 30;
      }

      return result;
    };

    const allTimes = generateTimes(
      start,
      end
    );

    // Get booked appointments
    const appointments =
      await appointmentModel.find({
        doctor,
        date,
        status: {
          $ne: "Cancelled",
        },
      });

    const bookedTimes =
      appointments.map(
        (appointment) => appointment.time
      );

    // Remove booked times
    const availableTimes =
      allTimes.filter(
        (time) =>
          !bookedTimes.includes(time)
      );

    return res.status(200).json({
      success: true,
      data: {
        doctor,
        date,
        day: dayName,
        startTime: start,
        endTime: end,
        bookedTimes,
        availableTimes,
      },
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
      error: error.message,
    });
  }
};

// =====================================================
// Create Appointment
// POST /api/appointments
// =====================================================

const createAppointment = async (req, res) => {
  try {
    const {
      doctor,
      date,
      time,
      appointmentType,
      notes,
    } = req.body;

    if (
      !doctor ||
      !date ||
      !time ||
      !appointmentType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor, date, time and appointment type are required",
      });
    }

    const doctorData =
      await doctorModel.findById(doctor);

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

    // Authentication is required here
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication is required to book an appointment",
      });
    }

    const patient =
      await patientModel.findOne({
        user: req.user.userId,
      });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message:
          "Patient profile not found",
      });
    }

    // Prevent duplicate active booking
    const slotKey =
      generateSlotKey(
        doctor,
        date,
        time
      );

    const existing =
      await appointmentModel.findOne({
        slotKey,
        status: {
          $ne: "Cancelled",
        },
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "This appointment slot has already been booked",
      });
    }

    // Prevent same patient booking same time
    const patientExisting =
      await appointmentModel.findOne({
        patient: patient._id,
        date,
        time,
        status: {
          $ne: "Cancelled",
        },
      });

    if (patientExisting) {
      return res.status(409).json({
        success: false,
        message:
          "You already have an appointment at this time",
      });
    }

    const queueNumber =
      await generateQueueNumber(
        doctor,
        date
      );

    let appointment;

    try {
      appointment =
        await appointmentModel.create({
          patient: patient._id,
          doctor,
          date,
          time,
          appointmentType,
          notes,
          status: "Pending",
          queueNumber,
          slotKey,
        });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "This appointment slot has already been booked",
        });
      }

      throw error;
    }

    const populatedAppointment =
      await appointmentModel
        .findById(appointment._id)
        .populate({
          path: "doctor",
          populate: {
            path: "user",
            select: "name email role",
          },
        })
        .populate({
          path: "patient",
          populate: {
            path: "user",
            select: "name email",
          },
        });

    // Patient notification
    await notificationModel.create({
      recipient: req.user.userId,
      sender: null,
      type: "appointment",
      title: "Appointment booked",
      message: `Your appointment with Dr. ${doctorData.name} on ${date} at ${time} has been booked successfully.`,
      relatedAppointment:
        appointment._id,
    });

    // Doctor notification
    await notificationModel.create({
      recipient: doctorData.user,
      sender: req.user.userId,
      type: "appointment",
      title: "New appointment",
      message: `You have a new appointment on ${date} at ${time}.`,
      relatedAppointment:
        appointment._id,
    });

    return res.status(201).json({
      success: true,
      message:
        "Appointment created successfully",
      data: populatedAppointment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to create appointment",
      error: error.message,
    });
  }
};

// =====================================================
// Get All Appointments
// GET /api/appointments
// =====================================================

const getAllAppointments = async (req, res) => {
  try {
    const role = req.user.role;

    let filter = {};

    if (role === "doctor") {
      const doctor =
        await doctorModel.findOne({
          user: req.user.userId,
        });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message:
            "Doctor profile not found",
        });
      }

      filter.doctor = doctor._id;
    } else if (role === "patient") {
      const patient =
        await patientModel.findOne({
          user: req.user.userId,
        });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message:
            "Patient profile not found",
        });
      }

      filter.patient = patient._id;
    }

    const appointments =
      await appointmentModel
        .find(filter)
        .populate({
          path: "doctor",
          populate: {
            path: "user",
            select: "name email role",
          },
        })
        .populate({
          path: "patient",
          populate: {
            path: "user",
            select: "name email",
          },
        })
        .sort({
          date: 1,
          time: 1,
        });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch appointments",
    });
  }
};

// =====================================================
// Get Appointment By ID
// =====================================================

const getAppointmentById = async (
  req,
  res
) => {
  try {
    const appointment =
      await appointmentModel
        .findById(req.params.id)
        .populate({
          path: "doctor",
          populate: {
            path: "user",
            select: "name email role",
          },
        })
        .populate({
          path: "patient",
          populate: {
            path: "user",
            select: "name email",
          },
        });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch appointment",
    });
  }
};

// =====================================================
// Update Appointment
// =====================================================

const updateAppointment = async (
  req,
  res
) => {
  try {
    const appointment =
      req.appointment;

    const {
      date,
      time,
      appointmentType,
      notes,
      status,
    } = req.body;

    const access =
      req.appointmentAccess;

    // Patient can only cancel
    if (
      access.isOwnerPatient &&
      !access.isAdmin
    ) {
      if (
        status &&
        status !== "Cancelled"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Patient can only cancel the appointment",
        });
      }
    }

    if (date !== undefined) {
      appointment.date = date;
    }

    if (time !== undefined) {
      appointment.time = time;
    }

    if (
      appointmentType !== undefined
    ) {
      appointment.appointmentType =
        appointmentType;
    }

    if (notes !== undefined) {
      appointment.notes = notes;
    }

    if (status !== undefined) {
      appointment.status = status;
    }

    if (
      date !== undefined ||
      time !== undefined
    ) {
      appointment.slotKey =
        generateSlotKey(
          appointment.doctor,
          appointment.date,
          appointment.time
        );
    }

    await appointment.save();

    const updated =
      await appointmentModel
        .findById(appointment._id)
        .populate({
          path: "doctor",
          populate: {
            path: "user",
            select: "name email role",
          },
        })
        .populate({
          path: "patient",
          populate: {
            path: "user",
            select: "name email",
          },
        });

    return res.status(200).json({
      success: true,
      message:
        "Appointment updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This appointment slot is already booked",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update appointment",
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
    const appointment =
      await appointmentModel.findByIdAndDelete(
        req.params.id
      );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Appointment deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete appointment",
    });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
};  