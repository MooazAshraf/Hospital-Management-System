const express = require("express");
const { authenticate } = require("../middlewares/isLogged");
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

// Available Slots
// GET /api/appointments/available-slots
// Public - no authentication
router.get("/available-slots", getAvailableSlots);

// Get All Appointments
// GET /api/appointments/
router.get("/", authenticate, getAllAppointments);

// Get Appointments Count
// GET /api/appointments/count
router.get("/count", getAppointmentsCount);

// Create Appointment
// POST /api/appointments/
router.post("/", authenticate, createAppointment);

// Get Appointment By ID
// GET /api/appointments/:id
router.get("/:id", getAppointmentById);

// Update Appointment
// PUT /api/appointments/:id
router.put("/:id", updateAppointment);

// Delete Appointment
// DELETE /api/appointments/:id
router.delete("/:id", deleteAppointment);

module.exports = router;
