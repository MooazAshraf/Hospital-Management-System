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

router.get("/available-slots", getAvailableSlots);
router.get("/count", authenticate, authorize("admin", "doctor"), getAppointmentsCount);
router.get("/", authenticate, getAllAppointments);
router.post("/", authenticate, authorize("user"), createAppointment);
router.get("/:id", authenticate, getAppointmentById);
router.put("/:id", authenticate, checkAppointmentAccess, updateAppointment);
router.delete("/:id", authenticate, checkAppointmentAccess, authorize("admin"), deleteAppointment);

module.exports = router;
