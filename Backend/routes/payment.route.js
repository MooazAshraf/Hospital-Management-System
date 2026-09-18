const express = require("express");

const router = express.Router();

const {
  createPayment,
  getAllPayments,
  updatePayment,
} = require("../controllers/payment.controller");

const { authenticate } = require("../middlewares/isLogged.js");
const { checkPaymentAccess } = require("../middlewares/checkPaymentOwner.js");

router
  .route("/")
  .get(authenticate, getAllPayments)
  .post(authenticate, createPayment);

router
  .route("/:id")
  .put(authenticate, checkPaymentAccess, updatePayment);

module.exports = router;