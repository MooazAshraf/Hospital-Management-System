const express = require("express");

const router = express.Router();

const { authenticate } = require("../middlewares/isLogged");

const { authorize } = require("../middlewares/authorize");

const { checkAppointmentAccess } = require("../middlewares/appointmentAccess");

const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointment.controller");

// All appointment routes require a logged-in user
router.use(authenticate);

// Create and get all appointments
router.route("/").get(getAllAppointments).post(createAppointment);

// Get, update and delete appointment by ID
router
  .route("/:id")
  .get(checkAppointmentAccess, getAppointmentById)
  .put(checkAppointmentAccess, updateAppointment)
  .delete(authorize("doctor", "admin"), deleteAppointment);

module.exports = router;
