const express = require("express");

const { authenticate } = require("../middlewares/isLogged");
const { authorize } = require("../middlewares/authorize");
const { checkAppointmentAccess } = require("../middlewares/appointmentAccess");

const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
  getAppointmentsCount,
} = require("../controllers/appointment.controller");

const router = express.Router();

// Available appointment slots
router.get(
  "/available-slots",
  getAvailableSlots
);

// Appointments count
router.get(
  "/count",
  authenticate,
  authorize("admin", "doctor"),
  getAppointmentsCount
);

// Get all appointments
router.get(
  "/",
  authenticate,
  getAllAppointments
);

// Create appointment
router.post(
  "/",
  authenticate,
  authorize("user"),
  createAppointment
);

// Get appointment by ID
router.get(
  "/:id",
  authenticate,
  getAppointmentById
);

// Update appointment
router.put(
  "/:id",
  authenticate,
  checkAppointmentAccess,
  updateAppointment
);

// Delete appointment
router.delete(
  "/:id",
  authenticate,
  checkAppointmentAccess,
  authorize("admin"),
  deleteAppointment
);

module.exports = router;