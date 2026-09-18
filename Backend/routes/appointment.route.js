const express = require("express");

const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
} = require("../controllers/appointment.controller");

const router = express.Router();

// =====================================================
// Available Slots
// GET /api/appointments/available-slots
// Public - no authentication
// =====================================================

router.get(
  "/available-slots",
  getAvailableSlots
);

// =====================================================
// Get All Appointments
// =====================================================

router.get(
  "/",
  getAllAppointments
);

// =====================================================
// Create Appointment
// =====================================================

router.post(
  "/",
  createAppointment
);

// =====================================================
// Get Appointment By ID
// =====================================================

router.get(
  "/:id",
  getAppointmentById
);

// =====================================================
// Update Appointment
// =====================================================

router.put(
  "/:id",
  updateAppointment
);

// =====================================================
// Delete Appointment
// =====================================================

router.delete(
  "/:id",
  deleteAppointment
);

module.exports = router;