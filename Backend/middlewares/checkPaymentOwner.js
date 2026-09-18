const Payment = require("../models/payment.model");

const checkPaymentAccess = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    const owner = String(payment.patient) === String(req.user.userId);
    const admin = req.user.role === "admin";

    if (!owner && !admin) {
      return res.status(403).json({ success: false, message: "You are not allowed to access this payment" });
    }

    req.payment = payment;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { checkPaymentAccess };
