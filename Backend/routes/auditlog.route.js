const express = require("express");
const { authenticate } = require("../middlewares/isLogged");
const { authorize } = require("../middlewares/authorize");
const { createAuditLog, getAllAuditLogs, updateAuditLog } = require("../controllers/auditlog.controller");

const router = express.Router();

router.get("/", authenticate, authorize("admin"), getAllAuditLogs);
router.post("/", authenticate, createAuditLog);
router.put("/:id", authenticate, authorize("admin"), updateAuditLog);

module.exports = router;
