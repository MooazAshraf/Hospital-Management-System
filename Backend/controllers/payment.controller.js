const Payment = require("../models/payment.model");
const Appointment = require("../models/appointment.model");
const Patient = require("../models/patient.model");
const Notification = require("../models/notifications.models");

const createPayment = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ success: false, message: "Only patients can create payments" });
    }

    const { appointment, amount, method, transactionId, senderPhone, instapayUsername } = req.body;
    const patient = await Patient.findOne({ user: req.user.userId }).select("_id");
    if (!patient) return res.status(404).json({ success: false, message: "Patient profile not found" });

    const appointmentDoc = await Appointment.findById(appointment).select("patient doctor");
    if (!appointmentDoc) return res.status(404).json({ success: false, message: "Appointment not found" });
    if (String(appointmentDoc.patient) !== String(patient._id)) {
      return res.status(403).json({ success: false, message: "This appointment does not belong to you" });
    }

    const payment = await Payment.create({
      appointment,
      patient: req.user.userId,
      amount,
      method,
      transactionId,
      senderPhone,
      instapayUsername,
      status: "Pending",
    });

    res.status(201).json({ success: true, message: "Payment created successfully", data: payment });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Transaction ID already exists" });
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { patient: req.user.userId };
    if (!["admin", "user"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const payments = await Payment.find(filter)
      .populate("patient", "name email")
      .populate("appointment")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can update payment status" });
    }

    const allowed = {};
    if (req.body.status !== undefined) allowed.status = req.body.status;
    if (req.body.paidAt !== undefined) allowed.paidAt = req.body.paidAt;
    if (req.body.method !== undefined) allowed.method = req.body.method;

    if (allowed.status === "Paid" && !allowed.paidAt) allowed.paidAt = new Date();

    const payment = await Payment.findByIdAndUpdate(req.params.id, allowed, {
      new: true,
      runValidators: true,
    });

    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    if (payment.status === "Paid") {
      try {
        await Notification.create({
          recipient: payment.patient,
          sender: req.user.userId,
          type: "payment",
          title: "Payment confirmed",
          message: `Your payment of ${payment.amount} EGP has been confirmed.`,
        });
      } catch (notificationError) {
        console.error("Payment notification error:", notificationError.message);
      }
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPayment, getAllPayments, updatePayment };
