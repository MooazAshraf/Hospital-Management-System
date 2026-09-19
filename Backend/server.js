require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { midicineRouter } = require("./routes/midicine.route");
const { medicalReportsRouter } = require("./routes/medicalReports.route");
const appointmentRoutes = require("./routes/appointment.route");
const { userRouter } = require("./routes/users.route");
const { patientRouter } = require("./routes/patient.route");
const { notificationRouter } = require("./routes/notifications.route");
const { doctorRouter } = require("./routes/doctors.route");
const reviewRouter = require("./routes/review.route");
const paymentRouter = require("./routes/payment.route");
const auditLogRouter = require("./routes/auditlog.route");
const departmentRouter = require("./routes/department.route");
const contactRouter = require("./routes/contact.route");

const app = express();

app.use(cors({ origin: true, credentials: false }));
app.options(/.*/, cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "urCare API is running",
  });
});

app.use("/api/users", userRouter);
app.use("/api/medicines", midicineRouter);
app.use("/api/medicalReports", medicalReportsRouter);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/patients", patientRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/auditLogs", auditLogRouter);

// Contact messages
app.use("/api/contact", contactRouter);

// Backward-compatible aliases used by older frontend code.
app.use("/reviews", reviewRouter);
app.use("/payments", paymentRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((error, _req, res, _next) => {
  console.error(error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    if (!process.env.DB_LINK) {
      throw new Error("DB_LINK is missing in Backend/.env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in Backend/.env");
    }

    await mongoose.connect(process.env.DB_LINK);

    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;