const express = require("express");
const { authenticate } = require("../middlewares/isLogged");
const { checkPaymentAccess } = require("../middlewares/checkPaymentOwner");
const { createPayment, getAllPayments, updatePayment } = require("../controllers/payment.controller");

const router = express.Router();

router.get("/", authenticate, getAllPayments);
router.post("/", authenticate, createPayment);
router.put("/:id", authenticate, checkPaymentAccess, updatePayment);

module.exports = router;
