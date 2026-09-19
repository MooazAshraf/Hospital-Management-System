const express = require("express");

const {
  authenticate,
} = require("../middlewares/isLogged");

const {
  authorize,
} = require("../middlewares/authorize");

const {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
} = require("../controllers/contact.controller");

const router = express.Router();

// ==========================================
// Public
// ==========================================

router.post("/", createContactMessage);

// ==========================================
// Admin
// ==========================================

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getContactMessages
);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getContactMessageById
);

router.put(
  "/:id/status",
  authenticate,
  authorize("admin"),
  updateContactMessageStatus
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteContactMessage
);

module.exports = router;