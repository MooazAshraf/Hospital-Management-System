const express = require("express");

const router = express.Router();

const {
  createPayment,
  getAllPayments,
  updatePayment,
} = require("../controllers/payment.controller");

router
  .route("/")
  .get(getAllPayments)
  .post(createPayment);

router
  .route("/:id")
  .put(updatePayment);

module.exports = router;
