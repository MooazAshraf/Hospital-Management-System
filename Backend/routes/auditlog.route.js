const express = require("express");

const router = express.Router();

const { authenticate } = require("../middlewares/isLogged");

const {
  createAuditLog,
  getAllAuditLogs,
  updateAuditLog,
} = require("../controllers/auditlog.controller");

router
  .route("/")
  .get(authenticate, getAllAuditLogs)
  .post(authenticate, createAuditLog);

router
  .route("/:id")
  .put(authenticate, updateAuditLog);

module.exports = router;