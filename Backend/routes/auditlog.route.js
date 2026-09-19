const express = require("express");

const {
  getAuditLogs,
  getAuditLogById,
} = require("../controllers/auditLog.controller");

const router = express.Router();

router.get("/", getAuditLogs);

router.get("/:id", getAuditLogById);

module.exports = router;